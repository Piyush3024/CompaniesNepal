import { PrismaClient } from "@prisma/client";
import { encodeId, decodeId } from "../../lib/secure.js";
import {
  handleLocalFileUploads,
  generateFileUrl,
  deleteFile,
} from "../../middleware/file/multer.middleware.js";

const prisma = new PrismaClient();

// Helper function to generate unique slug
const generateSlug = async (name, prisma, excludeId = null) => {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  let uniqueSlug = slug;
  let counter = 1;

  while (
    await prisma.companies.findFirst({
      where: {
        slug: uniqueSlug,
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    })
  ) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

// Helper function to recalculate company statistics
const recalculateCompanyStats = async (companyId) => {
  try {
    const [productsCount, inquiriesCount, reviewsData] = await Promise.all([
      prisma.products.count({ where: { company_id: companyId } }),
      prisma.inquiries.count({ where: { company_id: companyId } }),
      prisma.company_reviews.aggregate({
        where: { company_id: companyId },
        _count: true,
        _avg: { rating: true },
      }),
    ]);

    const totalReviews = reviewsData._count || 0;
    const averageRating = reviewsData._avg.rating || null;

    await prisma.companies.update({
      where: { id: companyId },
      data: {
        total_products: productsCount,
        total_inquiries: inquiriesCount,
        total_reviews: totalReviews,
        average_rating: averageRating,
      },
    });

    return {
      total_products: productsCount,
      total_inquiries: inquiriesCount,
      total_reviews: totalReviews,
      average_rating: averageRating,
    };
  } catch (error) {
    console.error("Error recalculating company stats:", error);
    throw error;
  }
};

// Helper function to format company response
const formatCompanyResponse = (company, req, includeRelations = false) => {
  const formatted = {
    id: encodeId(company.id),
    name: company.name,
    email: company.email,
    phone: company.phone,
    website: company.website,
    logo_url: company.logo_url ? generateFileUrl(req, company.logo_url) : null,
    slug: company.slug,
    description: company.description,
    established_year: company.established_year,
    registration_number: company.registration_number,
    social_media_links: company.social_media_links
      ? JSON.parse(company.social_media_links)
      : null,
    documents_url: company.documents_url
      ? JSON.parse(company.documents_url).map((doc) =>
          generateFileUrl(req, doc)
        )
      : null,
    is_blocked: company.is_blocked,
    is_premium: company.is_premium,
    is_verified: company.is_verified,
    verified_at: company.verified_at,
    average_rating: company.average_rating
      ? parseFloat(company.average_rating)
      : null,
    total_reviews: company.total_reviews,
    total_products: company.total_products,
    total_inquiries: company.total_inquiries,
    area_id: company.area_id ? encodeId(company.area_id) : null,
    company_type_id: encodeId(company.company_type_id),
    verification_status_id: company.verification_status_id
      ? encodeId(company.verification_status_id)
      : null,
    created_by: encodeId(company.created_by),
    created_at: company.created_at,
    updated_at: company.updated_at,
  };

  if (includeRelations) {
    if (company.areas) {
      formatted.area = {
        id: encodeId(company.areas.id),
        name: company.areas.name,
      };
    }
    if (company.company_type) {
      formatted.company_type = {
        id: encodeId(company.company_type.id),
        name: company.company_type.name,
      };
    }
    if (company.verification_status) {
      formatted.verification_status = {
        id: encodeId(company.verification_status.id),
        name: company.verification_status.name,
      };
    }
    if (company.company_branches) {
      formatted.branches = company.company_branches.map((branch) => ({
        id: encodeId(branch.id),
        branch_name: branch.branch_name,
        phone: branch.phone,
        email: branch.email,
        is_active: branch.is_active,
        area_id: branch.area_id ? encodeId(branch.area_id) : null,
      }));
    }
    if (company.company_categories) {
      formatted.categories = company.company_categories.map((cat) => ({
        id: encodeId(cat.id),
        name: cat.name,
      }));
    }
  }

  return formatted;
};

// Create Company
export const createCompany = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      website,
      description,
      established_year,
      registration_number,
      social_media_links,
      company_type_id,
      area_id,
      branches,
      categories,
    } = req.body;

    // Decode IDs
    const decodedCompanyTypeId = decodeId(company_type_id);
    const decodedAreaId = area_id ? decodeId(area_id) : null;

    // Validate company type exists
    const companyType = await prisma.company_type.findUnique({
      where: { id: decodedCompanyTypeId },
    });

    if (!companyType) {
      return res.status(400).json({
        success: false,
        message: "Invalid company type",
      });
    }

    // Validate area if provided
    if (decodedAreaId) {
      const area = await prisma.areas.findUnique({
        where: { id: decodedAreaId },
      });

      if (!area) {
        return res.status(400).json({
          success: false,
          message: "Invalid area",
        });
      }
    }

    // Generate slug
    const slug = req.body.slug || (await generateSlug(name, prisma));

    // Check for existing slug
    const existingSlug = await prisma.companies.findFirst({
      where: { slug },
    });

    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: "Company slug already exists",
      });
    }

    // Handle file uploads
    let logoPath = null;
    let documentPaths = [];

    if (req.file) {
      logoPath = req.file.path;
    } else if (req.files?.logo_url?.[0]) {
      logoPath = req.files.logo_url[0].path;
    }

    if (req.files?.documents_url) {
      documentPaths = req.files.documents_url.map((file) => file.path);
    }

    const uploadedFiles = handleLocalFileUploads(req);
    const finalLogoPath = logoPath || uploadedFiles.logo_url || null;
    const finalDocumentPaths =
      documentPaths.length > 0
        ? documentPaths
        : uploadedFiles.documents_url
        ? [uploadedFiles.documents_url]
        : [];

    // Parse social media links
    let parsedSocialMediaLinks = null;
    if (social_media_links) {
      try {
        parsedSocialMediaLinks =
          typeof social_media_links === "string"
            ? social_media_links
            : JSON.stringify(social_media_links);
      } catch (error) {
        console.error("Error parsing social media links:", error);
      }
    }

    // Create company with transaction
    const company = await prisma.$transaction(async (tx) => {
      // Create company
      const newCompany = await tx.companies.create({
        data: {
          name,
          email,
          phone,
          website,
          slug,
          description,
          established_year: established_year
            ? parseInt(established_year)
            : null,
          registration_number,
          social_media_links: parsedSocialMediaLinks,
          logo_url: finalLogoPath,
          documents_url:
            finalDocumentPaths.length > 0
              ? JSON.stringify(finalDocumentPaths)
              : null,
          company_type_id: decodedCompanyTypeId,
          area_id: decodedAreaId,
          created_by: req.user.id,
          verified_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Add creator to company_users
      await tx.company_users.create({
        data: {
          company_id: newCompany.id,
          user_id: req.user.id,
          created_at: new Date(),
        },
      });

      // Create branches if provided
      if (branches && Array.isArray(branches) && branches.length > 0) {
        const branchData = branches.map((branch) => ({
          company_id: newCompany.id,
          branch_name: branch.branch_name,
          phone: branch.phone,
          email: branch.email,
          area_id: branch.area_id ? decodeId(branch.area_id) : null,
          is_active: branch.is_active !== undefined ? branch.is_active : true,
          created_at: new Date(),
          updated_at: new Date(),
        }));

        await tx.company_branches.createMany({
          data: branchData,
        });
      }

      // Create categories if provided
      if (categories && Array.isArray(categories) && categories.length > 0) {
        const categoryData = categories.map((category) => ({
          company_id: newCompany.id,
          name: category.name || category,
        }));

        await tx.company_categories.createMany({
          data: categoryData,
        });
      }

      return newCompany;
    });

    // Fetch complete company data with relations
    const completeCompany = await prisma.companies.findUnique({
      where: { id: company.id },
      include: {
        areas: true,
        company_type: true,
        verification_status: true,
        company_branches: true,
        company_categories: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: formatCompanyResponse(completeCompany, req, true),
    });
  } catch (error) {
    console.error("Error in createCompany controller:", error);
    res.status(500).json({
      success: false,
      message: "Error creating company",
      error: error.message,
    });
  }
};

// Get Company by ID or Slug
export const getCompanyByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    let company;
    const decodedId = decodeId(idOrSlug, true);

    if (decodedId) {
      company = await prisma.companies.findUnique({
        where: { id: decodedId },
        include: {
          areas: true,
          company_type: true,
          verification_status: true,
          company_branches: {
            where: { is_active: true },
            include: { areas: true },
          },
          company_categories: true,
        },
      });
    } else {
      company = await prisma.companies.findUnique({
        where: { slug: idOrSlug },
        include: {
          areas: true,
          company_type: true,
          verification_status: true,
          company_branches: {
            where: { is_active: true },
            include: { areas: true },
          },
          company_categories: true,
        },
      });
    }

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Check if blocked (only show to admins)
    if (company.is_blocked && req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "This company is currently blocked",
      });
    }

    res.json({
      success: true,
      message: "Company retrieved successfully",
      data: formatCompanyResponse(company, req, true),
    });
  } catch (error) {
    console.error("Error in getCompanyByIdOrSlug controller:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving company",
      error: error.message,
    });
  }
};

