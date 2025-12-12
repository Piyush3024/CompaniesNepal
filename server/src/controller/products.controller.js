import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const fetchProducts = async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        unit: true,
      },
    });
    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Products not found",
    });
  }
};

const fetchProductById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }
  try {
    const singleProduct = await prisma.products.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        unit: true,
      },
    });
    if (!singleProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: singleProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, price, description, unit, slug , company_id} = req.body;
    if (!name || !price || !description || !unit) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    const product = await prisma.products.create({
      data: {
        name,
        price,
        description,
        unit,
        slug,
        company_id
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        unit: true,
        slug : true,
        company_id :true
      },
    });
    if (!product) {
      return res.status(400).json({
        message: "Product creation failed",
      });
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    const { name, price, description, unit } = req.body;
    // if (!name || !price || !description || !unit) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "All fields are required",
    //   });
    // }
    const product = await prisma.products.update({
      where: {
        id,
      },
      data: {
        name,
        price,
        description,
        unit,
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        unit: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "error while  updating product",
    });
  }
};

const deleteProduct = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }
  try {
    const product = await prisma.products.delete({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting product",
    });
  }
};

const toggleIsFeatured = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }
  try {
    const product = await prisma.products.findUnique({
      where: { id },
      select: {
        is_featured: true,
      },
    });

    const updatedProduct = await prisma.products.update({
      where: { id },
      data: {
        is_featured: !product.is_featured,
      },
      select: {
        id: true,
        name: true,
        is_featured: true,
      },
    });
    res.status(200).json({
      success: true,
      message: "Product featured status toggled successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while toggling featured status",
    });
  }
};

const getFeaturedProductsByCategory = async (req, res) => {
  const categoryId = parseInt(req.params.categoryId);

  try {
    const featuredProducts = await prisma.products.findMany({
      where: {
        is_featured: true,
        category_id: categoryId,
      },
      select: {
        id: true,
        name: true,
        price: true,
        is_featured: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `Featured products for category ID ${categoryId} fetched successfully`,
      data: featuredProducts,
    });
  } catch (error) {
    console.error("Error fetching featured products by category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured products by category",
    });
  }
};

const getProductsWithLowStock = async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        unit: {
          gte: 0, // ✅ unit is not negative
          lt: 3,  // ✅ unit is less than 3 (i.e., 0, 1, or 2)
        },
      },
      select: {
        id: true,
        name: true,
        unit: true,
        price: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Products with low stock (unit between 0 and 2) fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products with low stock:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products with low stock",
    });
  }
};


export {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleIsFeatured,
  fetchProductById,
  getFeaturedProductsByCategory,
  getProductsWithLowStock
};