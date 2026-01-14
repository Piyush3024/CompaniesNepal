import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { encodeId, decodeId } from '../common/utils/secure.util';
import {
  CreateProvinceDto,
  UpdateProvinceDto,
  CreateDistrictDto,
  UpdateDistrictDto,
  CreateCityDto,
  UpdateCityDto,
  CreateAreaDto,
  UpdateAreaDto,
} from './dto';
import { Prisma } from '@prisma/client';
import { isNodeError } from 'src/common/utils/error.util';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(private prisma: PrismaService) {}

  async getAllProvinces() {
    try {
      const provinces = await this.prisma.provinces.findMany();

      if (!provinces || provinces.length === 0) {
        return {
          success: true,
          message: 'No provinces found',
          data: [],
        };
      }

      const encodedProvinces = provinces.map((province) => ({
        ...province,
        id: encodeId(province.id),
      }));

      return {
        success: true,
        data: encodedProvinces,
      };
    } catch (error) {
      this.logger.error('Error in getAllProvinces:', error);
      throw new InternalServerErrorException('Error fetching provinces');
    }
  }

  async getProvinceById(encodedId: string) {
    try {
      const id = decodeId(encodedId);

      const province = await this.prisma.provinces.findUnique({
        where: { id },
      });

      if (!province) {
        throw new NotFoundException('Province not found');
      }

      return {
        success: true,
        data: {
          ...province,
          id: encodeId(province.id),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error in getProvinceById:', error);
      throw new InternalServerErrorException('Error fetching province');
    }
  }

  async createProvince(createProvinceDto: CreateProvinceDto) {
    try {
      const { name, code } = createProvinceDto;

      const newProvince = await this.prisma.provinces.create({
        data: {
          name,
          code: code || null,
        },
      });

      return {
        success: true,
        message: 'Province created successfully',
        data: {
          ...newProvince,
          id: encodeId(newProvince.id),
        },
      };
    } catch (error) {
      this.logger.error('Error in createProvince:', error);
      throw new InternalServerErrorException('Error creating province');
    }
  }

  async updateProvince(
    encodedId: string,
    updateProvinceDto: UpdateProvinceDto,
  ) {
    try {
      const id = decodeId(encodedId);
      const { name, code } = updateProvinceDto;

      const updateData: Prisma.provincesUncheckedUpdateInput = {
        updated_at: new Date(),
      };
      if (name) updateData.name = name;
      if (code !== undefined) updateData.code = code;

      const updatedProvince = await this.prisma.provinces.update({
        where: { id },
        data: updateData,
      });

      return {
        success: true,
        message: 'Province updated successfully',
        data: {
          ...updatedProvince,
          id: encodeId(updatedProvince.id),
        },
      };
    } catch (error: unknown) {
      if (isNodeError(error) && error.code === 'P2025') {
        throw new NotFoundException('Province not found');
      }
      this.logger.error('Error in updateProvince:', error);
      throw new InternalServerErrorException('Error updating province');
    }
  }

  async deleteProvince(encodedId: string) {
    try {
      const id = decodeId(encodedId);

      await this.prisma.provinces.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Province deleted successfully',
      };
    } catch (error: unknown) {
      if (isNodeError(error) && error.code === 'P2025') {
        throw new NotFoundException('Province not found');
      }

      this.logger.error('Error in deleteProvince:', error);
      throw new InternalServerErrorException('Error deleting province');
    }
  }

  async getAllDistricts() {
    try {
      const districts = await this.prisma.districts.findMany();

      if (!districts || districts.length === 0) {
        return {
          success: true,
          message: 'No districts found',
          data: [],
        };
      }

      const encodedDistricts = districts.map((district) => ({
        ...district,
        id: encodeId(district.id),
        province_id: encodeId(district.province_id),
      }));

      return {
        success: true,
        data: encodedDistricts,
      };
    } catch (error) {
      this.logger.error('Error in getAllDistricts:', error);
      throw new InternalServerErrorException('Error fetching districts');
    }
  }

  async getDistrictsByProvince(encodedProvinceId: string) {
    try {
      const provinceId = decodeId(encodedProvinceId);

      const districts = await this.prisma.districts.findMany({
        where: { province_id: provinceId },
      });

      if (!districts || districts.length === 0) {
        return {
          success: true,
          message: 'No districts found',
          data: [],
        };
      }

      const encodedDistricts = districts.map((district) => ({
        ...district,
        id: encodeId(district.id),
        province_id: encodeId(district.province_id),
      }));

      return {
        success: true,
        data: encodedDistricts,
      };
    } catch (error) {
      this.logger.error('Error in getDistrictsByProvince:', error);
      throw new InternalServerErrorException('Error fetching districts');
    }
  }

  async createDistrict(createDistrictDto: CreateDistrictDto) {
    try {
      const { name, province_id } = createDistrictDto;
      const decodedProvinceId = decodeId(province_id);

      const newDistrict = await this.prisma.districts.create({
        data: {
          name,
          province_id: decodedProvinceId,
        },
      });

      return {
        success: true,
        message: 'District created successfully',
        data: {
          ...newDistrict,
          id: encodeId(newDistrict.id),
          province_id: encodeId(newDistrict.province_id),
        },
      };
    } catch (error) {
      if (isNodeError(error) && error.code === 'P2003') {
        throw new NotFoundException('Province not found');
      }
      this.logger.error('Error in createDistrict:', error);
      throw new InternalServerErrorException('Error creating district');
    }
  }

  async updateDistrict(
    encodedId: string,
    updateDistrictDto: UpdateDistrictDto,
  ) {
    try {
      const id = decodeId(encodedId);
      const { name, province_id } = updateDistrictDto;

      const updateData: Prisma.districtsUncheckedUpdateInput = {
        updated_at: new Date(),
      };
      if (name) updateData.name = name;
      if (province_id) {
        const decodedProvinceId: number = decodeId(province_id);
        updateData.province_id = decodedProvinceId;
      }

      const updatedDistrict = await this.prisma.districts.update({
        where: { id },
        data: updateData,
      });

      return {
        success: true,
        message: 'District updated successfully',
        data: {
          ...updatedDistrict,
          id: encodeId(updatedDistrict.id),
          province_id: encodeId(updatedDistrict.province_id),
        },
      };
    } catch (error) {
      if (isNodeError(error) && error.code === 'P2025') {
        throw new NotFoundException('District not found');
      }

      if (isNodeError(error) && error.code === 'P2003') {
        throw new NotFoundException('Province not found');
      }
      this.logger.error('Error in updateDistrict:', error);
      throw new InternalServerErrorException('Error updating district');
    }
  }

  async deleteDistrict(encodedId: string) {
    try {
      const id = decodeId(encodedId);

      await this.prisma.districts.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'District deleted successfully',
      };
    } catch (error) {
      if (isNodeError(error) && error.code === 'P2025') {
        throw new NotFoundException('District not found');
      }
      this.logger.error('Error in deleteDistrict:', error);
      throw new InternalServerErrorException('Error deleting district');
    }
  }

  async getAllCities() {
    try {
      const cities = await this.prisma.cities.findMany();

      if (!cities || cities.length === 0) {
        return {
          success: true,
          message: 'No cities found',
          data: [],
        };
      }

      const encodedCities = cities.map((city) => ({
        ...city,
        id: encodeId(city.id),
        district_id: encodeId(city.district_id),
      }));

      return {
        success: true,
        data: encodedCities,
      };
    } catch (error) {
      this.logger.error('Error in getAllCities:', error);
      throw new InternalServerErrorException('Error fetching cities');
    }
  }

  async getCitiesByDistrict(encodedDistrictId: string) {
    try {
      const districtId = decodeId(encodedDistrictId);

      const cities = await this.prisma.cities.findMany({
        where: { district_id: districtId },
      });

      if (!cities || cities.length === 0) {
        return {
          success: true,
          message: 'No cities found',
          data: [],
        };
      }

      const encodedCities = cities.map((city) => ({
        ...city,
        id: encodeId(city.id),
        district_id: encodeId(city.district_id),
      }));

      return {
        success: true,
        data: encodedCities,
      };
    } catch (error) {
      this.logger.error('Error in getCitiesByDistrict:', error);
      throw new InternalServerErrorException('Error fetching cities');
    }
  }

  async createCity(createCityDto: CreateCityDto) {
    try {
      const { name, district_id } = createCityDto;
      const decodedDistrictId = decodeId(district_id);

      const newCity = await this.prisma.cities.create({
        data: {
          name,
          district_id: decodedDistrictId,
        },
      });

      return {
        success: true,
        message: 'City created successfully',
        data: {
          ...newCity,
          id: encodeId(newCity.id),
          district_id: encodeId(newCity.district_id),
        },
      };
    } catch (error) {
      if (isNodeError(error) && error.code === 'P2003') {
        throw new NotFoundException('District not found');
      }
      this.logger.error('Error in createCity:', error);
      throw new InternalServerErrorException('Error creating city');
    }
  }

  async updateCity(encodedId: string, updateCityDto: UpdateCityDto) {
    try {
      const id = decodeId(encodedId);
      const { name, district_id } = updateCityDto;

      const updateData: Prisma.citiesUncheckedUpdateInput = {
        updated_at: new Date(),
      };
      if (name) updateData.name = name;
      if (district_id) {
        const decodedDistrictId = decodeId(district_id);
        updateData.district_id = decodedDistrictId;
      }

      const updatedCity = await this.prisma.cities.update({
        where: { id },
        data: updateData,
      });

      return {
        success: true,
        message: 'City updated successfully',
        data: {
          ...updatedCity,
          id: encodeId(updatedCity.id),
          district_id: encodeId(updatedCity.district_id),
        },
      };
    } catch (error) {
      if (isNodeError(error) && error.code === 'P2025') {
        throw new NotFoundException('City not found');
      }

      if (isNodeError(error) && error.code === 'P2003') {
        throw new NotFoundException('District not found');
      }
      this.logger.error('Error in updateCity:', error);
      throw new InternalServerErrorException('Error updating city');
    }
  }

  async deleteCity(encodedId: string) {
    try {
      const id = decodeId(encodedId);

      await this.prisma.cities.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'City deleted successfully',
      };
    } catch (error) {
      if (isNodeError(error) && error.code === 'P2025') {
        throw new NotFoundException('City not found');
      }
      this.logger.error('Error in deleteCity:', error);
      throw new InternalServerErrorException('Error deleting city');
    }
  }

  async getAllAreas() {
    try {
      const areas = await this.prisma.areas.findMany();

      if (!areas || areas.length === 0) {
        return {
          success: true,
          message: 'No areas found',
          data: [],
        };
      }

      const encodedAreas = areas.map((area) => ({
        ...area,
        id: encodeId(area.id),
        city_id: encodeId(area.city_id),
        nearby_id: area.nearby_id ? encodeId(area.nearby_id) : null,
      }));

      return {
        success: true,
        data: encodedAreas,
      };
    } catch (error) {
      this.logger.error('Error in getAllAreas:', error);
      throw new InternalServerErrorException('Error fetching areas');
    }
  }

  async getAreasByCity(encodedCityId: string) {
    try {
      const cityId = decodeId(encodedCityId);

      const areas = await this.prisma.areas.findMany({
        where: { city_id: cityId },
      });

      if (!areas || areas.length === 0) {
        return {
          success: true,
          message: 'No areas found',
          data: [],
        };
      }

      const encodedAreas = areas.map((area) => ({
        ...area,
        id: encodeId(area.id),
        city_id: encodeId(area.city_id),
        nearby_id: area.nearby_id ? encodeId(area.nearby_id) : null,
      }));

      return {
        success: true,
        data: encodedAreas,
      };
    } catch (error) {
      this.logger.error('Error in getAreasByCity:', error);
      throw new InternalServerErrorException('Error fetching areas');
    }
  }

  async createArea(createAreaDto: CreateAreaDto) {
    try {
      const { name, city_id, postal_code, nearby_id } = createAreaDto;
      const decodedCityId = decodeId(city_id);

      const createData: Prisma.areasUncheckedCreateInput = {
        name,
        city_id: decodedCityId,
        postal_code: postal_code || null,
      };

      if (nearby_id) {
        const decodedNearbyId = decodeId(nearby_id);
        createData.nearby_id = decodedNearbyId;
      }

      const newArea = await this.prisma.areas.create({
        data: createData,
      });

      return {
        success: true,
        message: 'Area created successfully',
        data: {
          ...newArea,
          id: encodeId(newArea.id),
          city_id: encodeId(newArea.city_id),
          nearby_id: newArea.nearby_id ? encodeId(newArea.nearby_id) : null,
        },
      };
    } catch (error) {
      if (isNodeError(error) && error.code === 'P2003') {
        throw new NotFoundException('City or nearby area not found');
      }
      this.logger.error('Error in createArea:', error);
      throw new InternalServerErrorException('Error creating area');
    }
  }

  async updateArea(encodedId: string, updateAreaDto: UpdateAreaDto) {
    try {
      const id = decodeId(encodedId);
      const { name, city_id, postal_code, nearby_id } = updateAreaDto;

      const updateData: Prisma.areasUncheckedUpdateInput = {
        updated_at: new Date(),
      };
      if (name) updateData.name = name;
      if (postal_code !== undefined) updateData.postal_code = postal_code;

      if (city_id) {
        const decodedCityId = decodeId(city_id);
        updateData.city_id = decodedCityId;
      }

      if (nearby_id !== undefined) {
        if (nearby_id === null || nearby_id === '') {
          updateData.nearby_id = null;
        } else {
          const decodedNearbyId = decodeId(nearby_id);
          updateData.nearby_id = decodedNearbyId;
        }
      }

      const updatedArea = await this.prisma.areas.update({
        where: { id },
        data: updateData,
      });

      return {
        success: true,
        message: 'Area updated successfully',
        data: {
          ...updatedArea,
          id: encodeId(updatedArea.id),
          city_id: encodeId(updatedArea.city_id),
          nearby_id: updatedArea.nearby_id
            ? encodeId(updatedArea.nearby_id)
            : null,
        },
      };
    } catch (error) {
      if (isNodeError(error) && error.code === 'P2025') {
        throw new NotFoundException('Area not found');
      }

      if (isNodeError(error) && error.code === 'P2003') {
        throw new NotFoundException('City or nearby area not found');
      }
      this.logger.error('Error in updateArea:', error);
      throw new InternalServerErrorException('Error updating area');
    }
  }

  async deleteArea(encodedId: string) {
    try {
      const id = decodeId(encodedId);

      await this.prisma.areas.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Area deleted successfully',
      };
    } catch (error) {
      if (isNodeError(error) && error.code === 'P2025') {
        throw new NotFoundException('Area not found');
      }
      this.logger.error('Error in deleteArea:', error);
      throw new InternalServerErrorException('Error deleting area');
    }
  }
}
