export const STATUS_NAME_CONFIG = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 250,
  REGEX: /^[a-zA-Z0-9\s&\-.'()]+$/,
  MESSAGE:
    "Status name must be 2-250 characters and contain only letters, numbers, spaces, and special characters (&, -, ., ', ())",
};

export const STATUS_ERRORS = {
  NOT_FOUND: 'Status not found',
  CREATION_FAILED: 'Failed to create status',
  UPDATE_FAILED: 'Failed to update status',
  DELETION_FAILED: 'Failed to delete status',
};
