import { body, param, query } from "express-validator";
import {
  CATEGORY_DESCRIPTION_CONFIG,
  CATEGORY_NAME_CONFIG,
  CATEGORY_SLUG_CONFIG,
} from "./category.validation.constant.js";

// Category name validation rules
export const categoryNameRule = (isRequired = true) => {
  const rule = body("name")
    .trim()
    .isString()
    .withMessage("Category name must be a string")
    .isLength({
      min: CATEGORY_NAME_CONFIG.MIN_LENGTH,
      max: CATEGORY_NAME_CONFIG.MAX_LENGTH,
    })
    .withMessage(CATEGORY_NAME_CONFIG.MESSAGE)
    .matches(CATEGORY_NAME_CONFIG.REGEX)
    .escape();
  return isRequired
    ? rule.notEmpty().withMessage("Category name is required")
    : rule.optional();
};

// category description validation rules
export const categoryDescriptionRule = (isRequired = true) => {
  const rule = body("description")
    .trim()
    .isString()
    .if(
      (body) =>
        isRequired ||
        body("description").exists({
          checkFalsy: false,
        })
    )
    .isLength({
      min: CATEGORY_DESCRIPTION_CONFIG.MIN_LENGTH,
      max: CATEGORY_DESCRIPTION_CONFIG.MAX_LENGTH,
    })
    .withMessage(CATEGORY_DESCRIPTION_CONFIG.MESSAGE);
  return isRequired
    ? rule.notEmpty().withMessage("Category description is required")
    : rule.optional({
        checkFalsy: true,
      });
};

// Category Slug Validation Rules
export const categorySlugRule = (isRequired = true) => {
  const rule = body("slug")
    .trim()
    .if(
      (body) =>
        isRequired ||
        body("slug").exists({
          checkFalsy: false,
        })
    )
    .isLength({
      max: CATEGORY_SLUG_CONFIG.MAX_LENGTH,
    })
    .withMessage(CATEGORY_SLUG_CONFIG.MESSAGE)
    .matches(CATEGORY_SLUG_CONFIG.REGEX);

  return isRequired
    ? rule.notEmpty().withMessage("Category slug is required")
    : rule.optional({
        checkFalsy: true,
      });
};


// Query Pagination Rules for a categories
export const paginationQueryRulesForCategories = () => [
  query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
  query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
];

// Query Sort Rules
export const sortQueryRules = () => [
  query('sortBy')
      .optional()
      .isString()
      .withMessage('Sort field must be a string')
      .trim(),
  query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be either "asc" or "desc"')
      .trim(),
];

// Search Query Validation
export const searchQueryRule = () =>
  query('query')
      .optional()
      .isString()
      .withMessage('Search query must be a string')
      .trim()
      .isLength({ max: 255 })
      .withMessage('Search query must not exceed 255 characters');
