import { body, param, query } from "express-validator";
import {
    COMPANY_NAME_CONFIG,
    COMPANY_DESCRIPTION_CONFIG,
    COMPANY_EMAIL_CONFIG,
    COMPANY_PHONE_CONFIG,
    COMPANY_WEBSITE_CONFIG,
    COMPANY_REGISTRATION_CONFIG,
    COMPANY_ESTABLISHED_YEAR_CONFIG,
    COMPANY_SLUG_CONFIG,
    COMPANY_SOCIAL_MEDIA_CONFIG,
    COMPANY_FILE_CONFIG,
    COMPANY_BRANCH_CONFIG,
    COMPANY_CATEGORY_CONFIG,
    COMPANY_FILTER_CONFIG
} from "./company.validation.constant.js";

// Company Name Validation
export const companyNameRule = (isRequired = true) => {
    const rule = body('name')
        .trim()
        .isLength({ min: COMPANY_NAME_CONFIG.MIN_LENGTH, max: COMPANY_NAME_CONFIG.MAX_LENGTH })
        .withMessage(COMPANY_NAME_CONFIG.MESSAGE)
        .matches(COMPANY_NAME_CONFIG.REGEX)
        .withMessage(COMPANY_NAME_CONFIG.MESSAGE)
        .escape();

    return isRequired ? rule.notEmpty().withMessage('Company name is required') : rule.optional();
};

// Company Email Validation
export const companyEmailRule = (isRequired = false) => {
    const rule = body('email')
        .if(() => isRequired)
        .notEmpty()
        .withMessage('Company email is required')
        .isEmail()
        .withMessage(COMPANY_EMAIL_CONFIG.MESSAGE)
        .isLength({ max: COMPANY_EMAIL_CONFIG.MAX_LENGTH })
        .withMessage(`Email must not exceed ${COMPANY_EMAIL_CONFIG.MAX_LENGTH} characters`)
        .normalizeEmail()
        .trim();

    return isRequired ? rule : rule.optional({ checkFalsy: true });
};

// Company Phone Validation
export const companyPhoneRule = (isRequired = false) => {
    const rule = body('phone')
        .if(body => isRequired || body('phone').exists({ checkFalsy: false }))
        .isLength({ max: COMPANY_PHONE_CONFIG.MAX_LENGTH })
        .withMessage(`Phone must not exceed ${COMPANY_PHONE_CONFIG.MAX_LENGTH} characters`)
        .matches(COMPANY_PHONE_CONFIG.REGEX)
        .withMessage(COMPANY_PHONE_CONFIG.MESSAGE)
        .trim();

    return isRequired ? rule.notEmpty().withMessage('Company phone is required') : rule.optional({ checkFalsy: true });
};

// Company Website Validation
export const companyWebsiteRule = (isRequired = false) => {
    const rule = body('website')
        .if(body => isRequired || body('website').exists({ checkFalsy: false }))
        .isLength({ max: COMPANY_WEBSITE_CONFIG.MAX_LENGTH })
        .withMessage(`Website must not exceed ${COMPANY_WEBSITE_CONFIG.MAX_LENGTH} characters`)
        .matches(COMPANY_WEBSITE_CONFIG.REGEX)
        .withMessage(COMPANY_WEBSITE_CONFIG.MESSAGE)
        .trim();

    return isRequired ? rule.notEmpty().withMessage('Website is required') : rule.optional({ checkFalsy: true });
};

// Company Description Validation
export const companyDescriptionRule = (isRequired = false) => {
    const rule = body('description')
        .if(body => isRequired || body('description').exists({ checkFalsy: false }))
        .isLength({ min: COMPANY_DESCRIPTION_CONFIG.MIN_LENGTH, max: COMPANY_DESCRIPTION_CONFIG.MAX_LENGTH })
        .withMessage(COMPANY_DESCRIPTION_CONFIG.MESSAGE)
        .trim();

    return isRequired ? rule.notEmpty().withMessage('Description is required') : rule.optional({ checkFalsy: true });
};

// Company Registration Number Validation
export const companyRegistrationNumberRule = (isRequired = false) => {
    const rule = body('registration_number')
        .if(body => isRequired || body('registration_number').exists({ checkFalsy: false }))
        .isLength({ min: COMPANY_REGISTRATION_CONFIG.MIN_LENGTH, max: COMPANY_REGISTRATION_CONFIG.MAX_LENGTH })
        .withMessage(COMPANY_REGISTRATION_CONFIG.MESSAGE)
        .matches(COMPANY_REGISTRATION_CONFIG.REGEX)
        .withMessage(COMPANY_REGISTRATION_CONFIG.MESSAGE)
        .trim();

    return isRequired ? rule.notEmpty().withMessage('Registration number is required') : rule.optional({ checkFalsy: true });
};

