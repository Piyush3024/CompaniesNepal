import { body, param } from "express-validator";
import {
    LOCATION_CONFIG,
    STATE_CODE_CONFIG,
    POSTAL_CODE_CONFIG
} from "../validation.constant.js";
import { decodeId } from "../../../lib/secure.js";



/**
 * Validates encoded ID in params or body
 * @param {string} fieldName - Name of the field (e.g., 'provinceId', 'districtId')
 * @param {string} location - 'param' or 'body' (default: 'param')
 * @param {boolean} isRequired - Whether the field is required (default: true)
 */
export const encodedIdRule = (fieldName, location = 'param', isRequired = true) => {
    const validator = location === 'body' ? body(fieldName) : param(fieldName);
    
    const rule = validator
        .trim()
        .matches(/^[0-9A-Za-z]+-[0-9a-f]{8}$/)
        .withMessage(`Invalid ${fieldName} format`)
        .custom((value) => {
            try {
                const decodedId = decodeId(value);
                if (!decodedId || !Number.isInteger(decodedId) || decodedId <= 0) {
                    throw new Error(`Invalid ${fieldName}`);
                }
                return true;
            } catch (error) {
                throw new Error(`Invalid ${fieldName} - cannot decode`);
            }
        });
    
    return isRequired 
        ? rule.notEmpty().withMessage(`${fieldName} is required`)
        : rule.optional();
};


export const provinceNameRule = (isRequired = true) => {
    const rule = body('name')
        .trim()
        .isLength({ min: LOCATION_CONFIG.NAME_MIN_LENGTH, max: LOCATION_CONFIG.NAME_MAX_LENGTH })
        .withMessage(`Province name must be ${LOCATION_CONFIG.NAME_MIN_LENGTH}-${LOCATION_CONFIG.NAME_MAX_LENGTH} characters`)
        .matches(LOCATION_CONFIG.NAME_REGEX)
        .withMessage(LOCATION_CONFIG.NAME_MESSAGE)
        .escape();
    
    return isRequired 
        ? rule.notEmpty().withMessage('Province name is required') 
        : rule.optional();
};

export const provinceCodeRule = (isRequired = false) => {
    const rule = body('code')
        .trim()
        .isLength({ max: STATE_CODE_CONFIG.MAX_LENGTH })
        .withMessage(`Province code must not exceed ${STATE_CODE_CONFIG.MAX_LENGTH} characters`)
        .matches(STATE_CODE_CONFIG.REGEX)
        .withMessage(STATE_CODE_CONFIG.MESSAGE)
        .toUpperCase()
        .escape();
    
    return isRequired 
        ? rule.notEmpty().withMessage('Province code is required') 
        : rule.optional({ checkFalsy: true });
};



export const districtNameRule = (isRequired = true) => {
    const rule = body('name')
        .trim()
        .isLength({ min: LOCATION_CONFIG.NAME_MIN_LENGTH, max: LOCATION_CONFIG.NAME_MAX_LENGTH })
        .withMessage(`District name must be ${LOCATION_CONFIG.NAME_MIN_LENGTH}-${LOCATION_CONFIG.NAME_MAX_LENGTH} characters`)
        .matches(LOCATION_CONFIG.NAME_REGEX)
        .withMessage(LOCATION_CONFIG.NAME_MESSAGE)
        .escape();
    
    return isRequired 
        ? rule.notEmpty().withMessage('District name is required') 
        : rule.optional();
};


export const cityNameRule = (isRequired = true) => {
    const rule = body('name')
        .trim()
        .isLength({ min: LOCATION_CONFIG.NAME_MIN_LENGTH, max: LOCATION_CONFIG.NAME_MAX_LENGTH })
        .withMessage(`City name must be ${LOCATION_CONFIG.NAME_MIN_LENGTH}-${LOCATION_CONFIG.NAME_MAX_LENGTH} characters`)
        .matches(LOCATION_CONFIG.NAME_REGEX)
        .withMessage(LOCATION_CONFIG.NAME_MESSAGE)
        .escape();
    
    return isRequired 
        ? rule.notEmpty().withMessage('City name is required') 
        : rule.optional();
};



export const areaNameRule = (isRequired = true) => {
    const rule = body('name')
        .trim()
        .isLength({ min: LOCATION_CONFIG.NAME_MIN_LENGTH, max: LOCATION_CONFIG.NAME_MAX_LENGTH })
        .withMessage(`Area name must be ${LOCATION_CONFIG.NAME_MIN_LENGTH}-${LOCATION_CONFIG.NAME_MAX_LENGTH} characters`)
        .matches(LOCATION_CONFIG.NAME_REGEX)
        .withMessage(LOCATION_CONFIG.NAME_MESSAGE)
        .escape();
    
    return isRequired 
        ? rule.notEmpty().withMessage('Area name is required') 
        : rule.optional();
};

export const postalCodeRule = (isRequired = false) => {
    const rule = body('postal_code')
        .trim()
        .isLength({ max: POSTAL_CODE_CONFIG.MAX_LENGTH })
        .withMessage(`Postal code must not exceed ${POSTAL_CODE_CONFIG.MAX_LENGTH} characters`)
        .matches(POSTAL_CODE_CONFIG.REGEX)
        .withMessage(POSTAL_CODE_CONFIG.MESSAGE)
        .escape();
    
    return isRequired 
        ? rule.notEmpty().withMessage('Postal code is required') 
        : rule.optional({ checkFalsy: true });
};

export const nearbyIdRule = (isRequired = false) => {
    return encodedIdRule('nearby_id', 'body', isRequired);
};



// For validating province_id in body (when creating/updating districts)
export const provinceIdRule = (isRequired = true) => {
    return encodedIdRule('province_id', 'body', isRequired);
};

// For validating district_id in body (when creating/updating cities)
export const districtIdRule = (isRequired = true) => {
    return encodedIdRule('district_id', 'body', isRequired);
};

// For validating city_id in body (when creating/updating areas)
export const cityIdRule = (isRequired = true) => {
    return encodedIdRule('city_id', 'body', isRequired);
};