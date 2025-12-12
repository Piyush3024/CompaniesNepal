import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const createCategory = async (req , res) =>{
  try {
    const {name , image_url, description, subcategories } = req.body
    const category = await prisma.categories.create({
      data : {
        name,
        image_url,
        description,
        subcategories
      }
    })

    res.status(200).json({
      success : true,
      message : "Category created successfully.",
      data : category
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to create category.'
    })
  }
}

export const getCategoryById = async (req, res) => {
  try {
    const {id} = req.params;
    const category = await prisma.categories.findUnique({
      where: {
        id: parseInt(id)
      },
      select: {
        name:true,
        parent:true,
        children:true,
        image_url:true,
        created_at:true,
        products: true
      }
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    console.log(category)

    res.status(200).json({
      success: true,
      data: category,
      message: 'Category fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch category'
    });
  }
};

export const updateCategory = async (req,res) => {
  try {
    const {id} = req.params;
    // const {data} =  req.body
    const {name , image_url , description} = req.body
    // First check if category exists
    const existingCategory = await prisma.categories.findUnique({
      where: { 
        id: parseInt(id) 
      }
    });

    if (!existingCategory) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const updatedCategory = await prisma.categories.update({
      where: {
        id: parseInt(id)
      },
      data: {
        name : name ?? existingCategory.name,
        image_url : image_url ?? existingCategory.image_url,
        description : description ?? existingCategory.description,
        updated_at: new Date()
      }
    });

    res.status(200).json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to update category'
    });
  }
};

export const deleteCategory = async (req , res) => {
  try {
    const {id} = req.params;
    // First check if category exists
    const existingCategory = await prisma.categories.findUnique({
      where: { 
        id: parseInt(id) 
      },
      include: {
        products: true
      }
    });

    if (!existingCategory) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has associated products
    if (existingCategory.products && existingCategory.products.length > 0) {
      return {
        success: false,
        message: `Cannot delete category. It has ${existingCategory.products.length} associated products.`
      };
    }

    await prisma.categories.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to delete category'
    });
  }
};

export const getCategories = async (req , res) =>{
  try {
    const categories = await prisma.categories.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length,
      message: 'Categories fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch categories'
    });
  }
};

export const getSubcategories = async (req, res) => {
  try {
    const { parentId } = req.params;

    const subcategories = await prisma.categories.findMany({
      where: { parent_id: parseInt(parentId) },
      include: { products: true },
    });

    res.status(200).json({
      success: true,
      data: subcategories,
      count: subcategories.length,
      message: `Subcategories for category ID ${parentId} fetched successfully`,
    });
  } catch (error) {
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

    // Check if parent category exists
    const parentCategory = await prisma.categories.findUnique({
      where: { id: parseInt(parentId) },
    });

    if (!parentCategory) {
      res.status(404).json({
        success: false,
        message: "Parent category not found.",
      });
    }

    const subcategory = await prisma.categories.findUnique({
      where: { id: parseInt(subcategoryId) },
    });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found.",
      });
    }

        const updatedSubcategory = await prisma.categories.update({
      where: { id: parseInt(subcategoryId) },
      data: {
        parent_id: parseInt(parentId), // Set parent_id to parent category's ID
      },
    });
    
    res.status(201).json({
      success: true,
      message: "Subcategory added to parent category successfully.",
      data: updatedSubcategory,
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