// Toggle Block Status (Admin Only)
export const toggleBlockStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeId(id);

    const company = await prisma.companies.findUnique({
      where: { id: decodedId },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const updatedCompany = await prisma.companies.update({
      where: { id: decodedId },
      data: {
        is_blocked: !company.is_blocked,
        updated_at: new Date(),
      },
      include: {
        areas: true,
        company_type: true,
        verification_status: true,
      },
    });

    res.json({
      success: true,
      message: `Company ${
        updatedCompany.is_blocked ? "blocked" : "unblocked"
      } successfully`,
      data: formatCompanyResponse(updatedCompany, req, true),
    });
  } catch (error) {
    console.error("Error in toggleBlockStatus controller:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling block status",
      error: error.message,
    });
  }
};

// Update Premium Status (Admin Only)
export const updatePremiumStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_premium } = req.body;
    const decodedId = decodeId(id);

    if (is_premium === undefined) {
      return res.status(400).json({
        success: false,
        message: "is_premium field is required",
      });
    }

    const company = await prisma.companies.findUnique({
      where: { id: decodedId },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const updatedCompany = await prisma.companies.update({
      where: { id: decodedId },
      data: {
        is_premium: is_premium === "true" || is_premium === true,
        updated_at: new Date(),
      },
      include: {
        areas: true,
        company_type: true,
        verification_status: true,
      },
    });

    res.json({
      success: true,
      message: "Company premium status updated successfully",
      data: formatCompanyResponse(updatedCompany, req, true),
    });
  } catch (error) {
    console.error("Error in updatePremiumStatus controller:", error);
    res.status(500).json({
      success: false,
      message: "Error updating premium status",
      error: error.message,
    });
  }
};

