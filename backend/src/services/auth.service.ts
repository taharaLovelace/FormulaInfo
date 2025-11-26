/**
 * @fileoverview Serviço de autenticação e gerenciamento de usuários
 * @description Este módulo implementa toda a lógica de autenticação,
 * incluindo registro, login, logout, refresh de tokens e validação.
 * Utiliza JWT para tokens e Redis para armazenamento de refresh tokens.
 * 
 * @module auth.service
 * @requires bcryptjs
 * @requires jsonwebtoken
 * @requires @prisma/client
 */

import bcrypt from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/config';
import { redisService } from './redis.service';
import { logger } from '../utils/logger';

// ==================== INTERFACES ====================

/**
 * Payload do JWT de acesso
 * @interface JwtPayload
 */
export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
  /** JWT ID para rastreamento e invalidação */
  jti?: string;
}

/**
 * Payload do refresh token
 * @interface RefreshTokenPayload
 */
export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

/**
 * Par de tokens de autenticação
 * @interface AuthTokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Dados básicos do usuário (retornado no login/register)
 * Não inclui informações sensíveis
 * @interface BasicUser
 */
export interface BasicUser {
  id: string;
  username: string;
  email: string;
  name: string;
}

/**
 * Dados completos do usuário (retornado na rota /profile)
 * Inclui preferências e informações detalhadas
 * @interface SafeUser
 */
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

/**
 * Resposta de autenticação básica (login/register)
 * @interface BasicAuthResponse
 */
export interface BasicAuthResponse {
  user: BasicUser;
  tokens: AuthTokens;
}

/**
 * Resposta de autenticação completa (para compatibilidade)
 * @interface SafeAuthResponse
 */
export interface SafeAuthResponse {
  user: SafeUser;
  tokens: AuthTokens;
}

/**
 * Dados para registro de novo usuário
 * @interface UserRegistrationData
 */
export interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
  name: string;
  birthDate?: Date;
  favoriteTeamId?: number;
  favoriteDriverId?: number;
}

/**
 * Dados para login
 * @interface UserLoginData
 */
export interface UserLoginData {
  /** Email ou username */
  identifier: string;
  password: string;
}

/**
 * Serviço principal de autenticação
 * @class AuthService
 */
class AuthService {
  /**
   * Cria uma instância do AuthService
   * @param {PrismaClient} prisma - Cliente Prisma para operações de banco
   */
  constructor(
    private prisma: PrismaClient
  ) {}

  // ==================== MÉTODOS DE SENHA ====================

  /**
   * Gera hash de uma senha usando bcrypt
   * @param {string} password - Senha em texto plano
   * @returns {Promise<string>} Hash da senha
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica se uma senha corresponde ao hash
   * @param {string} password - Senha em texto plano
   * @param {string} hashedPassword - Hash armazenado
   * @returns {Promise<boolean>} True se a senha corresponder
   */
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // ==================== MÉTODOS DE CONVERSÃO ====================

