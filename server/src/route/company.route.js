import express from "express";
import { authorizeRoles } from "../middleware/middleware.js";
const router = express.Router();

import {
  createCompany,
  deleteCompany,
  fetchCompany,
  fetchSingleCompany,
  updateCompany,
  fetchCompanyByArea,
  fetchPremiumCompanies,
  fetchBlockedCompany,
  togglePremiumCompanyStatus,
  toggleBlockedCompanyStatus,
  getCompanyNameAccordingToRating,
} from "../controller/company.controller.js";
import { verifyToken } from "../middleware/middleware.js";

router.get("/", fetchCompany);
router.post(
  "/create",
  verifyToken,
  authorizeRoles("seller", "admin"),
  createCompany
);
router.get("/premium-companies", fetchPremiumCompanies);
router.get("/blocked-companies", fetchBlockedCompany);
router.get(
  "/fetch-company-by-rating",
  verifyToken,
  // authorizeRoles("seller", "admin"),
  getCompanyNameAccordingToRating
);

router.get("/:id", fetchSingleCompany);
router.delete(
  "/delete/:id",
  verifyToken,
  authorizeRoles("seller", "admin"),
  deleteCompany
);
router.patch(
  "/update/:id",
  verifyToken,
  authorizeRoles("seller", "admin"),
  updateCompany
);

router.get("/areas/:areaId", fetchCompanyByArea);
router.patch(
  "/toggle-premium/:id",
  verifyToken,
  authorizeRoles("admin"),
  togglePremiumCompanyStatus
);
router.patch(
  "/toggle-blocked/:id",
  verifyToken,
  authorizeRoles("admin"),
  toggleBlockedCompanyStatus
);

router.get("/shiva", (req, res) => {
  console.log("shiva");
});

export default router;