// Update Verification Status (Admin Only)
export const updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified, verification_status_id } = req.body;
    const decodedId = decodeId(id);

    const company = await prisma.companies.findUnique({
      where: { id: decodedId },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const updateData = {
      updated_at: new Date(),
    };

    if (is_verified !== undefined) {
      updateData.is_verified = is_verified === "true" || is_verified === true;
      if (updateData.is_verified && !company.verified_at) {
        updateData.verified_at = new Date();
      }
    }

    if (verification_status_id) {
      const decodedStatusId = decodeId(verification_status_id);
      const status = await prisma.verification_status.findUnique({
        where: { id: decodedStatusId },
      });

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification status",
        });
      }

      updateData.verification_status_id = decodedStatusId;
    }

    const updatedCompany = await prisma.companies.update({
      where: { id: decodedId },
      data: updateData,
      include: {
        areas: true,
        company_type: true,
        verification_status: true,
      },
    });

    res.json({
      success: true,
      message: "Company verification status updated successfully",
      data: formatCompanyResponse(updatedCompany, req, true),
    });
  } catch (error) {
    console.error("Error in updateVerificationStatus controller:", error);
    res.status(500).json({
      success: false,
      message: "Error updating verification status",
      error: error.message,
    });
  }
};

// Check Slug Uniqueness
export const checkSlugUniqueness = async (req, res) => {
  try {
    const { slug: providedSlug } = req.params;
    const { excludeId: encodedCompanyId } = req.query;

    if (!providedSlug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    const decodedCompanyId = encodedCompanyId
      ? decodeId(encodedCompanyId)
      : null;

    const existingCompany = await prisma.companies.findFirst({
      where: {
        slug: providedSlug,
        NOT: decodedCompanyId ? { id: decodedCompanyId } : undefined,
      },
    });

    res.json({
      success: true,
      isUnique: !existingCompany,
      slug: providedSlug,
      message: existingCompany ? "Slug is already in use" : "Slug is available",
    });
  } catch (error) {
    console.error("Error in checkSlugUniqueness controller:", error);
    res.status(500).json({
      success: false,
      message: "Error checking slug uniqueness",
      error: error.message,
    });
  }
};

// Recalculate Company Statistics (Admin Only or Auto-trigger)
export const recalculateStats = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeId(id);

    const company = await prisma.companies.findUnique({
      where: { id: decodedId },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const stats = await recalculateCompanyStats(decodedId);

    res.json({
      success: true,
      message: "Company statistics recalculated successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error in recalculateStats controller:", error);
    res.status(500).json({
      success: false,
      message: "Error recalculating statistics",
      error: error.message,
    });
  }
};

// Get Premium Companies
export const getPremiumCompanies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "average_rating",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      is_premium: true,
      is_blocked: false,
    };

    const [companies, total] = await Promise.all([
      prisma.companies.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          areas: true,
          company_type: true,
          verification_status: true,
        },
      }),
      prisma.companies.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Premium companies retrieved successfully",
      data: companies.map((company) =>
        formatCompanyResponse(company, req, true)
      ),
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getPremiumCompanies controller:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving premium companies",
      error: error.message,
    });
  }
};

