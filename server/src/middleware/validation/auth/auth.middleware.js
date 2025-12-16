import { body, validationResult } from "express-validator";
import {
    passwordRule,
    usernameRule,
    emailRule,
    phoneRule,
    roleIdRule,
    tokenParamRule
} from "./validation.rules.js";
import { GENERIC_ERRORS, USERNAME_CONFIG, EMAIL_CONFIG } from "../validation.constant.js";


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


export const validateLogin = [

    body()
        .custom((value, { req }) => {
            const { email } = req.body;


            if (!email) {
                throw new Error('Login credentials are required');
            }


            if (email) {
                if (typeof email !== 'string') {
                    throw new Error('Invalid email format');
                }
                if (email.length > EMAIL_CONFIG.MAX_LENGTH) {
                    throw new Error(`Email must not exceed ${EMAIL_CONFIG.MAX_LENGTH} characters`);
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw new Error('Invalid email format');
                }
            }




            return true;
        }),


    passwordRule('password')
];


export const validateRegistration = [
    emailRule(true),
    usernameRule(true),
    passwordRule('password'),
    roleIdRule(),
    phoneRule(),



    body()
        .custom((value, { req }) => {
            const { email, phone } = req.body;
            if (!email && !phone) {
                throw new Error('Either email or phone number is required');
            }
            return true;
        })
];


export const validateForgot = [
    emailRule(true)
];


export const validateResetPassword = [
    tokenParamRule(),
    passwordRule('password')
];



