// category name validation
export const CATEGORY_NAME_CONFIG = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 100,
  REGEX: /^[a-zA-Z0-9\s&\-.'()]+$/,
  MESSAGE:
    "Category name must be 2-100 characters and can include letters ,numbers,spaces and special characters (&, -, ., ', ())",
};

//category description validation
export const CATEGORY_DESCRIPTION_CONFIG = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 1000,
  MESSAGE: "Category description must be 10-1000 characters long",
};

// slug validation
export const CATEGORY_SLUG_CONFIG = {
  MAX_LENGTH: 255,
  REGEX: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  MESSAGE: "Slug must contain only lowercase letters,numbers and hyphens",
};

//image file upload validation
export const CATEGORY_IMAGE_FILE_CONFIG = {
  IMAGE: {
    MAX_SIGE_MB: 5,
    MAX_SIZE_BYTES: 5 * 1024 * 1024,
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    ALLOWED_EXTENSIONS: ["jpg", "jpeg", "png", "gif", "webp"],
    MESSAGE:
      "Image must be a valid image file(jpg,jpeg,png,gif,webp) and not exceed 5MB",
  },
};
// Generic category errors
export const CATEGORY_ERRORS = {
    NOT_FOUND: "Category not found",
    MAX_CATEGORIES_EXCEEDED: "Maximum number of categories exceeded",
    INVALID_FILE: "Invalid file uploaded for category",
    INAVLID_FILE_TYPE: "Invalid file type for category image",
    CREATION_FAILED: "failed to create category",
    UPDATE_FAILED: "Failed to update category",
  };
