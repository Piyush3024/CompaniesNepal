import { body, param } from "express-validator";
import {
  PASSWORD_CONFIG,
  USERNAME_CONFIG,
  EMAIL_CONFIG,
  PHONE_CONFIG,
} from "../validation.constant.js";

export const passwordRule = (fieldName = 'password') =>
  body(fieldName)
    .notEmpty()
    .withMessage(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`)
    .isLength({ min: PASSWORD_CONFIG.MIN_LENGTH, max: PASSWORD_CONFIG.MAX_LENGTH })
    .withMessage(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be ${PASSWORD_CONFIG.MIN_LENGTH}-${PASSWORD_CONFIG.MAX_LENGTH} characters`)
    .matches(PASSWORD_CONFIG.REGEX)
    .withMessage(PASSWORD_CONFIG.MESSAGE)
    .trim()
    .escape(); 


export const usernameRule = (isRequired = true) => {
  const rule = body('username')
    .trim()
    .isLength({ min: USERNAME_CONFIG.MIN_LENGTH, max: USERNAME_CONFIG.MAX_LENGTH })
    .withMessage(USERNAME_CONFIG.MESSAGE)
    .matches(USERNAME_CONFIG.REGEX)
    .withMessage(USERNAME_CONFIG.MESSAGE)
    .escape(); 
  
  return isRequired ? rule.notEmpty().withMessage('Username is required') : rule.optional();
};


export const emailRule = (isRequired = true) => {
  const rule = body('email')
    .isEmail()
    .withMessage(EMAIL_CONFIG.MESSAGE)
    .isLength({ max: EMAIL_CONFIG.MAX_LENGTH })
    .withMessage(`Email must not exceed ${EMAIL_CONFIG.MAX_LENGTH} characters`)
    .normalizeEmail()
    .trim()
    .escape(); 
  
  return isRequired ? rule.notEmpty().withMessage('Email is required') : rule.optional();
};


export const phoneRule = () =>
  body('phone')
    .optional({ checkFalsy: true })
    .matches(PHONE_CONFIG.REGEX)
    .withMessage(PHONE_CONFIG.MESSAGE)
    .trim()
    .escape();


export const roleIdRule = () =>
  body('role_id')
    .notEmpty()
    .withMessage('Role ID is required')
    .isString()
    .withMessage('Role ID must be a string')
    .trim()
    .escape();


export const tokenParamRule = () =>
  param('token')
    .notEmpty()
    .withMessage('Token is required')
    .isJWT()
    .withMessage('Invalid token format');