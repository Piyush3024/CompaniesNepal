import express from "express";
import dotenv from "dotenv";
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import { PrismaClient } from "@prisma/client";
import app from "./src/app.js";
import { envConfig } from "./src/config/config.js";
import pkg from "@prisma/client";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ['error'],
});

const NODE_ENV = process.env.NODE_ENV;
const IS_PRODUCTION = NODE_ENV === "production";

const setupRateLimiting = () => {
  // Global rate limiter
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: IS_PRODUCTION ? 100 : 1000,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: 'Too many requests from this IP, please try again later',
        retryAfter: Math.round(15 * 60) // 15 minutes
      });
    }
  });


  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 50,
    delayMs: () => 100
  });


  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: IS_PRODUCTION ? 5 : 50,
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later',
    },
    skipSuccessfulRequests: true,
  });

  app.use(globalLimiter);
  app.use(speedLimiter);
  app.use('/auth', authLimiter);
};

// Static files and uploads setup
const setupStaticFiles = async () => {
  const uploadsDir = path.join(__dirname, 'uploads');

  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  }

  // Serve static files with comprehensive headers
  app.use('/uploads',
    express.static(uploadsDir, {
      maxAge: IS_PRODUCTION ? '7d' : '0',
      etag: true,
      lastModified: true,
      setHeaders: (res, path, stat) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

        const ext = path.toLowerCase().split('.').pop();
        const mimeTypes = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'pdf': 'application/pdf',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'xls': 'application/vnd.ms-excel',
          'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };

        if (mimeTypes[ext]) {
          res.set('Content-Type', mimeTypes[ext]);
        }
      }
    })
  );
};

// API routes setup
const setupRoutes = () => {

  app.get('/api/health', async (req, res) => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      const healthCheck = {
        status: 'ok',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        version: process.env.APP_VERSION || '1.0.0',
        node_version: process.version,
        database: 'connected',
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        },
      };

      res.status(200).json(healthCheck);
    } catch (error) {
      res.status(503).json({
        status: 'error',
        message: 'Server is unhealthy',
        database: 'disconnected',
        error: IS_PRODUCTION ? 'Database connection failed' : error.message
      });
    }
  });


  app.get('/', (req, res) => {
    res.json({
      status: 'success',
      message: ' Management System API is running',
      environment: NODE_ENV,
      version: process.env.APP_VERSION || '1.0.0',
      endpoints: {
        health: '/api/health',
        docs: '/api/docs',
        auth: '/auth',
        users: '/users',
        courses: '/courses',
        enrollments: '/enrollments',
      }
    });
  });

  // API not found handler
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl
      });
    }
    next();
  });
};

// Enhanced error handling
const setupErrorHandling = () => {
  // Prisma error handler
  app.use((err, req, res, next) => {
    // Log error details
    console.error('Error occurred:', {
      message: err.message,
      stack: IS_PRODUCTION ? undefined : err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });

    // Handle Prisma errors
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A record with this information already exists',
        field: err.meta?.target,
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    if (err.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reference - related record not found',
      });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    // Handle multer errors (file upload)
    if (err.name === 'MulterError') {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Default error response
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: IS_PRODUCTION ? 'Internal server error' : err.message,
      ...(IS_PRODUCTION ? {} : { stack: err.stack })
    });
  });

  // 404 handler for all other routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      path: req.originalUrl
    });
  });
};

// Graceful shutdown handling
const setupGracefulShutdown = (server) => {
  const gracefulShutdown = async (signal) => {
    console.log(`\n Received ${signal}. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async (err) => {
      if (err) {
        console.error(' Error during server shutdown:', err);
        process.exit(1);
      }

      try {
        // Disconnect from database
        await prisma.$disconnect();
        console.log(' Database disconnected successfully');
        console.log('Server closed successfully');
        process.exit(0);
      } catch (error) {
        console.error(' Error disconnecting from database:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error(' Force shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    if (!IS_PRODUCTION) {
      gracefulShutdown('UNHANDLED_REJECTION');
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });
};



async function startServer() {
  try {

    // Setup rate limiting
    setupRateLimiting();

    // Setup static files
    await setupStaticFiles();

    // Setup routes (health check, etc.)
    setupRoutes();

    // Setup error handling (must be last)
    setupErrorHandling();

    // Connect to database with retry logic
    let retries = 5;
    while (retries > 0) {
      try {
        await prisma.$connect();
        console.log(' Database connection established successfully');

        // Test the connection
        await prisma.$queryRaw`SELECT 1`;
        break;
      } catch (error) {
        retries--;
        console.warn(` Database connection failed. Retries left: ${retries}`);
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      }
    }

    // Trust proxy if behind reverse proxy (Nginx, etc.)
    if (IS_PRODUCTION) {
      app.set('trust proxy', 1);
    }

    // Start server
    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => {

      console.log(` Server running on http://localhost:${port}`);
      console.log(` Environment: ${NODE_ENV}`);
      console.log(` Database: Connected`);
      console.log(` Uploads: ./uploads`);
      console.log(` Health Check: http://localhost:${port}/api/health`);

    });

    // Setup graceful shutdown
    setupGracefulShutdown(server);

  } catch (error) {
    console.error(' Unable to start server:', error);

    // Cleanup on startup failure
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error(' Error disconnecting from database:', disconnectError);
    }

    process.exit(1);
  }
}

startServer();
