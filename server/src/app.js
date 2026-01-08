import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import session from "express-session";
import passport from "../src/config/passport.js";

const app = express();
app.use(express.json());

import authRoutes from "../src/route/auth/auth.route.js";
import locationRoutes from "../src/route/location/location.route.js";
import companyRoutes from "../src/route/company/company.route.js";
import userRoutes from "../src/route/user.route.js";
import categoriesRoutes from "../src/route/categories/categories.route.js";
import inquiriesRoutes from "../src/route/inquiries.route.js";
import reviewsRoutes from "../src/route/review.route.js";
import productsRoutes from "../src/route/products.route.js";

app.use(cookieParser());
const NODE_ENV = process.env.NODE_ENV;

app.use(
  session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const IS_PRODUCTION = NODE_ENV === "production";


if (!IS_PRODUCTION) {
  app.use(morgan("dev"));
} else {
  // Production logging with more details
  app.use(
    morgan("combined", {
      skip: (req, res) => res.statusCode < 400, // Only log errors in production
    })
  );
}

const setupLogging = () => {

  if (!IS_PRODUCTION) {
    // Development: detailed logging
    app.use(morgan('dev'));
  } else {
    // Production: log only errors
    app.use(morgan('combined', {
      skip: (req, res) => res.statusCode < 400
    }));
  }
};


const setupSecurity = () => {
  
  // Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: IS_PRODUCTION ? undefined : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Enhanced CORS configuration
  const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean);

  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, curl, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        callback(null, true);
      } else if (!IS_PRODUCTION) {
        // In development, allow localhost on any port
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          callback(null, true);
        } else {
          console.warn(` CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        console.warn(` CORS blocked origin: ${origin}`);
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
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));

  // // Handle preflight requests
  // app.options('/*', cors());
};

const setupMiddleware = () => {

  // Compression middleware
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: IS_PRODUCTION ? 6 : 1,
    threshold: 1024, // Only compress responses > 1KB
  }));

  // Body parsing with size limits
  app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        res.status(400).json({
          success: false,
          message: 'Invalid JSON format',
        });
        throw new Error('Invalid JSON');
      }
    }
  }));

  app.use(express.urlencoded({
    extended: true,
    limit: '10mb',
    parameterLimit: 1000
  }));

  // Cookie parser with secret
  app.use(cookieParser(process.env.COOKIE_SECRET || 'your-secret-key'));
};


const setupRequestTracking = () => {
 
  // Add request ID for tracking
  app.use((req, res, next) => {
    req.id = Math.random().toString(36).substring(7);
    res.setHeader('X-Request-Id', req.id);
    next();
  });

  // Log incoming requests in development
  if (!IS_PRODUCTION) {
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${req.id}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
      });
      next();
    });
  }
};

const setupRoutes = () => {
  app.use("/auth", authRoutes);
  app.use("/location", locationRoutes);
  app.use("/companies", companyRoutes);
  app.use("/user", userRoutes);
  app.use("/categories", categoriesRoutes);
  app.use("/products", productsRoutes);
  app.use("/inquiries", inquiriesRoutes);
  app.use("/reviews", reviewsRoutes);
};

const setupSecurityHeaders = () => {

  app.use((req, res, next) => {
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    if (IS_PRODUCTION) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    next();
  });
};

const initializeApp = () => {
  console.log('Initializing Express application...');
  
  // Setup in order of importance
  setupLogging();
  setupSecurity();
  setupSecurityHeaders();
  setupMiddleware();
  setupRequestTracking();
  setupRoutes();
  
  console.log(' Express application initialized');
};

initializeApp();

export default app;
