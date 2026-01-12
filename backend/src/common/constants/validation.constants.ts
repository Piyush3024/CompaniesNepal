export const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REGEX:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d@$!%*?&^#()_+\-=[\]{};':"\\|,.<>/?]/,
  MESSAGE:
    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
};

export const USERNAME_CONFIG = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 50,
  REGEX: /^[a-zA-Z0-9_-]+$/,
  MESSAGE:
    'Username must be 3-50 characters and contain only letters, numbers, hyphens, and underscores',
};

export const EMAIL_CONFIG = {
  MAX_LENGTH: 254,
  MESSAGE: 'Please provide a valid email address',
};

export const PHONE_CONFIG = {
  REGEX: /^\+?[1-9]\d{1,14}$/,
  MESSAGE: 'Phone number must be in valid international format',
};

export const LOCATION_CONFIG = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  NAME_REGEX: /^[a-zA-Z\s\-.'()]+$/,
  NAME_MESSAGE:
    'Location name must contain only letters, spaces, hyphens, apostrophes, periods, and parentheses',
};

export const STATE_CODE_CONFIG = {
  MAX_LENGTH: 10,
  REGEX: /^[A-Z0-9-]+$/,
  MESSAGE:
    'State code must contain only uppercase letters, numbers, and hyphens',
};

export const POSTAL_CODE_CONFIG = {
  MAX_LENGTH: 20,
  REGEX: /^[A-Z0-9\s-]+$/i,
  MESSAGE:
    'Postal code must contain only letters, numbers, spaces, and hyphens',
};

export const GENERIC_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid credentials provided',
  INVALID_TOKEN: 'Invalid or expired token',
  VALIDATION_FAILED: 'Validation failed',
  INVALID_ID: 'Invalid ID provided',
  RESOURCE_NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
};
