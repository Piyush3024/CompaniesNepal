import jwt from "jsonwebtoken";
import pkg from "@prisma/client";
import rateLimit from "express-rate-limit";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// import pkg1 from 'express-rate-limiter';
// const {rateLimit} = pkg1;

export const isSameUser = (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = req.user;
    if (userId != user.id) {
      res.status(401).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
      return;
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      console.log("Allowed roles:", req.user.role);
      if (!allowedRoles.length === 0) {
        return res.status(403).json({
          error: " No roles provided for authorization",
          success: false,
        });
      }
      if (!req.user || !req.user.role || !req.user.role.name) {
        console.log("User role not found in request:", req.user);
        return res.status(403).json({
          error: "You are not allowed to access this resource",
          success: false,
        });
      }

      if (!allowedRoles.includes(req.user.role?.name)) {
        console.log("User role not allowed:", req.user.role.name);
        return res.status(403).json({
          error: "You are not allowed to access this resource",
          success: false,
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };
};

export const protectRoute = async (req, res, next) => {
  try {
    console.log("access token:", req.header);
    const accessToken = req.cookies.accessToken;
    console.log("accessToken :", accessToken);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token not found",
      });
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is blocked
    if (user.is_blocked) {
      // If block duration has expired, unblock the user
      if (user.blocked_until && new Date() > user.blocked_until) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            is_blocked: false,
            blocked_until: null,
          },
        });
      } else {
        // Clear tokens and force logout
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.status(403).json({
          success: false,
          message: "Your account is temporarily blocked",
          blocked_until: user.blocked_until,
          forceLogout: true,
        });
      }
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Enhanced with IP tracking
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      message: "Too many attempts. Please try again later.",
      timestamp: new Date().toISOString(),
      retryAfter: Math.ceil(15 * 60), // seconds
    });
  },
});
