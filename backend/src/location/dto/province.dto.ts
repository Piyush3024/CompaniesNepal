import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  Validate,
} from 'class-validator';

import { Exclude, Expose } from 'class-transformer';
import {
  LOCATION_CONFIG,
  STATE_CODE_CONFIG,
} from '../../common/constants/validation.constants';
import { AtLeastOne } from '../../common/validators/at-least-one.validator';

export class CreateProvinceDto {
  @IsString({ message: 'Province name must be a string' })
  @IsNotEmpty({ message: 'Province name is required' })
  @MinLength(LOCATION_CONFIG.NAME_MIN_LENGTH, {
    message: `Province name must be at least ${LOCATION_CONFIG.NAME_MIN_LENGTH} characters`,
  })
  @MaxLength(LOCATION_CONFIG.NAME_MAX_LENGTH, {
    message: `Province name must not exceed ${LOCATION_CONFIG.NAME_MAX_LENGTH} characters`,
  })
  @Matches(LOCATION_CONFIG.NAME_REGEX, {
    message: LOCATION_CONFIG.NAME_MESSAGE,
  })
  name: string;

  @IsOptional()
  @IsString({ message: 'Province code must be a string' })
  @MaxLength(STATE_CODE_CONFIG.MAX_LENGTH, {
    message: `Province code must not exceed ${STATE_CODE_CONFIG.MAX_LENGTH} characters`,
  })
  @Matches(STATE_CODE_CONFIG.REGEX, {
    message: STATE_CODE_CONFIG.MESSAGE,
  })
  code?: string;
}

export class UpdateProvinceDto {
  @IsOptional()
  @IsString({ message: 'Province name must be a string' })
  @MinLength(LOCATION_CONFIG.NAME_MIN_LENGTH, {
    message: `Province name must be at least ${LOCATION_CONFIG.NAME_MIN_LENGTH} characters`,
  })
  @MaxLength(LOCATION_CONFIG.NAME_MAX_LENGTH, {
    message: `Province name must not exceed ${LOCATION_CONFIG.NAME_MAX_LENGTH} characters`,
  })
  @Matches(LOCATION_CONFIG.NAME_REGEX, {
    message: LOCATION_CONFIG.NAME_MESSAGE,
  })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Province code must be a string' })
  @MaxLength(STATE_CODE_CONFIG.MAX_LENGTH, {
    message: `Province code must not exceed ${STATE_CODE_CONFIG.MAX_LENGTH} characters`,
  })
  @Matches(STATE_CODE_CONFIG.REGEX, {
    message: STATE_CODE_CONFIG.MESSAGE,
  })
  code?: string;
  updated_at?: Date;

  // Virtual property for validation
  @Validate(AtLeastOne, [['name', 'code']], {
    message: 'At least one field (name or code) must be provided for update',
  })
  _atLeastOne?: any;
}

export class ProvinceResponseDto {
  @Expose()
  id: string; // Encoded ID

  @Expose()
  name: string;

  @Expose()
  code: string | null;

  @Expose()
  created_at?: Date;

  @Expose()
  updated_at?: Date;
}

export class ProvinceParamDto {
  @IsString()
  @IsNotEmpty({ message: 'Province ID is required' })
  @Matches(/^[0-9A-Za-z]+-[0-9a-f]{8}$/, {
    message: 'Invalid province ID format',
  })
  provinceId: string;
}
