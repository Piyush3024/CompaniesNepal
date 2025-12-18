import { PrismaClient } from "@prisma/client";
import { encodeId, decodeId } from "../../lib/secure.js";

const prisma = new PrismaClient();

//  Get all provinces (for dropdown)
const getAllProvinces = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    const provinces = await prisma.provinces.findMany();
    if (!provinces || provinces.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No provinces found."
      });
    }
    const hashedProvinces = provinces.map(province => ({
      ...province,
      id: encodeId(province.id),
    }));
    return res.status(200).json({
      success: true,
      data: hashedProvinces,
    });
  } catch (error) {
    console.error("Error in getAllProvinces:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching provinces",
      error: error.message,
    });
  }
};

const createProvince = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { name, code } = req.body;

    const newProvince = await prisma.provinces.create({
      data: {
        name,
        code: code || null
      }
    });

    return res.status(201).json({
      success: true,
      message: "State created successfully",
      data: {
        ...newProvince,
        id: encodeId(newProvince.id)
      }
    });
  } catch (error) {
    console.error("Error in createProvince:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating state",
      error: error.message
    });
  }
};

//  Get province by ID (optional)
const getProvinceById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    const { provinceId } = req.params;
    const decodedId = decodeId(provinceId)[0];
    if (!decodedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid province ID",
      });
    }
    const province = await prisma.provinces.findUnique({
      where: {
        id: parseInt(decodedId)
      },
    });
    if (!province) {
      return res.status(404).json({
        success: false,
        message: "Province not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: {
        ...province,
        id: encodeId(province.id)
      },
    });
  } catch (error) {
    console.error("Error in getProvinceById:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching province",
      error: error.message,
    });
  }
};

const updateProvince = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { stateId } = req.params;
    const decodedId = decodeId(stateId);

    if (!decodedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid state ID"
      });
    }

    const { name, code } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    updateData.updated_at = new Date();

    const updatedProvince = await prisma.provinces.update({
      where: { id: parseInt(decodedId) },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: "State updated successfully",
      data: {
        ...updatedProvince,
        id: encodeId(updatedProvince.id)
      }
    });
  } catch (error) {
    console.error("Error in updateProvince:", error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "State not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error updating state",
      error: error.message
    });
  }
};

const deleteProvince = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { provinceId } = req.params;
    const decodedId = decodeId(provinceId);

    if (!decodedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid state ID"
      });
    }

    await prisma.provinces.delete({
      where: { id: parseInt(decodedId) }
    });

    return res.status(200).json({
      success: true,
      message: "State deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteProvince:", error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "State not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error deleting state",
      error: error.message
    });
  }
};



//  Get districts by province (cascading dropdown)
const getDistrictsByProvince = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    const { provinceId } = req.params;
    const decodedId = decodeId(provinceId)[0];
    if (!decodedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid province ID",
      });
    }
    const districts = await prisma.districts.findMany({
      where: {
        province_id: parseInt(decodedId)
      },
    });
    if (!districts || districts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No districts found."
      });
    }
    const hashedDistricts = districts.map(district => ({
      ...district,
      id: encodeId(district.id),
      province_id: encodeId(district.province_id),
    }));
    return res.status(200).json({
      success: true,
      data: hashedDistricts,
    });
  } catch (error) {
    console.error("Error in getDistrictsByProvince:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching districts",
      error: error.message,
    });
  }
};

//  Get all districts (optional)
const getAllDistricts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    const districts = await prisma.districts.findMany();
    if (!districts || districts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No districts found."
      });
    }
    const hashedDistricts = districts.map(district => ({
      ...district,
      id: encodeId(district.id),
      province_id: encodeId(district.province_id),
    }));
    return res.status(200).json({
      success: true,
      data: hashedDistricts,
    });
  } catch (error) {
    console.error("Error in getAllDistricts:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching districts",
      error: error.message,
    });
  }
};


const createDistrict = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { name, state_id } = req.body;
    const decodedStateId = decodeId(state_id);

    if (!decodedStateId) {
      return res.status(400).json({
        success: false,
        message: "Invalid state ID"
      });
    }

    const newDistrict = await prisma.districts.create({
      data: {
        name,
        state_id: parseInt(decodedStateId)
      }
    });

    return res.status(201).json({
      success: true,
      message: "District created successfully",
      data: {
        ...newDistrict,
        id: encodeId(newDistrict.id),
        state_id: encodeId(newDistrict.state_id)
      }
    });
  } catch (error) {
    console.error("Error in createDistrict:", error);

    if (error.code === 'P2003') {
      return res.status(404).json({
        success: false,
        message: "State not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error creating district",
      error: error.message
    });
  }
};

