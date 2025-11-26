import bcrypt from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
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

// 🛡️ Interface para usuário básico (retornado no login/register)
export interface BasicUser {
  id: string;
  username: string;
  email: string;
  name: string;
}

// 🛡️ Interface para usuário completo (retornado na rota /profile)
export interface SafeUser {
  id: string;
  username: string;
  email: string;
  name: string;
  birthDate?: Date | null;
  favoriteTeamId?: number | null;
  favoriteDriverId?: number | null;
  favoriteTeam?: {
    id: number;
    name: string;
    fullName?: string | null;
    logoUrl?: string | null;
    carImageUrl?: string | null;
    teamColor?: string | null;
    country?: string | null;
  } | null;
  favoriteDriver?: {
    id: number;
    fullName: string;
    driverNumber?: number | null;
    imageUrl?: string | null;
  } | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 🛡️ Interface para resposta de autenticação básica (login/register)
export interface BasicAuthResponse {
  user: BasicUser;
  tokens: AuthTokens;
}

// 🛡️ Interface para resposta de autenticação completa (para compatibilidade)
export interface SafeAuthResponse {
  user: SafeUser;
  tokens: AuthTokens;
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

  // 🛡️ Converter User em BasicUser (apenas dados básicos para login/register)
  public toBasicUser(user: any): BasicUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    };
  }

  // 🛡️ Converter User em SafeUser (sem dados sensíveis)
  public toSafeUser(user: any): SafeUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      birthDate: user.birthDate,
      favoriteTeamId: user.favoriteTeamId,
      favoriteDriverId: user.favoriteDriverId,
      favoriteTeam: user.favoriteTeam ? {
        id: user.favoriteTeam.id,
        name: user.favoriteTeam.name,
        fullName: user.favoriteTeam.fullName,
        logoUrl: user.favoriteTeam.logoUrl,
        carImageUrl: user.favoriteTeam.carImageUrl,
        teamColor: user.favoriteTeam.teamColor,
        country: user.favoriteTeam.country,
      } : null,
      favoriteDriver: user.favoriteDriver ? {
        id: user.favoriteDriver.id,
        fullName: user.favoriteDriver.fullName,
        driverNumber: user.favoriteDriver.driverNumber,
        imageUrl: user.favoriteDriver.imageUrl,
      } : null,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Generate JWT tokens
  async generateTokens(userId: string, username: string, email: string): Promise<AuthTokens> {
    const jti = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const refreshTokenId = `${userId}_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const jwtSecret = process.env.JWT_SECRET || config.jwt.secret;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || config.jwt.expiresIn;
    const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || config.jwt.refreshExpiresIn;
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não configurado');
    }

    // Access Token (short-lived)
    // @ts-ignore - JWT types issue
    const accessToken = sign(
      { 
        userId, 
        username, 
        email, 
        jti 
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    // Refresh Token (long-lived)
    // @ts-ignore - JWT types issue
    const refreshToken = sign(
      { 
        userId, 
        tokenId: refreshTokenId 
      },
      jwtSecret,
      { expiresIn: jwtRefreshExpiresIn }
    );

    // Store refresh token in Redis
    const refreshExpiresInSeconds = this.parseTimeToSeconds(config.jwt.refreshExpiresIn);
    await redisService.setRefreshToken(userId, refreshToken, refreshExpiresInSeconds);

    return { accessToken, refreshToken };
  }

  // Register new user
  async register(userData: UserRegistrationData): Promise<BasicAuthResponse> {
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
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.username, user.email);

    // 🛡️ Retornar apenas dados básicos do usuário
    const basicUser = this.toBasicUser(user);

    logger.info(`Novo usuário registrado: ${user.username} (${user.email})`);

    return { user: basicUser, tokens };
  }

  // Login user
  async login(loginData: UserLoginData): Promise<BasicAuthResponse> {
    // Find user by email or username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: loginData.identifier },
          { username: loginData.identifier }
        ]
      },
    });

    if (!user || !user.isActive) {
      throw new Error('Credenciais inválidas');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.username, user.email);

    // 🛡️ Retornar apenas dados básicos do usuário
    const basicUser = this.toBasicUser(user);

    logger.info(`Usuário logado: ${user.username} (${user.email})`);

    return { user: basicUser, tokens };
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = verify(refreshToken, config.jwt.secret) as RefreshTokenPayload;
      
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
      const payload = verify(token, config.jwt.secret) as JwtPayload;
      
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
      const payload = verify(token, config.jwt.secret) as RefreshTokenPayload;
      return payload;
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  // 🛡️ Get user by ID (dados seguros apenas)
  async getUserById(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId
      },
      include: {
        favoriteTeam: {
          select: {
            id: true,
            name: true,
            fullName: true,
            logoUrl: true,
            carImageUrl: true,
            teamColor: true,
            country: true,
          }
        },
        favoriteDriver: {
          select: {
            id: true,
            fullName: true,
            driverNumber: true,
            imageUrl: true,
          }
        }
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return this.toSafeUser(user);
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