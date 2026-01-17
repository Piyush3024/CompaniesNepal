import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { CompaniesService } from './companies.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  FilterCompaniesDto,
  SortQueryDto,
  SearchQueryDto,
  TopRatedQueryDto,
  UpdatePremiumStatusDto,
  UpdateVerificationStatusDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { UploadEntityFiles } from '../file/interceptors/file-upload.interceptor';
import { FileValidationPipe } from '../file/pipes/file-validation.pipe';
import type { UserWithRole } from '../auth/types/user-with-role.type';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll(
    @Query() query: SortQueryDto,
    @CurrentUser() user: UserWithRole | null,
    @Req() req: Request,
  ) {
    const result = await this.companiesService.findAll(query, user, req);
    return {
      success: true,
      message: 'Companies retrieved successfully',
      ...result,
    };
  }

  @Get('premium-companies')
  async findPremium(@Query() query: SortQueryDto, @Req() req: Request) {
    const result = await this.companiesService.findPremium(query, req);
    return {
      success: true,
      message: 'Premium companies retrieved successfully',
      ...result,
    };
  }

  @Get('verified-companies')
  async findVerified(@Query() query: SortQueryDto, @Req() req: Request) {
    const result = await this.companiesService.findVerified(query, req);
    return {
      success: true,
      message: 'Verified companies retrieved successfully',
      ...result,
    };
  }

  @Get('top-rated')
  async findTopRated(@Query() query: TopRatedQueryDto, @Req() req: Request) {
    const result = await this.companiesService.findTopRated(query, req);
    return {
      success: true,
      message: 'Top rated companies retrieved successfully',
      ...result,
    };
  }

  @Get('blocked-companies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findBlocked(@Query() query: SortQueryDto, @Req() req: Request) {
    const result = await this.companiesService.findBlocked(query, req);
    return {
      success: true,
      message: 'Blocked companies retrieved successfully',
      ...result,
    };
  }

  @Get('my-companies')
  @UseGuards(JwtAuthGuard)
  async findMyCompanies(
    @Query() query: SortQueryDto,
    @CurrentUser() user: UserWithRole,
    @Req() req: Request,
  ) {
    const result = await this.companiesService.findMyCompanies(
      query,
      user,
      req,
    );
    return {
      success: true,
      message: 'My companies retrieved successfully',
      ...result,
    };
  }

  @Get('search')
  async search(
    @Query() query: SearchQueryDto,
    @CurrentUser() user: UserWithRole | null,
    @Req() req: Request,
  ) {
    const result = await this.companiesService.search(query, user, req);
    return {
      success: true,
      message: 'Companies retrieved successfully',
      ...result,
    };
  }

  @Get('slug/:slug/check')
  async checkSlugUniqueness(
    @Param('slug') slug: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const result = await this.companiesService.checkSlugUniqueness(
      slug,
      excludeId,
    );
    return {
      success: true,
      ...result,
    };
  }

  @Get('company-types')
  async getCompanyTypes() {
    const data = await this.companiesService.getCompanyTypes();
    return {
      success: true,
      message: 'Company types retrieved successfully',
      data,
    };
  }

  @Get('filter')
  async filter(
    @Query() filterDto: FilterCompaniesDto,
    @CurrentUser() user: UserWithRole | null,
    @Req() req: Request,
  ) {
    const result = await this.companiesService.filter(filterDto, user, req);
    return {
      success: true,
      message: 'Companies filtered successfully',
      ...result,
    };
  }

  @Get(':idOrSlug')
  async findOne(
    @Param('idOrSlug') idOrSlug: string,
    @CurrentUser() user: UserWithRole | null,
    @Req() req: Request,
  ) {
    const data = await this.companiesService.findByIdOrSlug(
      idOrSlug,
      user,
      req,
    );
    return {
      success: true,
      message: 'Company retrieved successfully',
      data,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @UseInterceptors(UploadEntityFiles('companies'))
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
    @UploadedFiles(
      new FileValidationPipe({
        entityName: 'companies',
        required: [],
      }),
    )
    files: {
      logo_url?: Express.Multer.File[];
      documents_url?: Express.Multer.File[];
    },
    @CurrentUser() user: UserWithRole,
    @Req() req: Request,
  ) {
    const data = await this.companiesService.create(
      createCompanyDto,
      files,
      user,
      req,
    );
    return {
      success: true,
      message: 'Company created successfully',
      data,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @UseInterceptors(UploadEntityFiles('companies'))
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @UploadedFiles(
      new FileValidationPipe({
        entityName: 'companies',
        required: [],
      }),
    )
    files: {
      logo_url?: Express.Multer.File[];
      documents_url?: Express.Multer.File[];
    },
    @CurrentUser() user: UserWithRole,
    @Req() req: Request,
  ) {
    const data = await this.companiesService.update(
      id,
      updateCompanyDto,
      files,
      user,
      req,
    );
    return {
      success: true,
      message: 'Company updated successfully',
      data,
    };
  }

  @Patch(':id/premium')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updatePremiumStatus(
    @Param('id') id: string,
    @Body() updatePremiumStatusDto: UpdatePremiumStatusDto,
    @Req() req: Request,
  ) {
    const result = await this.companiesService.updatePremiumStatus(
      id,
      updatePremiumStatusDto,
      req,
    );
    return {
      success: true,
      ...result,
    };
  }

  @Patch(':id/verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateVerificationStatus(
    @Param('id') id: string,
    @Body() updateVerificationStatusDto: UpdateVerificationStatusDto,
    @Req() req: Request,
  ) {
    const result = await this.companiesService.updateVerificationStatus(
      id,
      updateVerificationStatusDto,
      req,
    );
    return {
      success: true,
      ...result,
    };
  }

  @Patch(':id/toggle-block')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async toggleBlockStatus(@Param('id') id: string, @Req() req: Request) {
    const result = await this.companiesService.toggleBlockStatus(id, req);
    return {
      success: true,
      ...result,
    };
  }

  @Patch(':id/recalculate-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async recalculateStats(@Param('id') id: string) {
    const result = await this.companiesService.recalculateStats(id);
    return {
      success: true,
      ...result,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser() user: UserWithRole) {
    const result = await this.companiesService.remove(id, user);
    return {
      success: true,
      ...result,
    };
  }
}
