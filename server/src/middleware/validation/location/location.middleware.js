import { body, param, validationResult } from "express-validator";
import {
    provinceNameRule,
    provinceCodeRule,
    districtNameRule,
    cityNameRule,
    areaNameRule,
    postalCodeRule,
    encodedIdRule,
    nearbyIdRule
} from "./location.validation.rules.js";
import { GENERIC_ERRORS } from "../validation.constant.js";

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());

        return res.status(400).json({
            success: false,
            message: GENERIC_ERRORS.VALIDATION_FAILED,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};



export const validateCreateProvince = [
    provinceNameRule(true),
    provinceCodeRule(false)
];

export const validateUpdateProvince = [
    encodedIdRule('provinceId'),
    provinceNameRule(false),
    provinceCodeRule(false),
    
    body()
        .custom((value, { req }) => {
            const { name, code } = req.body;
            if (!name && !code) {
                throw new Error('At least one field (name or code) must be provided for update');
            }
            return true;
        })
];

export const validateProvinceId = [
    encodedIdRule('provinceId')
];



export const validateCreateDistrict = [
    districtNameRule(true),
    encodedIdRule('province_id', 'body')
];

export const validateUpdateDistrict = [
    encodedIdRule('districtId'),
    districtNameRule(false),
    encodedIdRule('province_id', 'body', false),
    
    body()
        .custom((value, { req }) => {
            const { name, province_id } = req.body;
            if (!name && !province_id) {
                throw new Error('At least one field (name or province_id) must be provided for update');
            }
            return true;
        })
];

export const validateDistrictId = [
    encodedIdRule('districtId')
];

export const validateGetDistrictsByProvince = [
    encodedIdRule('provinceId')
];



export const validateCreateCity = [
    cityNameRule(true),
    encodedIdRule('district_id', 'body')
];

export const validateUpdateCity = [
    encodedIdRule('cityId'),
    cityNameRule(false),
    encodedIdRule('district_id', 'body', false),
    
    body()
        .custom((value, { req }) => {
            const { name, district_id } = req.body;
            if (!name && !district_id) {
                throw new Error('At least one field (name or district_id) must be provided for update');
            }
            return true;
        })
];

export const validateCityId = [
    encodedIdRule('cityId')
];

export const validateGetCitiesByDistrict = [
    encodedIdRule('districtId')
];



export const validateCreateArea = [
    areaNameRule(true),
    encodedIdRule('city_id', 'body'),
    postalCodeRule(false),
    nearbyIdRule(false)
];

export const validateUpdateArea = [
    encodedIdRule('areaId'),
    areaNameRule(false),
    encodedIdRule('city_id', 'body', false),
    postalCodeRule(false),
    nearbyIdRule(false),
    
    body()
        .custom((value, { req }) => {
            const { name, city_id, postal_code, nearby_id } = req.body;
            if (!name && !city_id && !postal_code && !nearby_id) {
                throw new Error('At least one field must be provided for update');
            }
            return true;
        })
];

export const validateAreaId = [
    encodedIdRule('areaId')
];

export const validateGetAreasByCity = [
    encodedIdRule('cityId')
];