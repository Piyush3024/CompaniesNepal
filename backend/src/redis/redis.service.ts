import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const redisUrl = this.configService.get<string>('UPSTACH_REDIS_URL');

      if (!redisUrl) {
        throw new Error(
          'UPSTACH_REDIS_URL is not defined in environment variables',
        );
      }

      this.client = new Redis(redisUrl);

      this.client.on('connect', () => {
        this.logger.log('Redis connected successfully');
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });

      // Test connection
      await this.client.ping();
      this.logger.log('Redis connection verified');
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
      this.logger.log('🔌 Redis disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Redis:', error);
    }
  }

  async set(
    key: string,
    value: string,
    expiryMode?: 'EX' | 'PX' | 'EXAT' | 'PXAT' | 'KEEPTTL',
    time?: number,
  ): Promise<void> {
    try {
      if (expiryMode && time) {
        await this.client.set(key, value, expiryMode as any, time);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Error setting Redis key ${key}:`, error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Error getting Redis key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      this.logger.error(`Error deleting Redis key ${key}:`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<number> {
    try {
      return await this.client.exists(key);
    } catch (error) {
      this.logger.error(`Error checking Redis key ${key}:`, error);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Error setting expiration on Redis key ${key}:`, error);
      throw error;
    }
  }

  getClient(): Redis {
    return this.client;
  }
}