// Get Verified Companies
export const getVerifiedCompanies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "verified_at",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      is_verified: true,
      is_blocked: false,
    };

    const [companies, total] = await Promise.all([
      prisma.companies.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          areas: true,
          company_type: true,
          verification_status: true,
        },
      }),
      prisma.companies.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Verified companies retrieved successfully",
      data: companies.map((company) =>
        formatCompanyResponse(company, req, true)
      ),
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getVerifiedCompanies controller:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving verified companies",
      error: error.message,
    });
  }
};

// Get Top Rated Companies
export const getTopRatedCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 10, min_reviews = 5 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      is_blocked: false,
      total_reviews: { gte: parseInt(min_reviews) },
      average_rating: { not: null },
    };

    const [companies, total] = await Promise.all([
      prisma.companies.findMany({
        where,
        skip,
        take,
        orderBy: [{ average_rating: "desc" }, { total_reviews: "desc" }],
        include: {
          areas: true,
          company_type: true,
          verification_status: true,
        },
      }),
      prisma.companies.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Top rated companies retrieved successfully",
      data: companies.map((company) =>
        formatCompanyResponse(company, req, true)
      ),
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        min_reviews: parseInt(min_reviews),
      },
    });
  } catch (error) {
    console.error("Error in getTopRatedCompanies controller:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving top rated companies",
      error: error.message,
    });
  }
};

// Get All Companies
export const getAllCompanies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "desc",
      includeBlocked = false,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    // Only admins can see blocked companies
    if (req.user?.role !== "admin" || includeBlocked === "false") {
      where.is_blocked = false;
    }

    const [companies, total] = await Promise.all([
      prisma.companies.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          areas: true,
          company_type: true,
          verification_status: true,
        },
      }),
      prisma.companies.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Companies retrieved successfully",
      data: companies.map((company) =>
        formatCompanyResponse(company, req, true)
      ),
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllCompanies controller:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving companies",
      error: error.message,
    });
  }
};

// Get All Blocked Companies (Admin Only)
export const getAllBlockedCompanies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { is_blocked: true };

    const [companies, total] = await Promise.all([
      prisma.companies.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          areas: true,
          company_type: true,
          verification_status: true,
        },
      }),
      prisma.companies.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Blocked companies retrieved successfully",
      data: companies.map((company) =>
        formatCompanyResponse(company, req, true)
      ),
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllBlockedCompanies controller:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving blocked companies",
      error: error.message,
    });
  }
};

// Get Companies by User (My Companies)
export const getMyCompanies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get companies where user is in company_users
    const companyUsers = await prisma.company_users.findMany({
      where: { user_id: req.user.id },
      select: { company_id: true },
    });

    const companyIds = companyUsers.map((cu) => cu.company_id);

    const where = { id: { in: companyIds } };

    const [companies, total] = await Promise.all([
      prisma.companies.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          areas: true,
          company_type: true,
          verification_status: true,
        },
      }),
      prisma.companies.count({ where }),
    ]);

    res.json({
      success: true,
      message: "My companies retrieved successfully",
      data: companies.map((company) =>
        formatCompanyResponse(company, req, true)
      ),
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getMyCompanies controller:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving companies",
      error: error.message,
    });
  }
};