// Company Established Year Validation
export const companyEstablishedYearRule = (isRequired = false) => {
    const rule = body('established_year')
        .if(body => isRequired || body('established_year').exists({ checkFalsy: false }))
        .isInt({ min: COMPANY_ESTABLISHED_YEAR_CONFIG.MIN_YEAR, max: COMPANY_ESTABLISHED_YEAR_CONFIG.MAX_YEAR })
        .withMessage(COMPANY_ESTABLISHED_YEAR_CONFIG.MESSAGE)
        .toInt();

    return isRequired ? rule.notEmpty().withMessage('Established year is required') : rule.optional({ checkFalsy: true });
};

// Company Slug Validation
export const companySlugRule = (isRequired = false) => {
    const rule = body('slug')
        .if(body => isRequired || body('slug').exists({ checkFalsy: false }))
        .isLength({ max: COMPANY_SLUG_CONFIG.MAX_LENGTH })
        .withMessage(`Slug must not exceed ${COMPANY_SLUG_CONFIG.MAX_LENGTH} characters`)
        .matches(COMPANY_SLUG_CONFIG.REGEX)
        .withMessage(COMPANY_SLUG_CONFIG.MESSAGE)
        .trim();

    return isRequired ? rule.notEmpty().withMessage('Slug is required') : rule.optional({ checkFalsy: true });
};

// Company Social Media Links Validation
export const companySocialMediaLinksRule = (isRequired = false) => {
    const rule = body('social_media_links')
        .if(body => isRequired || body('social_media_links').exists({ checkFalsy: false }))
        .custom((value) => {
            if (typeof value === 'string') {
                try {
                    value = JSON.parse(value);
                } catch (error) {
                    throw new Error('Social media links must be valid JSON');
                }
            }

            if (!Array.isArray(value) && typeof value !== 'object') {
                throw new Error(COMPANY_SOCIAL_MEDIA_CONFIG.MESSAGE);
            }

            // Convert array to object if needed
            if (Array.isArray(value)) {
                value.forEach((link) => {
                    validateSocialMediaLink(link);
                });
            } else {
                Object.entries(value).forEach(([platform, url]) => {
                    if (!COMPANY_SOCIAL_MEDIA_CONFIG.SUPPORTED_PLATFORMS.includes(platform.toLowerCase())) {
                        throw new Error(`${COMPANY_SOCIAL_MEDIA_CONFIG.PLATFORM_MESSAGE}`);
                    }
                    if (!COMPANY_SOCIAL_MEDIA_CONFIG.URL_REGEX.test(url)) {
                        throw new Error(`Invalid URL for ${platform}`);
                    }
                });
            }

            return true;
        });

    return isRequired ? rule.notEmpty().withMessage('Social media links are required') : rule.optional({ checkFalsy: true });
};

// Helper function to validate individual social media link
const validateSocialMediaLink = (link) => {
    if (typeof link === 'object' && link.platform && link.url) {
        if (!COMPANY_SOCIAL_MEDIA_CONFIG.SUPPORTED_PLATFORMS.includes(link.platform.toLowerCase())) {
            throw new Error(`${COMPANY_SOCIAL_MEDIA_CONFIG.PLATFORM_MESSAGE}`);
        }
        if (!COMPANY_SOCIAL_MEDIA_CONFIG.URL_REGEX.test(link.url)) {
            throw new Error(`Invalid URL for ${link.platform}`);
        }
    }
};

// Company Type ID Validation
export const companyTypeIdRule = (isRequired = true) => {
    const rule = body('company_type_id')
        .trim()
        .isString()
        .withMessage('Company type ID must be a string')
        .notEmpty()
        .withMessage('Company type ID is required');

    return rule;
};

// Area ID Validation
export const areaIdRule = (isRequired = false) => {
    const rule = body('area_id')
        .if(body => isRequired || body('area_id').exists({ checkFalsy: false }))
        .trim()
        .isString()
        .withMessage('Area ID must be a string');

    return isRequired ? rule.notEmpty().withMessage('Area ID is required') : rule.optional({ checkFalsy: true });
};

