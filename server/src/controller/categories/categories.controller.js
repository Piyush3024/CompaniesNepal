import pkg from "@prisma/client";
import { decodeId, encodeId } from "../../lib/secure.js";
import { handleLocalFileUploads } from "../../middleware/file/multer.middleware.js";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Helper function to generate unique category slug
const generateCategorySlug = async (name, prisma, excluded = null) => {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Remove multiple hyphens
  let uniqueSlug = slug;
  let count = 1;

  while (
    await prisma.categories.findFirst({
      where: {
        slug: uniqueSlug,
        id: excluded ? { not: excluded } : undefined,
      },
    })
  ) {
    uniqueSlug = `${slug}-${count}`;
    count++;
  }
  return uniqueSlug;
};
export const generateAndSetCategorySlug = async (categoryId) => {
  const category = await prisma.categories.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    throw new Error("Category not found");
  }
  const slug = await generateCategorySlug(category.name, prisma, categoryId);
  await prisma.categories.update({
    where: { id: categoryId },
    data: { slug },
  });
};

// Helper function to format categories response

const formatCategoriesResponse = (category, req, includeRelations = false) => {
  const formatted = {
    id: encodeId(category.id),
    name: category.name,
    description: category.description,
    image_url: category.image_url,
    slug: category.slug,
    products: includeRelations ? category.products : undefined,

    if(includeRelations) {
      if (category.products) {
        formatted.products = {
          id: encodeId(category.products.id),
        };
      }
      this.if(category.parent);
      {
        formatted.parent = {
          id: encodeId(category.parent.id),
          name: category.parent.name,
        };
      }
      if (category.children) {
        formatted.children = category.children.map((child) => ({
          id: encodeId(child.id),
          name: child.name,
        }));
      }
    },
  };
  return formatted;
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    let { image_url } = req.body;

    // category.id = decodedCategoryId;

    // handle file uploads
    const uploadedFiles = handleLocalFileUploads(req);

    const finalImagePaths = uploadedFiles.image_url;
    if (finalImagePaths && finalImagePaths.length > 0) {
      image_url = finalImagePaths;
    }

    const existingCategory = await prisma.categories.findFirst({
      where: {
        name: name,
      },
    });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists.",
      });
    }

    const category = await prisma.categories.create({
      data: {
        name,
        image_url,
        description,
        slug: await generateCategorySlug(name, prisma),
      },
    });

    res.status(200).json({
      success: true,
      message: "Category created successfully.",
      data: formatCategoriesResponse(category, req, false),
    });
  } catch (error) {
    console.error("Error in createCategory:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to create category.",
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    let category;
    const decodedId = decodeId(id);
    if (decodeId === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if (decodeId) {
      category = await prisma.categories.findUnique({
        where: { id: decodedId },
        select: {
          id: true,
          name: true,
          parent: true,
          children: true,
          image_url: true,
          products: true,
          slug: true,
          description: true,
        },
      });
    }

    // console.log("Categories: ", category);

    // category = await prisma.categories.findUnique({
    //   where: {
    //     id: parseInt(id),
    //   },
    //   select: {
    //     name: true,
    //     parent: true,
    //     children: true,
    //     image_url: true,
    //     created_at: true,
    //     products: true,
    //   },
    // });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: formatCategoriesResponse(category, req, true),
      message: "Category fetched successfully",
    });
  } catch (error) {
    console.error("error in get catgory by id", error);

    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to fetch category",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeId(id);
    const { name, image_url, description } = req.body;
    // First check if category exists
    const existingCategory = await prisma.categories.findUnique({
      where: {
        id: decodedId,
      },
    });

    if (!existingCategory) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const updatedCategory = await prisma.categories.update({
      where: {
        id: decodedId,
      },
      data: {
        name: name ?? existingCategory.name,
        image_url: image_url ?? existingCategory.image_url,
        description: description ?? existingCategory.description,
        updated_at: new Date(),
      },
      // data: {
      //   name: name ?? existingCategory.name,
      //   image_url: image_url ?? existingCategory.image_url,
      //   description: description ?? existingCategory.description,
      //   updated_at: new Date(),
      // },
    });

    res.status(200).json({
      success: true,
      data: formatCategoriesResponse(updatedCategory, req, false),
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Error in updateCategory:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to update category",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const decodedId = decodeId(id);
    // First check if category exists
    const existingCategory = await prisma.categories.findUnique({
      where: {
        id: decodedId,
      },
      include: {
        products: true,
      },
    });

    if (!existingCategory) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category has associated products
    if (existingCategory.products && existingCategory.products.length > 0) {
      return {
        success: false,
        message: `Cannot delete category. It has ${existingCategory.products.length} associated products.`,
      };
    }

    await prisma.categories.delete({
      where: {
        id: decodedId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to delete category",
    });
  }
};

export const getCategories = async (req, res) => {
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
    const where = {
      parent_id: null,
    };

    const [categories, total] = await Promise.all([
      prisma.categories.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      }),
      prisma.categories.count({ where }),
    ]);
    res.status(200).json({
      success: true,
      data: categories.map((category) =>
        formatCategoriesResponse(category, req, true)
      ),
      count: categories.length,
      message: "Categories fetched successfully",

      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to fetch categories",
    });
  }
};
// helper function to format subcategory response
const formatSubCategoryResponse = (
  subcategory,
  req,
  includeRelations = false
) => {
  const formatted = {
    id: encodeId(subcategory.id),
    name: subcategory.name,
    description: subcategory.description,
    image_url: subcategory.image_url,
    slug: subcategory.slug,
    products: includeRelations ? subcategory.products : undefined,
    slug: subcategory.slug,

    if(includeRelations) {
      if (subcategory.products) {
        formatted.products = {
          id: encodeId(subcategory.products.id),
        };
      }
      if (subcategory.parent) {
        formatted.parent = {
          id: encodeId(subcategory.parent.id),
          name: subcategory.parent.name,
        };
      }
      if (subcategory.children) {
        formatted.children = subcategory.children.map((child) => ({
          id: encodeId(child.id),
          name: child.name,
        }));
      }
    },
  };

  return formatted;
};