// Update Company
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      website,
      description,
      established_year,
      registration_number,
      social_media_links,
      company_type_id,
      area_id,
    } = req.body;

    const decodedId = decodeId(id);

    // Check if company exists
    const existingCompany = await prisma.companies.findUnique({
      where: { id: decodedId },
    });

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Check permissions - sellers can only update their own companies
    if (req.user.role === "seller") {
      const companyUser = await prisma.company_users.findFirst({
        where: {
          company_id: decodedId,
          user_id: req.user.id,
        },
      });

      if (!companyUser) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to update this company",
        });
      }
    }

    // Validate company type if provided
    let decodedCompanyTypeId = null;
    if (company_type_id) {
      decodedCompanyTypeId = decodeId(company_type_id);
      const companyType = await prisma.company_type.findUnique({
        where: { id: decodedCompanyTypeId },
      });

      if (!companyType) {
        return res.status(400).json({
          success: false,
          message: "Invalid company type",
        });
      }
    }

    // Validate area if provided
    let decodedAreaId = null;
    if (area_id) {
      decodedAreaId = decodeId(area_id);
      const area = await prisma.areas.findUnique({
        where: { id: decodedAreaId },
      });

      if (!area) {
        return res.status(400).json({
          success: false,
          message: "Invalid area",
        });
      }
    }

    // Check slug uniqueness if name is being updated
    if (name && name !== existingCompany.name) {
      const slug =
        req.body.slug || (await generateSlug(name, prisma, decodedId));
      const existingSlug = await prisma.companies.findFirst({
        where: {
          slug,
          NOT: { id: decodedId },
        },
      });

      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: "Company slug already exists",
        });
      }
    }

    // Handle file uploads
    let newLogoPath = null;
    let newDocumentPaths = [];

    if (req.file && req.file.fieldname === "logo_url") {
      newLogoPath = req.file.path;
    } else if (req.files?.logo_url?.[0]) {
      newLogoPath = req.files.logo_url[0].path;
    }

    if (req.files?.documents_url) {
      newDocumentPaths = req.files.documents_url.map((file) => file.path);
    }

    if (!newLogoPath && !newDocumentPaths.length) {
      const uploadedFiles = handleLocalFileUploads(req);
      newLogoPath = uploadedFiles.logo_url;
      if (uploadedFiles.documents_url) {
        newDocumentPaths = [uploadedFiles.documents_url];
      }
    }

    // Parse social media links
    let parsedSocialMediaLinks = undefined;
    if (social_media_links !== undefined) {
      try {
        parsedSocialMediaLinks =
          typeof social_media_links === "string"
            ? social_media_links
            : JSON.stringify(social_media_links);
      } catch (error) {
        console.error("Error parsing social media links:", error);
      }
    }

    // Prepare update data
    const updateData = {
      ...(name && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(website !== undefined && { website }),
      ...(description !== undefined && { description }),
      ...(established_year && { established_year: parseInt(established_year) }),
      ...(registration_number !== undefined && { registration_number }),
      ...(parsedSocialMediaLinks !== undefined && {
        social_media_links: parsedSocialMediaLinks,
      }),
      ...(decodedCompanyTypeId && { company_type_id: decodedCompanyTypeId }),
      ...(area_id !== undefined && { area_id: decodedAreaId }),
      updated_at: new Date(),
    };

    // Handle logo update
    if (newLogoPath) {
      if (existingCompany.logo_url) {
        try {
          await deleteFile(existingCompany.logo_url);
        } catch (error) {
          console.error(
            `Error deleting old logo: ${existingCompany.logo_url}`,
            error
          );
        }
      }
      updateData.logo_url = newLogoPath;
    }

    // Handle documents update
    if (newDocumentPaths.length > 0) {
      if (existingCompany.documents_url) {
        try {
          const oldDocs = JSON.parse(existingCompany.documents_url);
          for (const doc of oldDocs) {
            await deleteFile(doc);
          }
        } catch (error) {
          console.error("Error deleting old documents:", error);
        }
      }
      updateData.documents_url = JSON.stringify(newDocumentPaths);
    }

    // Generate slug if name is provided
    if (name) {
      const slugToUse =
        req.body.slug || (await generateSlug(name, prisma, decodedId));
      updateData.slug = slugToUse;
    }

    // Update company
    const company = await prisma.companies.update({
      where: { id: decodedId },
      data: updateData,
      include: {
        areas: true,
        company_type: true,
        verification_status: true,
        company_branches: true,
        company_categories: true,
      },
    });

    res.json({
      success: true,
      message: "Company updated successfully",
      data: formatCompanyResponse(company, req, true),
    });
  } catch (error) {
    console.error("Error in updateCompany controller:", error);
    res.status(500).json({
      success: false,
      message: "Error updating company",
      error: error.message,
    });
  }
};

