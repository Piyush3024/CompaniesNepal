import express from "express";
import { authorizeRoles, protectRoute } from "../../middleware/middleware.js";
const router = express.Router();

import {
  createCompanyValidationRules,
  updateCompanyValidationRules,
  companyIdParamRule,
  idOrSlugParamRule,
  paginationQueryRules,
  sortQueryRules,
  searchQueryRule,
  premiumStatusRule,
  verificationStatusRule,
  slugParamRule,
  filterCompaniesQueryRules,
} from "../../middleware/validation/company/company.validation.rules.js";

import {
  handleCompanyValidationErrors,
  validateFileUploads,
  validateCreateCompanyRequest,
  validateUpdateCompanyRequest,
  validatePremiumStatusUpdate,
  validateVerificationStatusUpdate,
  validateSlugCheckRequest,
  validateRecalculateStatsRequest,
  validateListQueryParams,
  validateSearchQuery,
  validateFilterQueryParams,
} from "../../middleware/validation/company/company.middleware.js";

import {
  createCompany,
  getCompanyByIdOrSlug,
  toggleBlockStatus,
  updatePremiumStatus,
  updateVerificationStatus,
  checkSlugUniqueness,
  recalculateStats,
  getPremiumCompanies,
  getVerifiedCompanies,
  getTopRatedCompanies,
  getAllCompanies,
  getAllBlockedCompanies,
  getMyCompanies,
  updateCompany,
  deleteCompany,
  searchCompanies,
  filterCompanies,
  getCompanyTypes,
} from "../../controller/company/company.controller.js";

// Get all companies with pagination
router.get(
  "/",
  ...paginationQueryRules(),
  ...sortQueryRules(),
  validateListQueryParams,
  handleCompanyValidationErrors,
  getAllCompanies
);

// Get premium companies
router.get(
  "/premium-companies",
  ...paginationQueryRules(),
  ...sortQueryRules(),
  validateListQueryParams,
  handleCompanyValidationErrors,
  getPremiumCompanies
);

// Get verified companies
router.get(
  "/verified-companies",
  ...paginationQueryRules(),
  ...sortQueryRules(),
  validateListQueryParams,
  handleCompanyValidationErrors,
  getVerifiedCompanies
);

// Get top rated companies
router.get(
  "/top-rated",
  ...paginationQueryRules(),
  ...sortQueryRules(),
  validateListQueryParams,
  handleCompanyValidationErrors,
  getTopRatedCompanies
);

// Get blocked companies (Admin only)
router.get(
  "/blocked-companies",
  protectRoute,
  authorizeRoles("admin"),
  ...paginationQueryRules(),
  ...sortQueryRules(),
  validateListQueryParams,
  handleCompanyValidationErrors,
  getAllBlockedCompanies
);

// Get my companies (Current user's companies)
router.get(
  "/my-companies",
  protectRoute,
  ...paginationQueryRules(),
  ...sortQueryRules(),
  validateListQueryParams,
  handleCompanyValidationErrors,
  getMyCompanies
);

// Search companies
router.get(
  "/search",
  searchQueryRule(),
  ...paginationQueryRules(),
  ...sortQueryRules(),
  validateSearchQuery,
  validateListQueryParams,
  handleCompanyValidationErrors,
  searchCompanies
);

// Check slug uniqueness
router.get(
  "/slug/:slug/check",
  slugParamRule(),
  validateSlugCheckRequest,
  handleCompanyValidationErrors,
  checkSlugUniqueness
);

router.get("/companyType", getCompanyTypes);

// Filter companies
router.get(
    "/filter",
    ...filterCompaniesQueryRules(),
    validateFilterQueryParams,
    handleCompanyValidationErrors,
    filterCompanies
  );
  


// Get company by ID or slug (Must be after specific routes)
router.get(
  "/:idOrSlug",
  idOrSlugParamRule(),
  handleCompanyValidationErrors,
  getCompanyByIdOrSlug
);


// Create company
router.post(
  "/",
  protectRoute,
  authorizeRoles("seller", "admin"),
  validateCreateCompanyRequest,
  ...createCompanyValidationRules(),
  validateFileUploads,
  handleCompanyValidationErrors,
  createCompany
);

// Update company
router.patch(
  "/:id",
  protectRoute,
  authorizeRoles("seller", "admin"),
  companyIdParamRule(),
  validateUpdateCompanyRequest,
  ...updateCompanyValidationRules(),
  validateFileUploads,
  handleCompanyValidationErrors,
  updateCompany
);

// Update premium status (Admin only)
router.patch(
  "/:id/premium",
  protectRoute,
  authorizeRoles("admin"),
  companyIdParamRule(),
  premiumStatusRule(),
  validatePremiumStatusUpdate,
  handleCompanyValidationErrors,
  updatePremiumStatus
);

// Update verification status (Admin only)
router.patch(
  "/:id/verification",
  protectRoute,
  authorizeRoles("admin"),
  companyIdParamRule(),
  ...verificationStatusRule(),
  validateVerificationStatusUpdate,
  handleCompanyValidationErrors,
  updateVerificationStatus
);

// Toggle block status (Admin only)
router.patch(
  "/:id/toggle-block",
  protectRoute,
  authorizeRoles("admin"),
  companyIdParamRule(),
  handleCompanyValidationErrors,
  toggleBlockStatus
);

// Recalculate statistics (Admin only or auto-trigger)
router.patch(
  "/:id/recalculate-stats",
  protectRoute,
  authorizeRoles("admin"),
  companyIdParamRule(),
  validateRecalculateStatsRequest,
  handleCompanyValidationErrors,
  recalculateStats
);

// Delete company
router.delete(
  "/:id",
  protectRoute,
  authorizeRoles("admin"),
  companyIdParamRule(),
  handleCompanyValidationErrors,
  deleteCompany
);

// get companytype


export default router;
