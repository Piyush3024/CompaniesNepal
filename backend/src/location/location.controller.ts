import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  // Province DTOs
  CreateProvinceDto,
  UpdateProvinceDto,
  ProvinceParamDto,
  // District DTOs
  CreateDistrictDto,
  UpdateDistrictDto,
  DistrictParamDto,
  // City DTOs
  CreateCityDto,
  UpdateCityDto,
  CityParamDto,
  // Area DTOs
  CreateAreaDto,
  UpdateAreaDto,
  AreaParamDto,
} from './dto';
import { LocationService } from './location.service';

@Controller('location')
@UseGuards(JwtAuthGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('provinces')
  async getAllProvinces() {
    const provinces = await this.locationService.getAllProvinces();
    return provinces;
  }

  @Get('provinces/:provinceId')
  async getProvinceById(@Param() params: ProvinceParamDto) {
    return this.locationService.getProvinceById(params.provinceId);
  }

  @Post('provinces')
  @HttpCode(HttpStatus.CREATED)
  async createProvince(@Body() createProvinceDto: CreateProvinceDto) {
    return this.locationService.createProvince(createProvinceDto);
  }

  @Put('provinces/:provinceId')
  async updateProvince(
    @Param() params: ProvinceParamDto,
    @Body() updateProvinceDto: UpdateProvinceDto,
  ) {
    return this.locationService.updateProvince(
      params.provinceId,
      updateProvinceDto,
    );
  }

  @Delete('provinces/:provinceId')
  @HttpCode(HttpStatus.OK)
  async deleteProvince(@Param() params: ProvinceParamDto) {
    return this.locationService.deleteProvince(params.provinceId);
  }

  // ==================== DISTRICT ENDPOINTS ====================

  @Get('districts')
  async getAllDistricts() {
    return this.locationService.getAllDistricts();
  }

  @Get('provinces/:provinceId/districts')
  async getDistrictsByProvince(@Param() params: ProvinceParamDto) {
    return this.locationService.getDistrictsByProvince(params.provinceId);
  }

  @Post('districts')
  @HttpCode(HttpStatus.CREATED)
  async createDistrict(@Body() createDistrictDto: CreateDistrictDto) {
    return this.locationService.createDistrict(createDistrictDto);
  }

  @Put('districts/:districtId')
  async updateDistrict(
    @Param() params: DistrictParamDto,
    @Body() updateDistrictDto: UpdateDistrictDto,
  ) {
    return this.locationService.updateDistrict(
      params.districtId,
      updateDistrictDto,
    );
  }

  @Delete('districts/:districtId')
  @HttpCode(HttpStatus.OK)
  async deleteDistrict(@Param() params: DistrictParamDto) {
    return this.locationService.deleteDistrict(params.districtId);
  }

  // ==================== CITY ENDPOINTS ====================

  @Get('cities')
  async getAllCities() {
    return this.locationService.getAllCities();
  }

  @Get('districts/:districtId/cities')
  async getCitiesByDistrict(@Param() params: DistrictParamDto) {
    return this.locationService.getCitiesByDistrict(params.districtId);
  }

  @Post('cities')
  @HttpCode(HttpStatus.CREATED)
  async createCity(@Body() createCityDto: CreateCityDto) {
    return this.locationService.createCity(createCityDto);
  }

  @Put('cities/:cityId')
  async updateCity(
    @Param() params: CityParamDto,
    @Body() updateCityDto: UpdateCityDto,
  ) {
    return this.locationService.updateCity(params.cityId, updateCityDto);
  }

  @Delete('cities/:cityId')
  @HttpCode(HttpStatus.OK)
  async deleteCity(@Param() params: CityParamDto) {
    return this.locationService.deleteCity(params.cityId);
  }

  // ==================== AREA ENDPOINTS ====================

  @Get('areas')
  async getAllAreas() {
    return this.locationService.getAllAreas();
  }

  @Get('cities/:cityId/areas')
  async getAreasByCity(@Param() params: CityParamDto) {
    return this.locationService.getAreasByCity(params.cityId);
  }

  @Post('areas')
  @HttpCode(HttpStatus.CREATED)
  async createArea(@Body() createAreaDto: CreateAreaDto) {
    return this.locationService.createArea(createAreaDto);
  }

  @Put('areas/:areaId')
  async updateArea(
    @Param() params: AreaParamDto,
    @Body() updateAreaDto: UpdateAreaDto,
  ) {
    return this.locationService.updateArea(params.areaId, updateAreaDto);
  }

  @Delete('areas/:areaId')
  @HttpCode(HttpStatus.OK)
  async deleteArea(@Param() params: AreaParamDto) {
    return this.locationService.deleteArea(params.areaId);
  }
}
