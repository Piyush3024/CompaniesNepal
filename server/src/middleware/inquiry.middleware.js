import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import sanitizeHtml from "sanitize-html";

const inquiryRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many inquires submitted.Please try again!",
    retryAfter: 15 * 60 * 1000,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const validationInquiry = [
  body("name")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters."),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email format.")
    .normalizeEmail()
    .isLength({
      max: 100,
    }),
  body("message")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Message must be between 10 and 2000 characters."),
  body("phone")
    .optional()
    .trim()
    .isLength({ min: 10, max: 10 })
    .matches(/^\+?[\d\s\-\(\)]+$/),
  body("inquiry_type_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Inquiry type ID must be valid Integers"),
  body("attachment_url")
    .optional()
    .isURL()
    .withMessage("Attachment URL must be valid URL"),
];

const validationErrors = (req, res, next) => {
  const errors = validationErrors(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

const sanitizeInquiry = (req, res, next) => {
  if (req.body.message) {
    req.body.message -
      sanitizeHtml(req.body.message, {
        allowedTags: [],
        allowedAttributes: {},
      });
  }

  const stringFields = ["name", "email", "phone", "message"];
  stringFields.forEach((field) => {
    if (req.body[field] && typeof req.body[field] === "string") {
      req.body[field] = sanitizeHtml(req.body[field], {
        allowedTags: [],
        allowedAttributes: {},
      });
    }
  });
  next();
};
