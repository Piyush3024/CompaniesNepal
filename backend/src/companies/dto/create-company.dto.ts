import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  Min,
  Max,
  Matches,
  IsArray,
  ValidateNested,
  IsBoolean,
  MaxLength,
  MinLength,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  COMPANY_NAME_CONFIG,
  COMPANY_EMAIL_CONFIG,
  COMPANY_PHONE_CONFIG,
  COMPANY_WEBSITE_CONFIG,
  COMPANY_DESCRIPTION_CONFIG,
  COMPANY_REGISTRATION_CONFIG,
  COMPANY_ESTABLISHED_YEAR_CONFIG,
  COMPANY_SLUG_CONFIG,
  COMPANY_BRANCH_CONFIG,
  COMPANY_CATEGORY_CONFIG,
} from '../constants/company.constants';
import { IsEncodedId } from '../../common/validators/is-encoded-id.validator';

class CreateBranchDto {
  @IsString()
  @MinLength(COMPANY_BRANCH_CONFIG.NAME_MIN_LENGTH)
  @MaxLength(COMPANY_BRANCH_CONFIG.NAME_MAX_LENGTH)
  @Matches(COMPANY_BRANCH_CONFIG.NAME_REGEX, {
    message: COMPANY_BRANCH_CONFIG.NAME_MESSAGE,
  })
  branch_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(COMPANY_PHONE_CONFIG.MAX_LENGTH)
  @Matches(COMPANY_PHONE_CONFIG.REGEX, {
    message: COMPANY_PHONE_CONFIG.MESSAGE,
  })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: COMPANY_EMAIL_CONFIG.MESSAGE })
  @MaxLength(COMPANY_EMAIL_CONFIG.MAX_LENGTH)
  email?: string;

  @IsOptional()
  @IsEncodedId({ message: 'Invalid area ID format' })
  area_id?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

class CreateCategoryDto {
  @IsString()
  @MinLength(COMPANY_CATEGORY_CONFIG.MIN_LENGTH)
  @MaxLength(COMPANY_CATEGORY_CONFIG.MAX_LENGTH)
  @Matches(COMPANY_CATEGORY_CONFIG.REGEX, {
    message: COMPANY_CATEGORY_CONFIG.MESSAGE,
  })
  name: string;
}

export class CreateCompanyDto {
  @IsString()
  @MinLength(COMPANY_NAME_CONFIG.MIN_LENGTH)
  @MaxLength(COMPANY_NAME_CONFIG.MAX_LENGTH)
  @Matches(COMPANY_NAME_CONFIG.REGEX, {
    message: COMPANY_NAME_CONFIG.MESSAGE,
  })
  name: string;

  @IsOptional()
  @IsEmail({}, { message: COMPANY_EMAIL_CONFIG.MESSAGE })
  @MaxLength(COMPANY_EMAIL_CONFIG.MAX_LENGTH)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(COMPANY_PHONE_CONFIG.MAX_LENGTH)
  @Matches(COMPANY_PHONE_CONFIG.REGEX, {
    message: COMPANY_PHONE_CONFIG.MESSAGE,
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(COMPANY_WEBSITE_CONFIG.MAX_LENGTH)
  @Matches(COMPANY_WEBSITE_CONFIG.REGEX, {
    message: COMPANY_WEBSITE_CONFIG.MESSAGE,
  })
  website?: string;

  @IsOptional()
  @IsString()
  @MinLength(COMPANY_DESCRIPTION_CONFIG.MIN_LENGTH)
  @MaxLength(COMPANY_DESCRIPTION_CONFIG.MAX_LENGTH)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(COMPANY_ESTABLISHED_YEAR_CONFIG.MIN_YEAR)
  @Max(COMPANY_ESTABLISHED_YEAR_CONFIG.MAX_YEAR)
  @Type(() => Number)
  established_year?: number;

  @IsOptional()
  @IsString()
  @MinLength(COMPANY_REGISTRATION_CONFIG.MIN_LENGTH)
  @MaxLength(COMPANY_REGISTRATION_CONFIG.MAX_LENGTH)
  @Matches(COMPANY_REGISTRATION_CONFIG.REGEX, {
    message: COMPANY_REGISTRATION_CONFIG.MESSAGE,
  })
  registration_number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(COMPANY_SLUG_CONFIG.MAX_LENGTH)
  @Matches(COMPANY_SLUG_CONFIG.REGEX, {
    message: COMPANY_SLUG_CONFIG.MESSAGE,
  })
  slug?: string;

  @IsOptional()
  @IsObject()
  social_media_links?: Record<string, string>;

  @IsEncodedId({ message: 'Invalid company type ID format' })
  company_type_id: string;

  @IsOptional()
  @IsEncodedId({ message: 'Invalid area ID format' })
  area_id?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBranchDto)
  branches?: CreateBranchDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryDto)
  categories?: CreateCategoryDto[];
}