// Branches Validation
export const branchesRule = (isRequired = false) => {
    const rule = body('branches')
        .if(body => isRequired || body('branches').exists({ checkFalsy: false }))
        .isArray()
        .withMessage('Branches must be an array')
        .custom((value) => {
            if (!Array.isArray(value)) {
                throw new Error('Branches must be an array');
            }

            value.forEach((branch, index) => {
                if (!branch.branch_name) {
                    throw new Error(`Branch ${index + 1}: branch_name is required`);
                }

                if (branch.branch_name.length < COMPANY_BRANCH_CONFIG.NAME_MIN_LENGTH || 
                    branch.branch_name.length > COMPANY_BRANCH_CONFIG.NAME_MAX_LENGTH) {
                    throw new Error(`Branch ${index + 1}: branch_name must be ${COMPANY_BRANCH_CONFIG.NAME_MIN_LENGTH}-${COMPANY_BRANCH_CONFIG.NAME_MAX_LENGTH} characters`);
                }

                if (!COMPANY_BRANCH_CONFIG.NAME_REGEX.test(branch.branch_name)) {
                    throw new Error(`Branch ${index + 1}: ${COMPANY_BRANCH_CONFIG.NAME_MESSAGE}`);
                }

                if (branch.phone && !COMPANY_PHONE_CONFIG.REGEX.test(branch.phone)) {
                    throw new Error(`Branch ${index + 1}: Invalid phone format`);
                }

                if (branch.email && !branch.email.includes('@')) {
                    throw new Error(`Branch ${index + 1}: Invalid email format`);
                }
            });

            return true;
        });

    return isRequired ? rule.notEmpty().withMessage('Branches are required') : rule.optional({ checkFalsy: true });
};

// Categories Validation
export const categoriesRule = (isRequired = false) => {
    const rule = body('categories')
        .if(body => isRequired || body('categories').exists({ checkFalsy: false }))
        .isArray()
        .withMessage('Categories must be an array')
        .custom((value) => {
            if (!Array.isArray(value)) {
                throw new Error('Categories must be an array');
            }

            if (value.length > COMPANY_CATEGORY_CONFIG.MAX_CATEGORIES) {
                throw new Error(`Maximum ${COMPANY_CATEGORY_CONFIG.MAX_CATEGORIES} categories allowed`);
            }

            value.forEach((category, index) => {
                const categoryName = typeof category === 'string' ? category : category.name;

                if (!categoryName) {
                    throw new Error(`Category ${index + 1}: name is required`);
                }

                if (categoryName.length < COMPANY_CATEGORY_CONFIG.MIN_LENGTH || 
                    categoryName.length > COMPANY_CATEGORY_CONFIG.MAX_LENGTH) {
                    throw new Error(`Category ${index + 1}: ${COMPANY_CATEGORY_CONFIG.MESSAGE}`);
                }

                if (!COMPANY_CATEGORY_CONFIG.REGEX.test(categoryName)) {
                    throw new Error(`Category ${index + 1}: ${COMPANY_CATEGORY_CONFIG.MESSAGE}`);
                }
            });

            return true;
        });

    return isRequired ? rule.notEmpty().withMessage('Categories are required') : rule.optional({ checkFalsy: true });
};

// ID Parameter Validation
export const companyIdParamRule = () =>
    param('id')
        .notEmpty()
        .withMessage('Company ID is required')
        .isString()
        .withMessage('Company ID must be a string')
        .trim();

// Slug Parameter Validation
export const slugParamRule = () =>
    param('slug')
        .notEmpty()
        .withMessage('Slug is required')
        .isString()
        .withMessage('Slug must be a string')
        .trim();

// ID or Slug Parameter Validation
export const idOrSlugParamRule = () =>
    param('idOrSlug')
        .notEmpty()
        .withMessage('ID or slug is required')
        .isString()
        .withMessage('ID or slug must be a string')
        .trim();

// Query Pagination Rules
export const paginationQueryRules = () => [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
        .toInt(),
];

// Query Sort Rules
export const sortQueryRules = () => [
    query('sortBy')
        .optional()
        .isString()
        .withMessage('Sort field must be a string')
        .trim(),
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be either "asc" or "desc"')
        .trim(),
];

// Search Query Validation
export const searchQueryRule = () =>
    query('query')
        .optional()
        .isString()
        .withMessage('Search query must be a string')
        .trim()
        .isLength({ max: 255 })
        .withMessage('Search query must not exceed 255 characters');

// Premium Status Update Validation
export const premiumStatusRule = () =>
    body('is_premium')
        .notEmpty()
        .withMessage('is_premium field is required')
        .isBoolean()
        .withMessage('is_premium must be a boolean value')
        .toBoolean();

// Verification Status Update Validation
export const verificationStatusRule = () => [
    body('is_verified')
        .optional()
        .isBoolean()
        .withMessage('is_verified must be a boolean value')
        .toBoolean(),
    body('verification_status_id')
        .optional()
        .isString()
        .withMessage('Verification status ID must be a string')
        .trim(),
];

