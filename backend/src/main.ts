import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { NextFunction, Response, Request } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const NODE_ENV = process.env.NODE_ENV || 'development';
  const IS_PRODUCTION = NODE_ENV === 'production';
  const PORT = process.env.PORT || 5000;

  app.use(
    helmet({
      contentSecurityPolicy: IS_PRODUCTION ? undefined : false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        callback(null, true);
      } else if (!IS_PRODUCTION) {
        // In development, allow localhost on any port
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          callback(null, true);
        } else {
          logger.warn(`CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        logger.warn(` CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'X-API-Key',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use(
    compression({
      filter: (req: Request, res: Response) => {
        if (req.headers?.['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: IS_PRODUCTION ? 6 : 1,
      threshold: 1024,
    }),
  );

  app.use(cookieParser(process.env.COOKIE_SECRET || 'secret'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('X-Powered-By');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    if (IS_PRODUCTION) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      );
    }

    next();
  });

  const gracefulShutdown = async (signal: string) => {
    logger.log(`\nReceived ${signal}. Starting graceful shutdown...`);

    try {
      await app.close();
      logger.log(' Application closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error(' Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => {
    gracefulShutdown('SIGTERM');
  });

  process.on('SIGINT', () => {
    gracefulShutdown('SIGINT');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    if (!IS_PRODUCTION) {
      gracefulShutdown('UNHANDLED_REJECTION');
    }
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });

  await app.listen(process.env.PORT ?? 5000);

  logger.log(`Server running on http://localhost:${PORT}`);
  logger.log(`Environment: ${NODE_ENV}`);
  logger.log(` Database: Connected`);
  logger.log(`Health Check: http://localhost:${PORT}/api/health`);
}
bootstrap();