// Delete Company
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeId(id);

    // Check if company exists
    const company = await prisma.companies.findUnique({
      where: { id: decodedId },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Check permissions - only admin can delete
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete companies",
      });
    }

    // Delete files
    if (company.logo_url) {
      try {
        await deleteFile(company.logo_url);
      } catch (error) {
        console.error("Error deleting logo:", error);
      }
    }

    if (company.documents_url) {
      try {
        const docs = JSON.parse(company.documents_url);
        for (const doc of docs) {
          await deleteFile(doc);
        }
      } catch (error) {
        console.error("Error deleting documents:", error);
      }
    }

    // Delete company (cascade will handle related records)
    await prisma.companies.delete({
      where: { id: decodedId },
    });

    res.json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteCompany controller:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting company",
      error: error.message,
    });
  }
};

// Search Companies
export const searchCompanies = async (req, res) => {
  try {
    const {
      query,
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
        { registration_number: { contains: query, mode: "insensitive" } },
      ];
    }

    // Only show non-blocked companies to non-admins
    if (req.user?.role !== "admin") {
      where.is_blocked = false;
    }

    const [companies, total] = await Promise.all([
      prisma.companies.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          areas: true,
          company_type: true,
          verification_status: true,
        },
      }),
      prisma.companies.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Companies retrieved successfully",
      data: companies.map((company) =>
        formatCompanyResponse(company, req, true)
      ),
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in searchCompanies controller:", error);
    res.status(500).json({
      success: false,
      message: "Error searching companies",
      error: error.message,
    });
  }
};