const updateDistrict = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { districtId } = req.params;
    const decodedId = decodeId(districtId);

    if (!decodedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid district ID"
      });
    }

    const { name, state_id } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (state_id) {
      const decodedStateId = decodeId(state_id);
      if (!decodedStateId) {
        return res.status(400).json({
          success: false,
          message: "Invalid state ID"
        });
      }
      updateData.state_id = parseInt(decodedStateId);
    }
    updateData.updated_at = new Date();

    const updatedDistrict = await prisma.districts.update({
      where: { id: parseInt(decodedId) },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: "District updated successfully",
      data: {
        ...updatedDistrict,
        id: encodeId(updatedDistrict.id),
        state_id: encodeId(updatedDistrict.state_id)
      }
    });
  } catch (error) {
    console.error("Error in updateDistrict:", error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "District not found"
      });
    }

    if (error.code === 'P2003') {
      return res.status(404).json({
        success: false,
        message: "State not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error updating district",
      error: error.message
    });
  }
};

const deleteDistrict = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { districtId } = req.params;
    const decodedId = decodeId(districtId);

    if (!decodedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid district ID"
      });
    }

    await prisma.districts.delete({
      where: { id: parseInt(decodedId) }
    });

    return res.status(200).json({
      success: true,
      message: "District deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteDistrict:", error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "District not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error deleting district",
      error: error.message
    });
  }
};


//  Get cities by district (cascading dropdown)
const getCitiesByDistrict = async (req, res) => {
  try {

    const { districtId } = req.params;
    const decodedId = decodeId(districtId)[0];
    if (!decodedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid district ID",
      });
    }
    const cities = await prisma.cities.findMany({
      where: {
        district_id: parseInt(decodedId)
      },
    });
    if (!cities || cities.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No cities found."
      });
    }
    const hashedCities = cities.map(city => ({
      ...city,
      id: encodeId(city.id),
      district_id: encodeId(city.district_id),
    }));
    return res.status(200).json({
      success: true,
      data: hashedCities,
    });
  } catch (error) {
    console.error("Error in getCitiesByDistrict:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching cities",
      error: error.message,
    });
  }
};

//  Get all cities
const getAllCities = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    const cities = await prisma.cities.findMany();
    if (!cities || cities.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No cities found."
      });
    }
    const hashedCities = cities.map(city => ({
      ...city,
      id: encodeId(city.id),
      district_id: encodeId(city.district_id),
    }));
    return res.status(200).json({
      success: true,
      data: hashedCities,
    });
  } catch (error) {
    console.error("Error in getAllCities:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching cities",
      error: error.message,
    });
  }
};

const createCity = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { name, district_id } = req.body;
    const decodedDistrictId = decodeId(district_id);

    if (!decodedDistrictId) {
      return res.status(400).json({
        success: false,
        message: "Invalid district ID"
      });
    }

    const newCity = await prisma.cities.create({
      data: {
        name,
        district_id: parseInt(decodedDistrictId)
      }
    });

    return res.status(201).json({
      success: true,
      message: "City created successfully",
      data: {
        ...newCity,
        id: encodeId(newCity.id),
        district_id: encodeId(newCity.district_id)
      }
    });
  } catch (error) {
    console.error("Error in createCity:", error);

    if (error.code === 'P2003') {
      return res.status(404).json({
        success: false,
        message: "District not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error creating city",
      error: error.message
    });
  }
};

const updateCity = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { cityId } = req.params;
    const decodedId = decodeId(cityId);

    if (!decodedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid city ID"
      });
    }

    const { name, district_id } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (district_id) {
      const decodedDistrictId = decodeId(district_id);
      if (!decodedDistrictId) {
        return res.status(400).json({
          success: false,
          message: "Invalid district ID"
        });
      }
      updateData.district_id = parseInt(decodedDistrictId);
    }
    updateData.updated_at = new Date();

    const updatedCity = await prisma.cities.update({
      where: { id: parseInt(decodedId) },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: "City updated successfully",
      data: {
        ...updatedCity,
        id: encodeId(updatedCity.id),
        district_id: encodeId(updatedCity.district_id)
      }
    });
  } catch (error) {
    console.error("Error in updateCity:", error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "City not found"
      });
    }

    if (error.code === 'P2003') {
      return res.status(404).json({
        success: false,
        message: "District not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error updating city",
      error: error.message
    });
  }
};

const deleteCity = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { cityId } = req.params;
    const decodedId = decodeId(cityId);

    if (!decodedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid city ID"
      });
    }

    await prisma.cities.delete({
      where: { id: parseInt(decodedId) }
    });

    return res.status(200).json({
      success: true,
      message: "City deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteCity:", error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "City not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error deleting city",
      error: error.message
    });
  }
};

