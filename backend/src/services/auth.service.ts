import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/config';
import { redisService } from './redis.service';
import { logger } from '../utils/logger';

export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
  jti?: string; // JWT ID for tracking
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
  name: string;
  birthDate?: Date;
  favoriteTeamId?: number;
  favoriteDriverId?: number;
}

export interface UserLoginData {
  identifier: string; // email ou username
  password: string;
}

class AuthService {
  constructor(
    private prisma: PrismaClient
  ) {}

  // Hash password
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT tokens
  async generateTokens(userId: string, username: string, email: string): Promise<AuthTokens> {
    const jti = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const refreshTokenId = `${userId}_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Access Token (short-lived)
    const accessToken = jwt.sign(
      { 
        userId, 
        username, 
        email, 
        jti 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Refresh Token (long-lived)
    const refreshToken = jwt.sign(
      { 
        userId, 
        tokenId: refreshTokenId 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    // Store refresh token in Redis
    const refreshExpiresInSeconds = this.parseTimeToSeconds(config.jwt.refreshExpiresIn);
    await redisService.setRefreshToken(userId, refreshToken, refreshExpiresInSeconds);

    return { accessToken, refreshToken };
  }

  // Register new user
  async register(userData: UserRegistrationData): Promise<{ user: any; tokens: AuthTokens }> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { username: userData.username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new Error('Email já está em uso');
      }
      throw new Error('Nome de usuário já está em uso');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(userData.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        birthDate: userData.birthDate,
        favoriteTeamId: userData.favoriteTeamId,
        favoriteDriverId: userData.favoriteDriverId,
      }
    });

    // Get created user with relationships
    const userWithRelations = await this.getUserById(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.username, user.email);

    logger.info(`Novo usuário registrado: ${user.username} (${user.email})`);

    return { user: userWithRelations, tokens };
  }

  // Login user
  async login(loginData: UserLoginData): Promise<{ user: any; tokens: AuthTokens }> {
    // Find user by email or username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: loginData.identifier },
          { username: loginData.identifier }
        ]
      }
    });

    if (!user || !user.isActive) {
      throw new Error('Credenciais inválidas');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Get user with relationships
    const userWithRelations = await this.getUserById(user.id);

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.username, user.email);

    logger.info(`Usuário logado: ${user.username} (${user.email})`);

    return { user: userWithRelations, tokens };
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, config.jwt.secret) as RefreshTokenPayload;
      
      // Check if refresh token exists in Redis
      const storedToken = await redisService.getRefreshToken(payload.userId);
      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Token de refresh inválido');
      }

      // Get user data
      const user = await this.prisma.user.findUnique({
        where: { 
          id: payload.userId
        },
        select: {
          id: true,
          username: true,
          email: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        throw new Error('Usuário não encontrado');
      }

      // Generate new tokens (automatically replaces old refresh token in Redis)
      const newTokens = await this.generateTokens(user.id, user.username, user.email);

      logger.info(`Token renovado para usuário: ${user.username}`);

      return newTokens;
    } catch (error) {
      throw new Error('Token de refresh inválido');
    }
  }

  // Logout user
  async logout(userId: string, accessTokenJti?: string): Promise<void> {
    // Remove refresh token from Redis
    await redisService.deleteRefreshToken(userId);

    // Blacklist access token if provided
    if (accessTokenJti) {
      const accessExpiresInSeconds = this.parseTimeToSeconds(config.jwt.expiresIn);
      await redisService.blacklistToken(accessTokenJti, accessExpiresInSeconds);
    }

    logger.info(`Usuário deslogado: ${userId}`);
  }

  // Verify access token
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      // Check if token is blacklisted
      if (payload.jti && await redisService.isTokenBlacklisted(payload.jti)) {
        throw new Error('Token inválido');
      }

      return payload;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  // Verify refresh token
  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as RefreshTokenPayload;
      return payload;
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        birthDate: true,
        favoriteTeamId: true,
        favoriteDriverId: true,
        favoriteTeam: true,
        favoriteDriver: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  // Helper method to parse time strings to seconds
  private parseTimeToSeconds(timeString: string): number {
    const regex = /^(\d+)([smhd])$/;
    const match = timeString.match(regex);
    
    if (!match) {
      throw new Error(`Formato de tempo inválido: ${timeString}`);
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: throw new Error(`Unidade de tempo inválida: ${unit}`);
    }
  }
}

export { AuthService };