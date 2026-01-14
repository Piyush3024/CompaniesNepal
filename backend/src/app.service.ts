import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}
  async healthCheck() {
    const NODE_ENV = this.configService.get<string>('NODE_ENV');
    const IS_PRODUCTION = NODE_ENV === 'production';

    try {
      await this.prisma.$queryRaw`SELECT 1`;

      const memoryUsage = process.memoryUsage();

      return {
        status: 'ok',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        version: this.configService.get<string>('APP_VERSION') || '1.0.0',
        node_version: process.version,
        database: 'connected',
        memory: {
          used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        },
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(
          {
            status: 'error',
            message: 'Server is unhealthy',
            database: 'disconnected',
            error: IS_PRODUCTION ? 'Database connection failed' : error.message,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        throw new HttpException(
          {
            status: 'error',
            message: 'Server is unhealthy',
            database: 'disconnected',
            error: error,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }
  }
}
