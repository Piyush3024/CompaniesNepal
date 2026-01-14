import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SortQueryDto } from './company-query.dto';
import { COMPANY_FILTER_CONFIG } from '../constants/company.constants';
import { IsEncodedId } from '../../common/validators/is-encoded-id.validator';

export class FilterCompaniesDto extends SortQueryDto {
  // Basic filters
  @IsOptional()
  @IsEncodedId({ message: 'Invalid company type ID format' })
  company_type_id?: string;

  @IsOptional()
  @IsEncodedId({ message: 'Invalid area ID format' })
  area_id?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_premium?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_verified?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_blocked?: boolean;

  // Rating filters
  @IsOptional()
  @Type(() => Number)
  @Min(COMPANY_FILTER_CONFIG.RATING_MIN)
  @Max(COMPANY_FILTER_CONFIG.RATING_MAX)
  min_rating?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(COMPANY_FILTER_CONFIG.RATING_MIN)
  @Max(COMPANY_FILTER_CONFIG.RATING_MAX)
  max_rating?: number;

  // Year filters
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(COMPANY_FILTER_CONFIG.MIN_YEAR)
  @Max(COMPANY_FILTER_CONFIG.MAX_YEAR)
  min_year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(COMPANY_FILTER_CONFIG.MIN_YEAR)
  @Max(COMPANY_FILTER_CONFIG.MAX_YEAR)
  max_year?: number;

  // Review count filters
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(COMPANY_FILTER_CONFIG.COUNT_MIN)
  min_reviews?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(COMPANY_FILTER_CONFIG.COUNT_MIN)
  max_reviews?: number;

  // Product count filters
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(COMPANY_FILTER_CONFIG.COUNT_MIN)
  min_products?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(COMPANY_FILTER_CONFIG.COUNT_MIN)
  max_products?: number;

  // Inquiry count filters
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(COMPANY_FILTER_CONFIG.COUNT_MIN)
  min_inquiries?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(COMPANY_FILTER_CONFIG.COUNT_MIN)
  max_inquiries?: number;

  // Search query
  @IsOptional()
  @IsString()
  @Max(255)
  search?: string;

  // Include relations
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeRelations?: boolean = true;
}