// Filter query rules
export const filterCompaniesQueryRules = () => [
    // Basic filters
    query('company_type_id')
        .optional()
        .isString()
        .withMessage('Company type ID must be a string')
        .trim(),
    
    query('area_id')
        .optional()
        .isString()
        .withMessage('Area ID must be a string')
        .trim(),
    
    query('is_premium')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('is_premium must be either "true" or "false"')
        .trim(),
    
    query('is_verified')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('is_verified must be either "true" or "false"')
        .trim(),
    
    query('is_blocked')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('is_blocked must be either "true" or "false"')
        .trim(),
    
    // Rating filters
    query('min_rating')
        .optional()
        .isFloat({ min: COMPANY_FILTER_CONFIG.RATING_MIN, max: COMPANY_FILTER_CONFIG.RATING_MAX })
        .withMessage(`Rating must be between ${COMPANY_FILTER_CONFIG.RATING_MIN} and ${COMPANY_FILTER_CONFIG.RATING_MAX}`)
        .toFloat(),
    
    query('max_rating')
        .optional()
        .isFloat({ min: COMPANY_FILTER_CONFIG.RATING_MIN, max: COMPANY_FILTER_CONFIG.RATING_MAX })
        .withMessage(`Rating must be between ${COMPANY_FILTER_CONFIG.RATING_MIN} and ${COMPANY_FILTER_CONFIG.RATING_MAX}`)
        .toFloat(),
    
    // Year filters
    query('min_year')
        .optional()
        .isInt({ min: COMPANY_FILTER_CONFIG.MIN_YEAR, max: COMPANY_FILTER_CONFIG.MAX_YEAR })
        .withMessage(`Year must be between ${COMPANY_FILTER_CONFIG.MIN_YEAR} and ${COMPANY_FILTER_CONFIG.MAX_YEAR}`)
        .toInt(),
    
    query('max_year')
        .optional()
        .isInt({ min: COMPANY_FILTER_CONFIG.MIN_YEAR, max: COMPANY_FILTER_CONFIG.MAX_YEAR })
        .withMessage(`Year must be between ${COMPANY_FILTER_CONFIG.MIN_YEAR} and ${COMPANY_FILTER_CONFIG.MAX_YEAR}`)
        .toInt(),
    
    // Review count filters
    query('min_reviews')
        .optional()
        .isInt({ min: COMPANY_FILTER_CONFIG.COUNT_MIN })
        .withMessage('Review count must be a non-negative integer')
        .toInt(),
    
    query('max_reviews')
        .optional()
        .isInt({ min: COMPANY_FILTER_CONFIG.COUNT_MIN })
        .withMessage('Review count must be a non-negative integer')
        .toInt(),
    
    // Product count filters
    query('min_products')
        .optional()
        .isInt({ min: COMPANY_FILTER_CONFIG.COUNT_MIN })
        .withMessage('Product count must be a non-negative integer')
        .toInt(),
    
    query('max_products')
        .optional()
        .isInt({ min: COMPANY_FILTER_CONFIG.COUNT_MIN })
        .withMessage('Product count must be a non-negative integer')
        .toInt(),
    
    // Inquiry count filters
    query('min_inquiries')
        .optional()
        .isInt({ min: COMPANY_FILTER_CONFIG.COUNT_MIN })
        .withMessage('Inquiry count must be a non-negative integer')
        .toInt(),
    
    query('max_inquiries')
        .optional()
        .isInt({ min: COMPANY_FILTER_CONFIG.COUNT_MIN })
        .withMessage('Inquiry count must be a non-negative integer')
        .toInt(),
    
    // Search query
    query('search')
        .optional()
        .isString()
        .withMessage('Search query must be a string')
        .trim()
        .isLength({ max: 255 })
        .withMessage('Search query must not exceed 255 characters'),
    
    // Pagination
    ...paginationQueryRules(),
    
    // Sorting
    query('sortBy')
        .optional()
        .isString()
        .withMessage('Sort field must be a string')
        .isIn(COMPANY_FILTER_CONFIG.VALID_SORT_FIELDS)
        .withMessage(`Valid sort fields are: ${COMPANY_FILTER_CONFIG.VALID_SORT_FIELDS.join(', ')}`)
        .trim(),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be either "asc" or "desc"')
        .trim(),
    
    // Include relations
    query('includeRelations')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('includeRelations must be either "true" or "false"')
        .trim(),
];

// Combined validation for create company
export const createCompanyValidationRules = () => [
    companyNameRule(true),
    companyEmailRule(false),
    companyPhoneRule(false),
    companyWebsiteRule(false),
    companyDescriptionRule(false),
    companyRegistrationNumberRule(false),
    companyEstablishedYearRule(false),
    companySlugRule(false),
    companySocialMediaLinksRule(false),
    companyTypeIdRule(true),
    areaIdRule(false),
    branchesRule(false),
    categoriesRule(false),
];

// Combined validation for update company
export const updateCompanyValidationRules = () => [
    companyIdParamRule(),
    companyNameRule(false),
    companyEmailRule(false),
    companyPhoneRule(false),
    companyWebsiteRule(false),
    companyDescriptionRule(false),
    companyRegistrationNumberRule(false),
    companyEstablishedYearRule(false),
    companySlugRule(false),
    companySocialMediaLinksRule(false),
    companyTypeIdRule(false),
    areaIdRule(false),
];