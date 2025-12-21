import { validationResult } from "express-validator";
import { COMPANY_ERRORS, COMPANY_FILE_CONFIG } from "./company.validation.constant.js";

// Handle validation errors
export const handleCompanyValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.error('Company validation errors:', errors.array());

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value
            }))
        });
    }

    next();
};

// File upload validation middleware
export const validateFileUploads = (req, res, next) => {
    try {
        // Validate logo if present
        if (req.files?.logo_url?.[0] || req.file?.fieldname === 'logo_url') {
            const logoFile = req.files?.logo_url?.[0] || req.file;

            if (!validateFile(logoFile, COMPANY_FILE_CONFIG.LOGO)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid logo file',
                    error: COMPANY_FILE_CONFIG.LOGO.MESSAGE
                });
            }
        }

        // Validate documents if present
        if (req.files?.documents_url && Array.isArray(req.files.documents_url)) {
            if (req.files.documents_url.length > COMPANY_FILE_CONFIG.DOCUMENTS.MAX_FILES) {
                return res.status(400).json({
                    success: false,
                    message: 'Too many documents',
                    error: `Maximum ${COMPANY_FILE_CONFIG.DOCUMENTS.MAX_FILES} documents allowed`
                });
            }

            for (const docFile of req.files.documents_url) {
                if (!validateFile(docFile, COMPANY_FILE_CONFIG.DOCUMENTS)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid document file',
                        error: COMPANY_FILE_CONFIG.DOCUMENTS.MESSAGE
                    });
                }
            }
        }

        next();
    } catch (error) {
        console.error('File validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating files',
            error: error.message
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
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    if (!config.ALLOWED_EXTENSIONS.includes(fileExtension)) {
        return false;
    }

    return true;
};

// Validate company create request
export const validateCreateCompanyRequest = (req, res, next) => {
    try {
        const { name, company_type_id } = req.body;

        // Name is required
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'name',
                        message: 'Company name is required and must be a non-empty string'
                    }
                ]
            });
        }

        // Company type is required
        if (!company_type_id || typeof company_type_id !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'company_type_id',
                        message: 'Company type ID is required and must be a string'
                    }
                ]
            });
        }

        next();
    } catch (error) {
        console.error('Create company validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating request',
            error: error.message
        });
    }
};

// Validate company update request
export const validateUpdateCompanyRequest = (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // ID is required
        if (!id || typeof id !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'id',
                        message: 'Company ID is required'
                    }
                ]
            });
        }

        // At least one field must be provided for update
        const allowedFields = [
            'name', 'email', 'phone', 'website', 'description',
            'established_year', 'registration_number', 'social_media_links',
            'company_type_id', 'area_id', 'slug'
        ];

        const hasValidField = Object.keys(updateData).some(key => allowedFields.includes(key));

        if (!hasValidField && !req.files && !req.file) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'body',
                        message: 'At least one field must be provided for update'
                    }
                ]
            });
        }

        next();
    } catch (error) {
        console.error('Update company validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating request',
            error: error.message
        });
    }
};

// Validate premium status update
export const validatePremiumStatusUpdate = (req, res, next) => {
    try {
        const { id } = req.params;
        const { is_premium } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'id',
                        message: 'Company ID is required'
                    }
                ]
            });
        }

        if (is_premium === undefined || is_premium === null || is_premium === '') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'is_premium',
                        message: 'is_premium field is required and must be a boolean'
                    }
                ]
            });
        }

        next();
    } catch (error) {
        console.error('Premium status validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating request',
            error: error.message
        });
    }
};

// Validate verification status update
export const validateVerificationStatusUpdate = (req, res, next) => {
    try {
        const { id } = req.params;
        const { is_verified, verification_status_id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'id',
                        message: 'Company ID is required'
                    }
                ]
            });
        }

        // At least one field should be provided
        if (is_verified === undefined && !verification_status_id) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'body',
                        message: 'Either is_verified or verification_status_id must be provided'
                    }
                ]
            });
        }

        // If is_verified is provided, it must be a boolean
        if (is_verified !== undefined && typeof is_verified !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'is_verified',
                        message: 'is_verified must be a boolean value'
                    }
                ]
            });
        }

        next();
    } catch (error) {
        console.error('Verification status validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating request',
            error: error.message
        });
    }
};

// Validate slug check request
export const validateSlugCheckRequest = (req, res, next) => {
    try {
        const { slug } = req.params;

        if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'slug',
                        message: 'Slug is required and must be a non-empty string'
                    }
                ]
            });
        }

        next();
    } catch (error) {
        console.error('Slug check validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating request',
            error: error.message
        });
    }
};

// Validate recalculate stats request
export const validateRecalculateStatsRequest = (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'id',
                        message: 'Company ID is required'
                    }
                ]
            });
        }

        next();
    } catch (error) {
        console.error('Recalculate stats validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating request',
            error: error.message
        });
    }
};