//  Get areas by city (final dropdown for address)
const getAreasByCity = async (req, res) => {
  try {

    const { cityId } = req.params;
    const decodedId = decodeId(cityId)[0];
    if (!decodedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid city ID",
      });
    }
    const areas = await prisma.areas.findMany({
      where: {
        city_id: parseInt(decodedId)
      },
    });
    if (!areas || areas.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No areas found."
      });
    }
    const hashedAreas = areas.map(area => ({
      ...area,
      id: encodeId(area.id),
      city_id: encodeId(area.city_id),
    }));
    return res.status(200).json({
      success: true,
      data: hashedAreas,
    });
  } catch (error) {
    console.error("Error in getAreasByCity:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching areas",
      error: error.message,
    });
  }
};

//  Get all areas
const getAllAreas = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    const areas = await prisma.areas.findMany();
    if (!areas || areas.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No areas found."
      });
    }
    const hashedAreas = areas.map(area => ({
      ...area,
      id: encodeId(area.id),
      city_id: encodeId(area.city_id),
    }));
    return res.status(200).json({
      success: true,
      data: hashedAreas,
    });
  } catch (error) {
    console.error("Error in getAllAreas:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching areas",
      error: error.message,
    });
  }
};

const createArea = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { name, city_id, postal_code, nearby_id } = req.body;
    const decodedCityId = decodeId(city_id);

    if (!decodedCityId) {
      return res.status(400).json({
        success: false,
        message: "Invalid city ID"
      });
    }

    const createData = {
      name,
      city_id: parseInt(decodedCityId),
      postal_code: postal_code || null
    };

    if (nearby_id) {
      const decodedNearbyId = decodeId(nearby_id);
      if (!decodedNearbyId) {
        return res.status(400).json({
          success: false,
          message: "Invalid nearby area ID"
        });
      }
      createData.nearby_id = parseInt(decodedNearbyId);
    }

    const newArea = await prisma.areas.create({
      data: createData
    });

    return res.status(201).json({
      success: true,
      message: "Area created successfully",
      data: {
        ...newArea,
        id: encodeId(newArea.id),
        city_id: encodeId(newArea.city_id),
        nearby_id: newArea.nearby_id ? encodeId(newArea.nearby_id) : null
      }
    });
  } catch (error) {
    console.error("Error in createArea:", error);

    if (error.code === 'P2003') {
      return res.status(404).json({
        success: false,
        message: "City or nearby area not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error creating area",
      error: error.message
    });
  }
};

const updateArea = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { areaId } = req.params;
    const decodedId = decodeId(areaId);

    if (!decodedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid area ID"
      });
    }

    const { name, city_id, postal_code, nearby_id } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (postal_code !== undefined) updateData.postal_code = postal_code;

    if (city_id) {
      const decodedCityId = decodeId(city_id);
      if (!decodedCityId) {
        return res.status(400).json({
          success: false,
          message: "Invalid city ID"
        });
      }
      updateData.city_id = parseInt(decodedCityId);
    }

    if (nearby_id !== undefined) {
      if (nearby_id === null || nearby_id === '') {
        updateData.nearby_id = null;
      } else {
        const decodedNearbyId = decodeId(nearby_id);
        if (!decodedNearbyId) {
          return res.status(400).json({
            success: false,
            message: "Invalid nearby area ID"
          });
        }
        updateData.nearby_id = parseInt(decodedNearbyId);
      }
    }

    updateData.updated_at = new Date();

    const updatedArea = await prisma.areas.update({
      where: { id: parseInt(decodedId) },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: "Area updated successfully",
      data: {
        ...updatedArea,
        id: encodeId(updatedArea.id),
        city_id: encodeId(updatedArea.city_id),
        nearby_id: updatedArea.nearby_id ? encodeId(updatedArea.nearby_id) : null
      }
    });
  } catch (error) {
    console.error("Error in updateArea:", error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Area not found"
      });
    }

    if (error.code === 'P2003') {
      return res.status(404).json({
        success: false,
        message: "City or nearby area not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error updating area",
      error: error.message
    });
  }
};

const deleteArea = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { areaId } = req.params;
    const decodedId = decodeId(areaId);

    if (!decodedId) {
      return res.status(400).json({
        success: false,
        message: "Invalid area ID"
      });
    }

    await prisma.areas.delete({
      where: { id: parseInt(decodedId) }
    });

    return res.status(200).json({
      success: true,
      message: "Area deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteArea:", error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Area not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error deleting area",
      error: error.message
    });
  }
};


export {
  // Provinces
  getAllProvinces,
  getProvinceById,
  createProvince,
  updateProvince,
  deleteProvince,
  
  // Districts
  getDistrictsByProvince,
  getAllDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  
  // Cities 
  getCitiesByDistrict,
  getAllCities,
  createCity,
  updateCity,
  deleteCity,
  
  // Areas
  getAreasByCity,
  getAllAreas,
  createArea,
  updateArea,
  deleteArea
};