
export const PASSWORD_CONFIG = {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?]/,
    MESSAGE: 'Password must be at least 12 characters and include uppercase, lowercase, number, and special character'
};


export const USERNAME_CONFIG = {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    REGEX: /^[a-zA-Z0-9_-]+$/,
    MESSAGE: 'Username must be 3-50 characters and contain only letters, numbers, hyphens, and underscores'
};


export const EMAIL_CONFIG = {
    MAX_LENGTH: 254, 
    MESSAGE: 'Please provide a valid email address'
};


export const PHONE_CONFIG = {
    REGEX: /^\+?[1-9]\d{1,14}$/,
    MESSAGE: 'Phone number must be in valid international format'
};



export const GENERIC_ERRORS = {
    INVALID_CREDENTIALS: 'Invalid credentials provided',
    INVALID_TOKEN: 'Invalid or expired token',
    VALIDATION_FAILED: 'Validation failed'
};


