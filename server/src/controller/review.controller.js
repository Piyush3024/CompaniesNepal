import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
import { hashId, decodeHashId } from "../randomgenerator.js";

const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.id);

    const { rating, comment, companyId } = req.body;

    console.log(req.body);

    if (!productId || !rating || !comment || !companyId || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    // to check the company and the product are same as the user is logged in
    const company = await prisma.companies.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    console.log("Company ID:", company.id);

    if (product.company_id !== companyId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to review this product",
      });
    }
    // Create the review
    const review = await prisma.company_reviews.create({
      data: {
        rating,
        comment,
        user_id: userId,
        company_id: companyId,
      },
    });
    await calculateAndUpdateProductRating(productId);
    await calculateAndUpdateCompanyRating(companyId);

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: {
        id: hashId(review.id),
        rating: review.rating,
        comment: review.comment,
        userId: hashId(review.user_id),
        companyId: hashId(review.company_id),
      },
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const getReview = async (req, res) => {
  try {
    const decodedReviewId = decodeHashId(req.params.id);
    const reviewId = decodedReviewId;

    if (!reviewId) {
      return res.status(400).json({ error: "Missing review ID" });
    }
    // Fetch the review

    const review = await prisma.company_reviews.findUnique({
      where: {
        id: reviewId,
      },
      include: {
        // product: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        companies: {
          select: {
            id: true,
            name: true,
            average_rating: true,
            total_reviews: true,
          },
        },
      },
    });
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Review fetched successfully",
      data: {
        id: hashId(review.id),
        rating: review.rating,
        comment: review.comment,
        user: {
          id: hashId(review.user.id),
          username: review.user.username,
          email: review.user.email,
        },
        company: {
          id: hashId(review.companies.id),
          name: review.companies.name,
          average_rating: review.companies.average_rating,
          total_reviews: review.companies.total_reviews,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const deleteReview = async (req, res) => {
  try {
    const decodedDeleteReviewId = decodeHashId(req.params.id);
    const reviewId = decodedDeleteReviewId;
    if (!reviewId) {
      return res.status(400).json({
        error: "Missing review ID",
      });
    }
    // Check if the review exists
    const review = await prisma.company_reviews.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    const { productId, companyId } = review;
    // Delete the review
    const deleteReview = await prisma.company_reviews.delete({
      where: { id: reviewId },
    });
    // Update the product and company ratings
    await calculateAndUpdateProductRating(productId);
    await calculateAndUpdateCompanyRating(companyId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: {
        id: hashId(deleteReview.id),
        rating: deleteReview.rating,
        comment: deleteReview.comment,
        userId: hashId(deleteReview.user_id),
        companyId: hashId(deleteReview.company_id),
      },
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const calculateAndUpdateProductRating = async (productId) => {
  try {
    const allProductsReviews = await prisma.product_reviews.findMany({
      where: {
        product_id: productId,
      },
      select: {
        // product_reviews: {
        // select: {
        rating: true,
        // },
        // },
      },
    });
    if (!allProductsReviews || allProductsReviews.length === 0) {
      console.log("No reviews found for this product.");
      return;
    }
    const totalReviews = allProductsReviews.length;
    const sum = allProductsReviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    const averageRating = sum / totalReviews;
    await prisma.products.update({
      where: { id: productId },
      data: {
        average_rating: averageRating,
        total_reviews: totalReviews,
      },
    });
    return { average_rating: averageRating, total_reviews: totalReviews };
  } catch (error) {
    console.error("Error calculating and updating product rating:", error);
  }
};
const calculateAndUpdateCompanyRating = async (companyId) => {
  try {
    const allCompanyReviews = await prisma.company_reviews.findMany({
      where: {
        company_id: companyId,
      },
      select: {
        rating: true,
      },
    });

    if (!allCompanyReviews || allCompanyReviews.length === 0) {
      console.log("No reviews found for this company.");
      return;
    }
    const totalReviews = allCompanyReviews.length;
    const sum = allCompanyReviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    const averageRating = sum / totalReviews;
    console.log("Average Rating:", averageRating);
    await prisma.companies.update({
      where: {
        id: companyId,
      },
      data: {
        average_rating: averageRating,
        total_reviews: totalReviews,
      },
    });
    return { average_rating: averageRating, total_reviews: totalReviews };
  } catch (error) {
    console.error("Error calculating and updating company rating:", error);
  }
};

export { createReview, getReview, deleteReview };
