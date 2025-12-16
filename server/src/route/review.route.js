import express from "express";
const router = express.Router();

import {
  createReview,
  getReview,
  deleteReview,
} from "../controller/review.controller.js";
import { authorizeRoles, protectRoute } from "../middleware/middleware.js";

router.post(
  "/:id",
  protectRoute,
  authorizeRoles("admin", "seller", "buyer"),
  createReview
);
router.get(
  "/:id",
  protectRoute,
  authorizeRoles("admin", "seller", "buyer"),
  getReview
);
router.delete(
  "/delete/:id",
  protectRoute,
  authorizeRoles("admin", "seller", "buyer"),
  deleteReview
);

export default router;
