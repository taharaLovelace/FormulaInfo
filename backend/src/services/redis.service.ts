import Redis from 'ioredis';
import { config } from '../config/config';
import { logger } from '../utils/logger';

class RedisService {
  private client: Redis;
  private isConnected = false;

  constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryDelayOnFailover: 100,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
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

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  // Refresh Token Operations
  async setRefreshToken(userId: string, token: string, expiresInSeconds: number): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.client.setex(key, expiresInSeconds, token);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    const key = `refresh_token:${userId}`;
    return await this.client.get(key);
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.client.del(key);
  }

  async deleteAllRefreshTokens(userId: string): Promise<void> {
    const pattern = `refresh_token:${userId}*`;
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  // Token Blacklist Operations (para logout de access tokens)
  async blacklistToken(tokenId: string, expiresInSeconds: number): Promise<void> {
    const key = `blacklist:${tokenId}`;
    await this.client.setex(key, expiresInSeconds, '1');
  }

  async isTokenBlacklisted(tokenId: string): Promise<boolean> {
    const key = `blacklist:${tokenId}`;
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  // Rate Limiting Operations
  async incrementRateLimit(key: string, windowInSeconds: number): Promise<number> {
    const pipeline = this.client.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowInSeconds);
    const results = await pipeline.exec();
    return results?.[0]?.[1] as number || 0;
  }

  // Health Check
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  get isHealthy(): boolean {
    return this.isConnected;
  }
}

export const redisService = new RedisService();