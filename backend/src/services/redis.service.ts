/**
 * @fileoverview Serviço de gerenciamento de conexão Redis
 * @description Este módulo encapsula todas as operações com Redis,
 * incluindo gerenciamento de refresh tokens, blacklist de tokens
 * e rate limiting.
 * 
 * @module redis.service
 * @requires ioredis
 */

import Redis from 'ioredis';
import { config } from '../config/config';
import { logger } from '../utils/logger';

/**
 * Serviço singleton para operações com Redis
 * @class RedisService
 */
class RedisService {
  /** Cliente Redis */
  private client: Redis;
  
  /** Estado da conexão */
  private isConnected = false;

  /**
   * Cria uma instância do RedisService
   * Configura o cliente Redis com lazy connect e retry automático
   */
  constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    this.setupEventListeners();
  }

  /**
   * Configura os event listeners para monitorar a conexão
   * @private
   */
  private setupEventListeners(): void {
    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis connected successfully');
    });

    this.client.on('error', (error: Error) => {
      this.isConnected = false;
      logger.error(`Redis connection error: ${error.message}`);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis connection closed');
    });
  }

  /**
   * Estabelece conexão com o Redis
   * @returns {Promise<void>}
   * @throws {Error} Se a conexão falhar
   */
  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        logger.error(`Failed to connect to Redis: ${error}`);
        throw error;
      }
    }
  }

  /**
   * Encerra a conexão com o Redis
   * @returns {Promise<void>}
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  // ==================== OPERAÇÕES DE REFRESH TOKEN ====================

  /**
   * Armazena um refresh token para um usuário
   * @param {string} userId - ID do usuário
   * @param {string} token - Refresh token
   * @param {number} expiresInSeconds - Tempo de expiração em segundos
   * @returns {Promise<void>}
   */
  async setRefreshToken(userId: string, token: string, expiresInSeconds: number): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.client.setex(key, expiresInSeconds, token);
  }

  /**
   * Obtém o refresh token de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<string | null>} Token ou null se não existir
   */
  async getRefreshToken(userId: string): Promise<string | null> {
    const key = `refresh_token:${userId}`;
    return await this.client.get(key);
  }

  /**
   * Remove o refresh token de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<void>}
   */
  async deleteRefreshToken(userId: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.client.del(key);
  }

  /**
   * Remove todos os refresh tokens de um usuário
   * Útil para logout de todas as sessões
   * @param {string} userId - ID do usuário
   * @returns {Promise<void>}
   */
  async deleteAllRefreshTokens(userId: string): Promise<void> {
    const pattern = `refresh_token:${userId}*`;
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  // ==================== OPERAÇÕES DE BLACKLIST ====================

  /**
   * Adiciona um token à blacklist (para invalidação no logout)
   * @param {string} tokenId - ID único do token (JTI)
   * @param {number} expiresInSeconds - Tempo até o token expirar naturalmente
   * @returns {Promise<void>}
   */
  async blacklistToken(tokenId: string, expiresInSeconds: number): Promise<void> {
    const key = `blacklist:${tokenId}`;
    await this.client.setex(key, expiresInSeconds, '1');
  }

  /**
   * Verifica se um token está na blacklist
   * @param {string} tokenId - ID único do token (JTI)
   * @returns {Promise<boolean>} True se estiver na blacklist
   */
  async isTokenBlacklisted(tokenId: string): Promise<boolean> {
    const key = `blacklist:${tokenId}`;
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  // ==================== OPERAÇÕES DE RATE LIMITING ====================

  /**
   * Incrementa o contador de rate limit para uma chave
   * @param {string} key - Chave de identificação (ex: IP do cliente)
   * @param {number} windowInSeconds - Janela de tempo em segundos
   * @returns {Promise<number>} Número atual de requisições
   */
  async incrementRateLimit(key: string, windowInSeconds: number): Promise<number> {
    const pipeline = this.client.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowInSeconds);
    const results = await pipeline.exec();
    return results?.[0]?.[1] as number || 0;
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Verifica se o Redis está respondendo
   * @returns {Promise<boolean>} True se o ping for bem-sucedido
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  /**
   * Getter para verificar o estado da conexão
   * @returns {boolean} Estado da conexão
   */
  get isHealthy(): boolean {
    return this.isConnected;
  }
}

/** Instância singleton do serviço Redis */
export const redisService = new RedisService();