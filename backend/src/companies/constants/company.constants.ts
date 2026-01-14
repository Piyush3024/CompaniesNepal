export const COMPANY_NAME_CONFIG = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 255,
  REGEX: /^[a-zA-Z0-9\s&\-.'()]+$/,
  MESSAGE:
    "Company name must be 2-255 characters and contain only letters, numbers, spaces, and special characters (&, -, ., ', ())",
};

export const COMPANY_DESCRIPTION_CONFIG = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 2000,
  MESSAGE: 'Description must be 10-2000 characters',
};

export const COMPANY_EMAIL_CONFIG = {
  MAX_LENGTH: 255,
  MESSAGE: 'Please provide a valid company email address',
};

export const COMPANY_PHONE_CONFIG = {
  MAX_LENGTH: 20,
  REGEX: /^\+?[1-9]\d{1,14}$/,
  MESSAGE: 'Phone number must be in valid international format',
};

export const COMPANY_WEBSITE_CONFIG = {
  MAX_LENGTH: 255,
  REGEX: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i,
  MESSAGE: 'Please provide a valid website URL (http/https optional)',
};

export const COMPANY_REGISTRATION_CONFIG = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 100,
  REGEX: /^[a-zA-Z0-9\-/]+$/,
  MESSAGE:
    'Registration number must be 1-100 characters and contain only letters, numbers, hyphens, and slashes',
};

export const COMPANY_ESTABLISHED_YEAR_CONFIG = {
  MIN_YEAR: 1800,
  MAX_YEAR: new Date().getFullYear(),
  MESSAGE: `Established year must be between 1800 and ${new Date().getFullYear()}`,
};

export const COMPANY_SLUG_CONFIG = {
  MAX_LENGTH: 255,
  REGEX: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  MESSAGE: 'Slug must contain only lowercase letters, numbers, and hyphens',
};

export const COMPANY_SOCIAL_MEDIA_CONFIG = {
  SUPPORTED_PLATFORMS: [
    'facebook',
    'twitter',
    'instagram',
    'linkedin',
    'youtube',
    'tiktok',
    'whatsapp',
    'telegram',
  ],
  URL_REGEX: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i,
  MESSAGE: 'Please provide valid social media URLs',
  PLATFORM_MESSAGE:
    'Supported platforms: facebook, twitter, instagram, linkedin, youtube, tiktok, whatsapp, telegram',
};

// File config moved to generic file-upload module

export const COMPANY_BRANCH_CONFIG = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 255,
  NAME_REGEX: /^[a-zA-Z0-9\s&\-.'()]+$/,
  NAME_MESSAGE: 'Branch name must be 2-255 characters',
};

export const COMPANY_CATEGORY_CONFIG = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 100,
  MAX_CATEGORIES: 10,
  REGEX: /^[a-zA-Z0-9\s&\-.'()]+$/,
  MESSAGE: 'Category name must be 2-100 characters',
};

export const COMPANY_FILTER_CONFIG = {
  VALID_SORT_FIELDS: [
    'name',
    'created_at',
    'updated_at',
    'average_rating',
    'total_reviews',
    'total_products',
    'total_inquiries',
    'established_year',
    'verified_at',
  ],
  DEFAULT_SORT_BY: 'created_at',
  DEFAULT_SORT_ORDER: 'desc',
  RATING_MIN: 0,
  RATING_MAX: 5,
  MIN_YEAR: 1800,
  MAX_YEAR: new Date().getFullYear(),
  COUNT_MIN: 0,
  COUNT_MAX: 10000,
};

export const COMPANY_ERRORS = {
  NOT_FOUND: 'Company not found',
  SLUG_EXISTS: 'Company slug already exists',
  INVALID_COMPANY_TYPE: 'Invalid company type',
  INVALID_AREA: 'Invalid area',
  INVALID_VERIFICATION_STATUS: 'Invalid verification status',
  PERMISSION_DENIED: "You don't have permission to perform this action",
  INVALID_FILE: 'Invalid file provided',
  FILE_SIZE_EXCEEDED: 'File size exceeded the maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  CREATION_FAILED: 'Failed to create company',
  UPDATE_FAILED: 'Failed to update company',
  DELETION_FAILED: 'Failed to delete company',
  MAX_FILES_EXCEEDED: 'Maximum number of files exceeded',
  BLOCKED_COMPANY: 'This company is currently blocked',
  ONLY_ADMINS_CAN_DELETE: 'Only admins can delete companies',
};

// Removed - upload paths are now managed in file-upload module