// Get subcategories of a parent category
export const getSubcategories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;

    const skip = parseInt(page - 1) * parseInt(limit);
    const take = parseInt(limit);
    const where = {};

    const { parentId } = req.params;
    const decodedId = decodeId(parentId);

    const [subcategories, total] = await Promise.all([
      prisma.categories.findMany({
        where: { parent_id: decodedId },
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,

              slug: true,
              description: true,
            },
          },
        },
      }),
      prisma.categories.count({ where }),
    ]);

    // const subcategories = await prisma.categories.findMany({
    //   where: { parent_id: decodedId },
    //   include: { products: true },
    // });

    res.status(200).json({
      success: true,
      data: subcategories.map((subcategory) => {
        return formatSubCategoryResponse(subcategory, req, true);
      }),
      count: subcategories.length,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      message: `Subcategories for category ID ${parentId} fetched successfully`,
    });
  } catch (error) {
    console.error("Error in getSubcategories:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to fetch subcategories",
    });
  }
};

// Add a subcategory to a parent category
export const addSubcategory = async (req, res) => {
  try {
    const { parentId } = req.params; // Parent category ID from URL
    const { subcategoryId } = req.body; // Subcategory details
    const decodedSubcategoryId = decodeId(subcategoryId);

    const decodedId = decodeId(parentId);

    // Check if parent category exists
    const parentCategory = await prisma.categories.findUnique({
      where: { id: decodedId },
    });

    if (!parentCategory) {
      res.status(404).json({
        success: false,
        message: "Parent category not found.",
      });
    }
    const existingSubcategory = await prisma.categories.findMany({
      where: {
        id: decodedSubcategoryId,
      },
    });
    if (!existingSubcategory) {
      return res.status(400).json({
        success: false,
        message: ` Subcategory with ID ${decodedSubcategoryId} does not exist.`,
      });
    }

  

    // update subcategory to set its parent_id
    const updatedSubCategory = await prisma.categories.update({
      where: { id: decodedSubcategoryId },
      data: { parent_id: decodedId, updated_at: new Date() },
      include: {
        parent: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Subcategory added to parent category successfully.",
      data: formatCategoriesResponse(updatedSubCategory, req, false),
    });
  } catch (error) {
    console.error("Error in addSubcategory:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to add subcategory.",
    });
  }
};
