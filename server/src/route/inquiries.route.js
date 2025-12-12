import express from "express";
const router = express.Router();

import {
  createInquiry,
  getInquiriesForCompany,
  deleteInquiryFromCompanyView,
  getInquiriesForUser,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
} from "../controller/inquiry.controller.js";
import { authorizeRoles, verifyToken } from "../middleware/middleware.js";

router.post("/create-inquiry", verifyToken, createInquiry);
router.get("/company/:companyId", getInquiriesForCompany);
router.delete(
  "/company/:companyId/inquiry/:inquiryId",
  deleteInquiryFromCompanyView
);
router.get("/user/:userId", verifyToken, getInquiriesForUser);
router.get("/:inquiryId", getInquiryById);
router.patch("/update-inquiry/:inquiryId", updateInquiry);
router.delete(
  "/delete-inquiry/:inquiryId",
  verifyToken,
  authorizeRoles("admin"),
  deleteInquiry
);

export default router;