// Filter Companies
export const filterCompanies = async (req, res) => {
  try {
    const {
      // Basic filters
      company_type_id,
      area_id,
      is_premium,
      is_verified,
      is_blocked,

      // Rating filters
      min_rating,
      max_rating,

      // Year filters
      min_year,
      max_year,

      // Review filters
      min_reviews,
      max_reviews,

      // Product filters
      min_products,
      max_products,

      // Inquiry filters
      min_inquiries,
      max_inquiries,

      // Search query
      search,

      // Pagination
      page = 1,
      limit = 10,

      // Sorting
      sortBy = "created_at",
      sortOrder = "desc",

      // Include relations
      includeRelations = "true",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    // Filter by company type
    if (company_type_id) {
      const decodedTypeId = decodeId(company_type_id);
      if (decodedTypeId) {
        where.company_type_id = decodedTypeId;
      }
    }

    // Filter by area
    if (area_id) {
      const decodedAreaId = decodeId(area_id);
      if (decodedAreaId) {
        where.area_id = decodedAreaId;
      }
    }

    // Filter by premium status
    if (is_premium !== undefined) {
      where.is_premium = is_premium === "true";
    }

    // Filter by verified status
    if (is_verified !== undefined) {
      where.is_verified = is_verified === "true";
    }

    // Filter by blocked status (admin only)
    if (is_blocked !== undefined && req.user?.role === "admin") {
      where.is_blocked = is_blocked === "true";
    } else if (req.user?.role !== "admin") {
      // Non-admins should never see blocked companies
      where.is_blocked = false;
    }

    // Filter by rating range
    if (min_rating || max_rating) {
      where.average_rating = {};
      if (min_rating) {
        where.average_rating.gte = parseFloat(min_rating);
      }
      if (max_rating) {
        where.average_rating.lte = parseFloat(max_rating);
      }
      // Exclude null ratings if filtering by rating
      if (!where.average_rating.gte && !where.average_rating.lte) {
        where.average_rating.not = null;
      }
    }

    // Filter by established year range
    if (min_year || max_year) {
      where.established_year = {};
      if (min_year) {
        where.established_year.gte = parseInt(min_year);
      }
      if (max_year) {
        where.established_year.lte = parseInt(max_year);
      }
    }

    // Filter by review count range
    if (min_reviews || max_reviews) {
      where.total_reviews = {};
      if (min_reviews) {
        where.total_reviews.gte = parseInt(min_reviews);
      }
      if (max_reviews) {
        where.total_reviews.lte = parseInt(max_reviews);
      }
    }

    // Filter by product count range
    if (min_products || max_products) {
      where.total_products = {};
      if (min_products) {
        where.total_products.gte = parseInt(min_products);
      }
      if (max_products) {
        where.total_products.lte = parseInt(max_products);
      }
    }

    // Filter by inquiry count range
    if (min_inquiries || max_inquiries) {
      where.total_inquiries = {};
      if (min_inquiries) {
        where.total_inquiries.gte = parseInt(min_inquiries);
      }
      if (max_inquiries) {
        where.total_inquiries.lte = parseInt(max_inquiries);
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { registration_number: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build include object for relations
    const include =
      includeRelations === "true"
        ? {
            areas: true,
            company_type: true,
            verification_status: true,
            company_branches: {
              where: { is_active: true },
            },
            company_categories: true,
          }
        : {};

    // Validate sortBy field to prevent SQL injection
    const validSortFields = [
      "name",
      "created_at",
      "updated_at",
      "average_rating",
      "total_reviews",
      "total_products",
      "total_inquiries",
      "established_year",
      "verified_at",
    ];

    const finalSortBy = validSortFields.includes(sortBy)
      ? sortBy
      : "created_at";
    const finalSortOrder = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

    // Execute query
    const [companies, total] = await Promise.all([
      prisma.companies.findMany({
        where,
        skip,
        take,
        orderBy: { [finalSortBy]: finalSortOrder },
        include,
      }),
      prisma.companies.count({ where }),
    ]);

    // Format response
    const formattedCompanies = companies.map((company) =>
      formatCompanyResponse(company, req, includeRelations === "true")
    );

    res.json({
      success: true,
      message: "Companies filtered successfully",
      data: formattedCompanies,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        appliedFilters: {
          company_type_id,
          area_id,
          is_premium:
            is_premium !== undefined ? is_premium === "true" : undefined,
          is_verified:
            is_verified !== undefined ? is_verified === "true" : undefined,
          is_blocked:
            is_blocked !== undefined ? is_blocked === "true" : undefined,
          rating: {
            min: min_rating ? parseFloat(min_rating) : undefined,
            max: max_rating ? parseFloat(max_rating) : undefined,
          },
          year: {
            min: min_year ? parseInt(min_year) : undefined,
            max: max_year ? parseInt(max_year) : undefined,
          },
          reviews: {
            min: min_reviews ? parseInt(min_reviews) : undefined,
            max: max_reviews ? parseInt(max_reviews) : undefined,
          },
          products: {
            min: min_products ? parseInt(min_products) : undefined,
            max: max_products ? parseInt(max_products) : undefined,
          },
          inquiries: {
            min: min_inquiries ? parseInt(min_inquiries) : undefined,
            max: max_inquiries ? parseInt(max_inquiries) : undefined,
          },
          search,
        },
        sorting: {
          sortBy: finalSortBy,
          sortOrder: finalSortOrder,
        },
      },
    });
  } catch (error) {
    console.error("Error in filterCompanies controller:", error);
    res.status(500).json({
      success: false,
      message: "Error filtering companies",
      error: error.message,
    });
  }
};

// Get Company Types
export const getCompanyTypes = async (req, res) => {
  try {
    const companyTypes = await prisma.company_type.findMany({
      orderBy: { name: "asc" },
    });

    return res.json({
      success: true,
      message: "Company types retrieved successfully",
      data: companyTypes.map((type) => ({
        ...type,
        encoded_id: encodeId(type.id),
      })),
    });
  } catch (error) {
    console.error("Error in getCompanyTypes controller:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving company types",
      error: error.message,
    });
  }
};