// Validate query parameters for list endpoints
export const validateListQueryParams = (req, res, next) => {
    try {
        const { page, limit, sortBy, sortOrder, min_reviews } = req.query;

        // Validate page
        if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'page',
                        message: 'Page must be a positive integer'
                    }
                ]
            });
        }

        // Validate limit
        if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'limit',
                        message: 'Limit must be a positive integer between 1 and 100'
                    }
                ]
            });
        }

        // Validate sortOrder
        if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'sortOrder',
                        message: 'Sort order must be either "asc" or "desc"'
                    }
                ]
            });
        }

        // Validate min_reviews
        if (min_reviews && (isNaN(parseInt(min_reviews)) || parseInt(min_reviews) < 0)) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'min_reviews',
                        message: 'min_reviews must be a non-negative integer'
                    }
                ]
            });
        }

        next();
    } catch (error) {
        console.error('List query validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating request',
            error: error.message
        });
    }
};

// Validate search query
export const validateSearchQuery = (req, res, next) => {
    try {
        const { query } = req.query;

        if (query && typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'query',
                        message: 'Search query must be a string'
                    }
                ]
            });
        }

        if (query && query.length > 255) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [
                    {
                        field: 'query',
                        message: 'Search query must not exceed 255 characters'
                    }
                ]
            });
        }

        next();
    } catch (error) {
        console.error('Search query validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating request',
            error: error.message
        });
    }
};

// Validate filter query parameters
export const validateFilterQueryParams = (req, res, next) => {
    try {
        const {
            page,
            limit,
            sortBy,
            sortOrder,
            min_rating,
            max_rating,
            min_year,
            max_year,
            min_reviews,
            max_reviews,
            min_products,
            max_products,
            min_inquiries,
            max_inquiries,
            is_premium,
            is_verified,
            is_blocked,
        } = req.query;

        const errors = [];

        // Validate pagination
        if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
            errors.push({
                field: 'page',
                message: 'Page must be a positive integer'
            });
        }

        if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
            errors.push({
                field: 'limit',
                message: 'Limit must be a positive integer between 1 and 100'
            });
        }

        // Validate sort order
        if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
            errors.push({
                field: 'sortOrder',
                message: 'Sort order must be either "asc" or "desc"'
            });
        }

        // Validate rating filters
        if (min_rating && (isNaN(parseFloat(min_rating)) || parseFloat(min_rating) < 0 || parseFloat(min_rating) > 5)) {
            errors.push({
                field: 'min_rating',
                message: 'Minimum rating must be between 0 and 5'
            });
        }

        if (max_rating && (isNaN(parseFloat(max_rating)) || parseFloat(max_rating) < 0 || parseFloat(max_rating) > 5)) {
            errors.push({
                field: 'max_rating',
                message: 'Maximum rating must be between 0 and 5'
            });
        }

        if (min_rating && max_rating && parseFloat(min_rating) > parseFloat(max_rating)) {
            errors.push({
                field: 'rating_range',
                message: 'Minimum rating cannot be greater than maximum rating'
            });
        }

        // Validate year filters
        const currentYear = new Date().getFullYear();
        if (min_year && (isNaN(parseInt(min_year)) || parseInt(min_year) < 1800 || parseInt(min_year) > currentYear)) {
            errors.push({
                field: 'min_year',
                message: `Minimum year must be between 1800 and ${currentYear}`
            });
        }

        if (max_year && (isNaN(parseInt(max_year)) || parseInt(max_year) < 1800 || parseInt(max_year) > currentYear)) {
            errors.push({
                field: 'max_year',
                message: `Maximum year must be between 1800 and ${currentYear}`
            });
        }

        if (min_year && max_year && parseInt(min_year) > parseInt(max_year)) {
            errors.push({
                field: 'year_range',
                message: 'Minimum year cannot be greater than maximum year'
            });
        }

        // Validate count filters (reviews, products, inquiries)
        const countFields = [
            { min: 'min_reviews', max: 'max_reviews', name: 'reviews' },
            { min: 'min_products', max: 'max_products', name: 'products' },
            { min: 'min_inquiries', max: 'max_inquiries', name: 'inquiries' },
        ];

        for (const field of countFields) {
            const minValue = req.query[field.min];
            const maxValue = req.query[field.max];

            if (minValue && (isNaN(parseInt(minValue)) || parseInt(minValue) < 0)) {
                errors.push({
                    field: field.min,
                    message: `Minimum ${field.name} count must be a non-negative integer`
                });
            }

            if (maxValue && (isNaN(parseInt(maxValue)) || parseInt(maxValue) < 0)) {
                errors.push({
                    field: field.max,
                    message: `Maximum ${field.name} count must be a non-negative integer`
                });
            }

            if (minValue && maxValue && parseInt(minValue) > parseInt(maxValue)) {
                errors.push({
                    field: `${field.name}_range`,
                    message: `Minimum ${field.name} count cannot be greater than maximum`
                });
            }
        }

        // Validate boolean filters
        const booleanFields = ['is_premium', 'is_verified', 'is_blocked'];
        for (const field of booleanFields) {
            if (req.query[field] && !['true', 'false'].includes(req.query[field])) {
                errors.push({
                    field,
                    message: `${field} must be either "true" or "false"`
                });
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        next();
    } catch (error) {
        console.error('Filter validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating request',
            error: error.message
        });
    }
};