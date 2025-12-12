import express from "express";
const router = express.Router();

import {
  createReview,
  getReview,
  deleteReview,
} from "../controller/review.controller.js";
import { authorizeRoles, verifyToken } from "../middleware/middleware.js";

router.post(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "seller", "buyer"),
  createReview
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "seller", "buyer"),
  getReview
);
router.delete(
  "/delete/:id",
  verifyToken,
  authorizeRoles("admin", "seller", "buyer"),
  deleteReview
);

export default router;