  /**
   * Converte um objeto de usuário em BasicUser (dados mínimos)
   * @param {any} user - Objeto do usuário do Prisma
   * @returns {BasicUser} Usuário com dados básicos apenas
   */
  public toBasicUser(user: any): BasicUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    };
  }

  /**
   * Converte um objeto de usuário em SafeUser (sem dados sensíveis)
   * @param {any} user - Objeto do usuário do Prisma com includes
   * @returns {SafeUser} Usuário seguro com preferências
   */
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

  // ==================== MÉTODOS DE TOKEN ====================

  /**
   * Gera par de tokens JWT (access e refresh)
   * @param {string} userId - ID do usuário
   * @param {string} username - Nome de usuário
   * @param {string} email - Email do usuário
   * @returns {Promise<AuthTokens>} Par de tokens gerados
   */
  async generateTokens(userId: string, username: string, email: string): Promise<AuthTokens> {
    // Gera IDs únicos para rastreamento dos tokens
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

    // Armazena refresh token no Redis
    const refreshExpiresInSeconds = this.parseTimeToSeconds(config.jwt.refreshExpiresIn);
    await redisService.setRefreshToken(userId, refreshToken, refreshExpiresInSeconds);

    return { accessToken, refreshToken };
  }

  // ==================== MÉTODOS DE AUTENTICAÇÃO ====================

  /**
   * Registra um novo usuário no sistema
   * @param {UserRegistrationData} userData - Dados do novo usuário
   * @returns {Promise<BasicAuthResponse>} Usuário criado e tokens
   * @throws {Error} Se email ou username já estiverem em uso
   */
  async register(userData: UserRegistrationData): Promise<BasicAuthResponse> {
    // Verifica se já existe usuário com mesmo email ou username
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

    // Gera hash da senha
    const hashedPassword = await this.hashPassword(userData.password);

    // Cria o usuário no banco
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

    // Gera tokens de autenticação
    const tokens = await this.generateTokens(user.id, user.username, user.email);
    const basicUser = this.toBasicUser(user);

    logger.info(`Novo usuário registrado: ${user.username} (${user.email})`);

    return { user: basicUser, tokens };
  }

  /**
   * Realiza login do usuário
   * @param {UserLoginData} loginData - Credenciais de login
   * @returns {Promise<BasicAuthResponse>} Usuário e tokens
   * @throws {Error} Se as credenciais forem inválidas
   */
  async login(loginData: UserLoginData): Promise<BasicAuthResponse> {
    // Busca usuário por email ou username
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

    // Verifica a senha
    const isPasswordValid = await this.verifyPassword(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Gera novos tokens
    const tokens = await this.generateTokens(user.id, user.username, user.email);
    const basicUser = this.toBasicUser(user);

    logger.info(`Usuário logado: ${user.username} (${user.email})`);

    return { user: basicUser, tokens };
  }

  /**
   * Renova os tokens de autenticação usando o refresh token
   * @param {string} refreshToken - Refresh token válido
   * @returns {Promise<AuthTokens>} Novos tokens
   * @throws {Error} Se o refresh token for inválido
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verifica e decodifica o refresh token
      const payload = verify(refreshToken, config.jwt.secret) as RefreshTokenPayload;
      
      // Verifica se o token existe no Redis
      const storedToken = await redisService.getRefreshToken(payload.userId);
      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Token de refresh inválido');
      }

      // Busca dados do usuário
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
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

      // Gera novos tokens (substitui automaticamente o refresh token no Redis)
      const newTokens = await this.generateTokens(user.id, user.username, user.email);

      logger.info(`Token renovado para usuário: ${user.username}`);

      return newTokens;
    } catch (error) {
      throw new Error('Token de refresh inválido');
    }
  }

  /**
   * Realiza logout do usuário
   * @param {string} userId - ID do usuário
   * @param {string} [accessTokenJti] - JTI do access token para blacklist
   * @returns {Promise<void>}
   */
  async logout(userId: string, accessTokenJti?: string): Promise<void> {
    // Remove refresh token do Redis
    await redisService.deleteRefreshToken(userId);

    // Adiciona access token à blacklist se fornecido
    if (accessTokenJti) {
      const accessExpiresInSeconds = this.parseTimeToSeconds(config.jwt.expiresIn);
      await redisService.blacklistToken(accessTokenJti, accessExpiresInSeconds);
    }

    logger.info(`Usuário deslogado: ${userId}`);
  }

  // ==================== MÉTODOS DE VERIFICAÇÃO ====================

  /**
   * Verifica e decodifica um access token
   * @param {string} token - Access token
   * @returns {Promise<JwtPayload>} Payload decodificado
   * @throws {Error} Se o token for inválido ou estiver na blacklist
   */
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const payload = verify(token, config.jwt.secret) as JwtPayload;
      
      // Verifica se o token está na blacklist
      if (payload.jti && await redisService.isTokenBlacklisted(payload.jti)) {
        throw new Error('Token inválido');
      }

      return payload;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  /**
   * Verifica e decodifica um refresh token
   * @param {string} token - Refresh token
   * @returns {Promise<RefreshTokenPayload>} Payload decodificado
   * @throws {Error} Se o token for inválido
   */
  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const payload = verify(token, config.jwt.secret) as RefreshTokenPayload;
      return payload;
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  /**
   * Busca usuário por ID (dados seguros)
   * @param {string} userId - ID do usuário
   * @returns {Promise<SafeUser>} Dados do usuário com preferências
   * @throws {Error} Se o usuário não for encontrado
   */
  async getUserById(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Converte string de tempo para segundos
   * @private
   * @param {string} timeString - String no formato "15m", "7d", etc.
   * @returns {number} Tempo em segundos
   * @throws {Error} Se o formato for inválido
   * 
   * @example
   * parseTimeToSeconds('15m') // 900
   * parseTimeToSeconds('7d')  // 604800
   */
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