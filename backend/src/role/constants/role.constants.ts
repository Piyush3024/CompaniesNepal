export const ROLE_NAME_CONFIG = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
  REGEX: /^[a-zA-Z0-9\s&\-.'()]+$/,
  MESSAGE:
    "Role name must be 2-50 characters and contain only letters, numbers, spaces, and special characters (&, -, ., ', ())",
};

export const ROLE_ERRORS = {
  NOT_FOUND: 'Role not found',
  CREATION_FAILED: 'Failed to create role',
  UPDATE_FAILED: 'Failed to update role',
  DELETION_FAILED: 'Failed to delete role',
};
