import express from "express";
const router = express.Router();
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  getSubcategories,
  addSubcategory,
} from "../../controller/categories/categories.controller.js";
import {
  categoryNameRule,
  categoryDescriptionRule,
  categorySlugRule,
} from "../../middleware/validation/categories/category.validation.rules.js";
import {
  handleCatgoryValidationErros,
  validateCategoryFileUpload,
} from "../../middleware/validation/categories/category.middlware.js";

import { uploadSingle } from "../../config/multer.config.js";
import { uploadCategories } from "../../middleware/file/multer.middleware.js";
import { authorizeRoles, protectRoute } from "../../middleware/middleware.js";

// get category by id
router.get(
  "/:id",
  protectRoute,
  authorizeRoles("seller", "admin", "buyer"),
  handleCatgoryValidationErros,
  getCategoryById
);

// get all categories
router.get(
  "/",
  protectRoute,
  authorizeRoles("seller", "admin", "buyer"),
  handleCatgoryValidationErros,
  getCategories
);
// create a category
router.post(
  "/",
  protectRoute,
  authorizeRoles("seller", "admin"),
  uploadCategories,
  categoryNameRule(),
  validateCategoryFileUpload,
  handleCatgoryValidationErros,
  createCategory
);

// update category
router.patch(
  "/:id",
  uploadSingle,
  protectRoute,
  authorizeRoles("seller"),
  validateCategoryFileUpload,
  handleCatgoryValidationErros,
  updateCategory
);

// delete category
router.delete(
  "/:id",
  protectRoute,
  authorizeRoles("seller"),
  handleCatgoryValidationErros,
  deleteCategory
);

// get subcategories of a category
router.get(
  "/:parentId/subcategories",
  protectRoute,
  authorizeRoles("seller", "admin", "buyer"),
  getSubcategories
);
// add subcategory to a category
router.post(
  "/:parentId/subcategories",
  protectRoute,
  authorizeRoles("seller", "admin"),
  // categoryNameRule(),
  // categoryDescriptionRule(),
  // categorySlugRule(),
  // handleCatgoryValidationErros,
  addSubcategory
);

export default router;
