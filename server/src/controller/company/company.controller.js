import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { hashId, decodeHashId } from "../../randomgenerator.js";

const prisma = new PrismaClient();

const fetchCompany = async (req, res) => {
  try {
    const companies = await prisma.companies.findMany();
    if (!companies) {
      return res.status(404).json({
        error: "there is no company",
      });
    }

    res.json({
      message: "Companies fetched",
      companies: companies,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const createCompany = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      website,
      logo_url,
      area_id,
      company_type_id,
      description,
      documents_url,
      established_year,
      social_media_links,
      verification_status_id,
      slug,
      created_by, // user ID who created the company
    } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({
        message: "name and email are required",
        success: false,
      });
    }

    if (!area_id || !company_type_id) {
      return res.status(400).json({
        message: "area_id and company_type_id are required",
        success: false,
      });
    }

    if (!created_by) {
      return res.status(400).json({
        message: "created_by (user id) is required",
        success: false,
      });
    }

    // Check if company email already exists
    const existingCompany = await prisma.companies.findFirst({
      where: { email },
    });

    if (existingCompany) {
      return res.status(400).json({
        message: "company with this email already exists",
        success: false,
      });
    }

    // Create new company
    const newCompany = await prisma.companies.create({
      data: {
        name,
        email,
        phone,
        website,
        logo_url,
        areas: { connect: { id: area_id } },
        company_type: { connect: { id: company_type_id } },
        description,
        documents_url,
        established_year: established_year ? parseInt(established_year) : null,
        social_media_links: social_media_links
          ? JSON.stringify(social_media_links)
          : null,
        verification_status: { connect: { id: verification_status_id || 1 } },
        slug,
        verified_at: new Date(),
        user: { connect: { id: created_by } }, // Correct relation connect
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        website: true,
        logo_url: true,
        areas: {
          select: {
            id: true,
            city_id: true,
          },
        },
        company_type: true,
        slug: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.json({
      message: "company created",
      newCompany: {
        ...newCompany,
        id: hashId(newCompany.id),
        areas: {
          ...newCompany.areas,
          id: hashId(newCompany.areas.id),
          city_id: hashId(newCompany.areas.city_id),
        },
        company_type: {
          ...newCompany.company_type,
          id: hashId(newCompany.company_type.id),
        },
        user: {
          ...newCompany.user,
          id: hashId(newCompany.user.id),
        },
      },
    });
  } catch (error) {
    console.log("Error creating company:", error);
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const deleteCompany = async (req, res) => {
  try {
    let hashId = req.params.id;
    const decodeHashId = parseInt(hashId);

    const existingCompany = await prisma.companies.findUnique({
      where: {
        id: decodeHashId,
      },
    });
    if (!existingCompany) {
      return res.status(404).json({
        error: "company not found",
        success: false,
      });
    }
    await prisma.companies.delete({
      where: {
        id: decodeHashId,
      },
    });
    res.json({
      message: "company deleted",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const fetchSingleCompany = async (req, res) => {
  try {
    let hashId = req.params.id;
    const decodeHashId = parseInt(hashId);

    const company = await prisma.companies.findUnique({
      where: {
        id: decodeHashId,
      },
    });
    if (!company) {
      return res.status(404).json({
        error: "company not found ",
      });
    } else {
      res.json({
        message: "Single Company fetched",
        company: company,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const updateCompany = async (req, res) => {
  try {
    let hash = req.params.id;

    const decodeHash = decodeHashId(hash);

    const {
      name,
      email,
      phone,
      website,
      logo_url,
      area_id,
      company_type_id,
      description,
      documents_url,
      // established_year,
      social_media_links,
    } = req.body;

    const existingCompany = await prisma.companies.findUnique({
      where: {
        email,
      },
    });
    if (existingCompany) {
      return res.status(404).json({
        error: "company with this email already exists",
      });
    }
    const editcompany = await prisma.companies.update({
      where: {
        id: decodeHash,
      },
      data: {
        name: name ?? existingCompany.name,
        email: email ?? existingCompany.email,
        phone: phone ?? existingCompany.phone,
        website: website ?? existingCompany.website,
        logo_url: logo_url ?? existingCompany.logo_url,
        area_id: area_id ?? existingCompany.area_id,
        company_type_id: company_type_id ?? existingCompany.company_type_id,
        description: description ?? existingCompany.description,
        documents_url: documents_url ?? existingCompany.documents_url,
        // established_year: established_year ?? existingCompany.established_year,
        social_media_links:
          JSON.stringify(social_media_links) ??
          existingCompany.social_media_links,
      },
    });
    res.json({
      message: "company is updated ",
      editcompany: {
        ...editcompany,
        id: hashId(editcompany.id),
        areas: {
          ...editcompany.areas,
          id: hashId(editcompany.area_id),
        },
        company_type: {
          ...editcompany.company_type,
          id: hashId(editcompany.company_type_id),
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        website: true,
        logo_url: true,
        areas: {
          select: {
            id: true,
            city_id: true,
          },
        },
        company_type: true,
        description: true,
        documents_url: true,
        established_year: true,
        social_media_links: true,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
};

const fetchCompanyByArea = async (req, res) => {
  try {
    const { areaId } = parseInt(req.params);
    const companies = await prisma.companies.findMany({
      where: {
        area_id: areaId,
      },
      include: {
        areas: true,
      },
    });
    if (!companies || companies.length === 0) {
      return res.status(404).json({
        error: "No companies found for this area",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company area fetched succesfully",
      data: {
        companies: {
          ...companies,
          areaId: hashId(areaId),
        },
      },
      count: companies.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
};

const fetchPremiumCompanies = async (req, res) => {
  try {
    const premiumCompany = await prisma.companies.findMany({
      where: { is_premium: true },
      include: {
        areas: true,
      },
    });
    if (!premiumCompany || premiumCompany.length === 0) {
      return res.status(404).json({
        error: "No premium companies found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Premium companies fetched successfully",
      data: premiumCompany,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

const togglePremiumCompanyStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const company = await prisma.companies.findUnique({
      where: {
        id,
      },
    });
    if (!company) {
      return res.status(404).json({
        error: "Company not found",
      });
    }

    const updateCompany = await prisma.companies.update({
      where: {
        id,
      },
      data: {
        is_premium: !company.is_premium,
      },
    });
    return res.status(200).json({
      success: true,
      message: `Company ${
        updateCompany.is_premium ? "true" : "false"
      } updated successfully`,
      data: updateCompany,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
};

const fetchBlockedCompany = async (req, res) => {
  try {
    const blockedCompany = await prisma.companies.findMany({
      where: {
        is_blocked: true,
      },
      include: {
        areas: true,
      },
    });

    if (!blockedCompany || blockedCompany.length === 0) {
      return res.status(404).json({
        error: "No blocked companies found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Blocked companies fetched successfully",
      data: blockedCompany,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
};

const toggleBlockedCompanyStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const blockedCompany = await prisma.companies.findUnique({
      where: {
        id,
      },
    });
    if (!blockedCompany) {
      return res.status(404).json({
        error: "Company not found",
      });
    }
    const updatedBlockedCompany = await prisma.companies.update({
      where: {
        id,
      },
      data: {
        is_blocked: !blockedCompany.is_blocked,
      },
    });
    return res.status(200).json({
      success: true,
      message: `Company ${
        updatedBlockedCompany ? "true" : "false"
      } updated successfully`,
      data: updatedBlockedCompany,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
};

const getProductCountForSingleCompany = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const company = await prisma.companies.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product count for company fetched successfully",
      data: {
        id: company.id,
        name: company.name,
        productCount: company._count.products,
      },
    });
  } catch (error) {
    console.error("Error fetching product count for company:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product count for company",
    });
  }
};
const getCompanyNameAccordingToRating = async (req, res) => {
  try {
    const sortedCompaniesAccordingToRating = await prisma.companies.findMany({
      orderBy: {
        average_rating: "desc",
      },
      select: {
        id: true,
        name: true,
        average_rating: true,
      },
    });
    console.log(
      "Sorted Companies According to Rating:",
      sortedCompaniesAccordingToRating
    );

    if (sortedCompaniesAccordingToRating.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No companies found with the same or higher rating",
      });
    }
    console.log(
      "Sorted Companies According to Rating:",
      sortedCompaniesAccordingToRating
    );

    res.status(200).json({
      success: true,
      message: "Companies fetched according to rating",
      data: sortedCompaniesAccordingToRating.map((c) => ({
        id: hashId(c.id),
        name: c.name,
        average_rating: c.average_rating,
      })),
    });
  } catch (error) {
    console.error("Error fetching company name according to rating:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getCategoriesAndSubcategoriesByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const categories = await prisma.categories.findMany({
      where: {
        parent_id: null, // only parent categories
        products: {
          some: { company_id: parseInt(companyId) }, // parent category has products of this company
        },
      },
      select: {
        id: true,
        name: true,
        // children relation name in your schema is `children`
        children: {
          where: {
            // only include subcategories that have products from this company
            products: { some: { company_id: parseInt(companyId) } },
          },
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (categories.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No categories found for this company",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Categories and subcategories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getProductsBySubcategoryOrCategory = async (req, res) => {
  try {
    const { sub_categoryId } = req.params;

    const products = await prisma.products.findMany({
      where: {
        category_id: parseInt(sub_categoryId),
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        is_featured: true,
        created_at: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const STOPWORDS = new Set([
  "pvt",
  "ltd",
  "company",
  "co",
  "inc",
  "llc",
  "the",
  "and",
]);

const normalizeAndTokens = (s) => {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // remove punctuation (dots, commas)
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !STOPWORDS.has(t) && t.length >= 2); // drop stopwords & 1-char tokens
};

const searchProductOrCompanyController = async (req, res) => {
  const { search } = req.query;

  try {
    if (!search || !search.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const q = search.trim();

    // 1) Exact product (DB collation decides case-sensitivity)
    let product = await prisma.products.findFirst({
      where: {
        name: {
          equals: q,
        },
      },
    });
    if (product)
      return res.status(200).json({
        success: true,
        type: "product",
        product,
      });

    // 2) Exact company -> return its products
    let company = await prisma.companies.findFirst({
      where: {
        name: {
          equals: q,
        },
      },
      select: {
        products: true,
      },
    });
    if (company)
      return res.status(200).json({
        success: true,
        type: "company",
        products: company.products,
      });

    // --- exact not found, now related fallback ---

    const tokens = normalizeAndTokens(q); // remove pvt/ltd/company etc

    // If no useful tokens (e.g., query was only "Pvt. Ltd."), fallback to simple contains on full q
    if (tokens.length === 0) {
      // try contains on full query (less ideal but fallback)
      const productsByContains = await prisma.products.findMany({
        where: {
          name: {
            contains: q,
          },
        },
        take: 20,
      });
      if (productsByContains.length > 0)
        return res.status(200).json({
          success: true,
          type: "products",
          products: productsByContains,
        });

      const companiesByContains = await prisma.companies.findMany({
        where: {
          name: {
            contains: q,
          },
        },
        select: {
          products: true,
        },
        take: 20,
      });
      if (companiesByContains.length > 0)
        return res.status(200).json({
          success: true,
          type: "company_matches",
          companies: companiesByContains,
        });

      return res.status(404).json({
        success: false,
        message: "No product or company found matching the search",
      });
    }

    // 3) Related products: match ANY token (OR). You can change to AND if you want stricter.
    const relatedProducts = await prisma.products.findMany({
      where: {
        OR: tokens.map((t) => ({ name: { contains: t } })),
      },
      take: 20,
    });

    // 4) Related companies: match ANY token, include their products
    const relatedCompanies = await prisma.companies.findMany({
      where: {
        OR: tokens.map((t) => ({ name: { contains: t } })),
      },
      select: { products: true },
      take: 20,
    });

    // If both empty, return 404
    if (relatedProducts.length === 0 && relatedCompanies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No product or company found matching the search",
      });
    }

    // Return whichever exists (both included)
    return res.status(200).json({
      success: true,
      type: "related",
      companies: relatedCompanies,
    });
  } catch (error) {
    console.error("Error in search:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getNearbyCompaniesController = async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    // 1. Get user's company and its area_id
    const userCompany = await prisma.companies.findFirst({
      where: {
        created_by: userId,
      },
      select: {
        id: true,
        area_id: true,
      },
    });

    if (!userCompany || !userCompany.area_id) {
      return res.status(404).json({
        success: false,
        message: "User's company or area not found",
      });
    }

    // 2. Get nearby area IDs from nearby_areas table
    const nearbyAreas = await prisma.nearby_areas.findMany({
      where: {
        area_id: userCompany.area_id,
      },
      select: {
        nearby_area_id: true,
      },
    });

    const nearbyAreaIds = nearbyAreas.map((a) => a.nearby_area_id);

    if (nearbyAreaIds.length === 0) {
      return res.status(200).json({
        success: true,
        nearbyCompanies: [],
      });
    }

    // 3. Find companies in nearby areas (excluding user's own company)
    const nearbyCompanies = await prisma.companies.findMany({
      where: {
        area_id: {
          in: nearbyAreaIds,
        },
        id: {
          not: userCompany.id,
        }, // exclude user's company
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo_url: true,
      },
    });

    return res.status(200).json({
      success: true,
      nearbyCompanies,
    });
  } catch (error) {
    console.error("Error fetching nearby companies:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export {
  fetchCompany,
  fetchSingleCompany,
  createCompany,
  deleteCompany,
  updateCompany,
  fetchCompanyByArea,
  fetchPremiumCompanies,
  fetchBlockedCompany,
  togglePremiumCompanyStatus,
  toggleBlockedCompanyStatus,
  getProductCountForSingleCompany,
  getCategoriesAndSubcategoriesByCompany,
  getProductsBySubcategoryOrCategory,
  searchProductOrCompanyController,
  getNearbyCompaniesController,
  getCompanyNameAccordingToRating,
};

