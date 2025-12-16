import express from "express";
import { authorizeRoles,protectRoute } from "../middleware/middleware.js";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleIsFeatured,
  fetchProductById,
  getFeaturedProductsByCategory,
  getProductsWithLowStock,
} from "../controller/products.controller.js";
const router = express.Router();

router.get("/", fetchProducts);
router.post("/",protectRoute,authorizeRoles("admin", "seller"),createProduct);

// Get categories with their featured products
router.get("/categories/featured-products/:categoryId", getFeaturedProductsByCategory);


// Get products with unit less than zero
router.get("/unit-negative", getProductsWithLowStock);

router.patch("/toogleIsFeatured/:id",protectRoute,authorizeRoles("admin", "seller"),toggleIsFeatured);

router.get("/:id", fetchProductById);
router.patch("/:id",protectRoute,authorizeRoles("admin", "seller"),updateProduct);
router.delete("/:id",protectRoute,authorizeRoles("admin", "seller"),deleteProduct);

export default router;