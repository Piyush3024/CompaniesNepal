import express from "express";
const router = express.Router();

import {
  // States/Provinces
  getAllProvinces,
  getProvinceById,
  createProvince,
  updateProvince,
  deleteProvince,
  // Districts
  getAllDistricts,
  getDistrictsByProvince,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  // Cities
  getAllCities,
  getCitiesByDistrict,
  createCity,
  updateCity,
  deleteCity,
  // Areas
  getAllAreas,
  getAreasByCity,
  createArea,
  updateArea,
  deleteArea
} from "../../controller/location/location.controller.js";

import { protectRoute } from "../../middleware/middleware.js";


import {
  handleValidationErrors,
  // State validators
  validateProvinceId,
  validateCreateProvince,
  validateUpdateProvince,
  // District validators
  validateDistrictId,
  validateGetDistrictsByProvince,
  validateCreateDistrict,
  validateUpdateDistrict,
  // City validators
  validateCityId,
  validateGetCitiesByDistrict,
  validateCreateCity,
  validateUpdateCity,
  // Area validators
  validateAreaId,
  validateGetAreasByCity,
  validateCreateArea,
  validateUpdateArea
} from "../../middleware/validation/location/location.middleware.js";



// GET all states
router.route("/provinces")
  .get(protectRoute, getAllProvinces)
  .post(protectRoute, validateCreateProvince, handleValidationErrors, createProvince);

// GET state by ID, UPDATE state, DELETE state
router.route("/provinces/:stateId")
  .get(protectRoute, validateProvinceId, handleValidationErrors, getProvinceById)
  .put(protectRoute, validateUpdateProvince, handleValidationErrors, updateProvince)
  .delete(protectRoute, validateProvinceId, handleValidationErrors, deleteProvince);




// GET all districts
router.route("/districts")
  .get(protectRoute, getAllDistricts)
  .post(protectRoute, validateCreateDistrict, handleValidationErrors, createDistrict);

// GET districts by state
router.route("/districts/province/:stateId")
  .get(protectRoute, validateGetDistrictsByProvince, handleValidationErrors, getDistrictsByProvince);

// GET district by ID, UPDATE district, DELETE district
router.route("/districts/:districtId")
  .put(protectRoute, validateUpdateDistrict, handleValidationErrors, updateDistrict)
  .delete(protectRoute, validateDistrictId, handleValidationErrors, deleteDistrict);


// GET all cities
router.route("/cities")
  .get(protectRoute, getAllCities)
  .post(protectRoute, validateCreateCity, handleValidationErrors, createCity);

// GET cities by district
router.route("/cities/district/:districtId")
  .get(protectRoute, validateGetCitiesByDistrict, handleValidationErrors, getCitiesByDistrict);

// GET city by ID, UPDATE city, DELETE city
router.route("/cities/:cityId")
  .put(protectRoute, validateUpdateCity, handleValidationErrors, updateCity)
  .delete(protectRoute, validateCityId, handleValidationErrors, deleteCity);




// GET all areas
router.route("/areas")
  .get(protectRoute, getAllAreas)
  .post(protectRoute, validateCreateArea, handleValidationErrors, createArea);

// GET areas by city
router.route("/areas/city/:cityId")
  .get(protectRoute, validateGetAreasByCity, handleValidationErrors, getAreasByCity);

// GET area by ID, UPDATE area, DELETE area
router.route("/areas/:areaId")
  .put(protectRoute, validateUpdateArea, handleValidationErrors, updateArea)
  .delete(protectRoute, validateAreaId, handleValidationErrors, deleteArea);


export default router;