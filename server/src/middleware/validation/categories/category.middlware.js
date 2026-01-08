import { validationResult } from "express-validator";

import { CATEGORY_IMAGE_FILE_CONFIG } from "./category.validation.constant.js";

//handle validation errors
export const handleCatgoryValidationErros = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("Category validation errors:", errors.array());
    return res.status(400).json({
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

// File upload validation middleware

// export const validateCategoryFileUpload = (req, res, next) => {
//   try {
//     // validate image if present
//     if (req.files?.image_url[0] || req.file?.fieldname === "image_url") {
//       const imageFile = req.files?.image_url[0] || req.file;
//     }
//   } catch (error) {
//     return res.status(400).json({ error: CATEGORY_IMAGE_FILE_CONFIG.MESSAGE });
//   }
// };

// // helper function to validate file
// const validateFile = (file, config) => {
//   if (!file) return true;
// };

// new validate code
export const validateCategoryFileUpload = (req, res, next) => {
  try {
    // Validate logo if present
    if (req.files?.logo_url?.[0] || req.file?.fieldname === "logo_url") {
      const logoFile = req.files?.logo_url?.[0] || req.file;

      if (!validateFile(logoFile, COMPANY_FILE_CONFIG.LOGO)) {
        return res.status(400).json({
          success: false,
          message: "Invalid logo file",
          error: COMPANY_FILE_CONFIG.LOGO.MESSAGE,
        });
      }
    }

    // Validate documents if present
    if (req.files?.documents_url && Array.isArray(req.files.documents_url)) {
      if (
        req.files.documents_url.length > COMPANY_FILE_CONFIG.DOCUMENTS.MAX_FILES
      ) {
        return res.status(400).json({
          success: false,
          message: "Too many documents",
          error: `Maximum ${COMPANY_FILE_CONFIG.DOCUMENTS.MAX_FILES} documents allowed`,
        });
      }

      for (const docFile of req.files.documents_url) {
        if (!validateFile(docFile, COMPANY_FILE_CONFIG.DOCUMENTS)) {
          return res.status(400).json({
            success: false,
            message: "Invalid document file",
            error: COMPANY_FILE_CONFIG.DOCUMENTS.MESSAGE,
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error("File validation error:", error);
    res.status(500).json({
      success: false,
      message: "Error validating files",
      error: error.message,
    });
  }
};

// Helper function to validate file
const validateFile = (file, config) => {
  if (!file) return true;

  // Check file size
  if (file.size > config.MAX_SIZE_BYTES) {
    return false;
  }

  // Check MIME type
  if (!config.ALLOWED_TYPES.includes(file.mimetype)) {
    return false;
  }

  // Check file extension
  const fileExtension = file.originalname.split(".").pop().toLowerCase();
  if (!config.ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return false;
  }

  return true;
};
