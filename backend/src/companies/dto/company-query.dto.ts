import { IsOptional, IsInt, Min, IsIn, IsString, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { COMPANY_FILTER_CONFIG } from '../constants/company.constants';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class SortQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(COMPANY_FILTER_CONFIG.VALID_SORT_FIELDS)
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class SearchQueryDto extends SortQueryDto {
  @IsOptional()
  @IsString()
  @Max(255)
  query?: string;
}

export class TopRatedQueryDto extends SortQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  min_reviews?: number = 5;
}
