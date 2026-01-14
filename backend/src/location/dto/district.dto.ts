import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  Validate,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { LOCATION_CONFIG } from '../../common/constants/validation.constants';
import { IsEncodedId } from '../../common/validators/is-encoded-id.validator';
import { AtLeastOne } from '../../common/validators/at-least-one.validator';

export class CreateDistrictDto {
  @IsString({ message: 'District name must be a string' })
  @IsNotEmpty({ message: 'District name is required' })
  @MinLength(LOCATION_CONFIG.NAME_MIN_LENGTH, {
    message: `District name must be at least ${LOCATION_CONFIG.NAME_MIN_LENGTH} characters`,
  })
  @MaxLength(LOCATION_CONFIG.NAME_MAX_LENGTH, {
    message: `District name must not exceed ${LOCATION_CONFIG.NAME_MAX_LENGTH} characters`,
  })
  @Matches(LOCATION_CONFIG.NAME_REGEX, {
    message: LOCATION_CONFIG.NAME_MESSAGE,
  })
  name: string;

  @IsString({ message: 'Province ID must be a string' })
  @IsNotEmpty({ message: 'Province ID is required' })
  @IsEncodedId({ message: 'Invalid province ID' })
  province_id: string;
}

export class UpdateDistrictDto {
  @IsOptional()
  @IsString({ message: 'District name must be a string' })
  @MinLength(LOCATION_CONFIG.NAME_MIN_LENGTH, {
    message: `District name must be at least ${LOCATION_CONFIG.NAME_MIN_LENGTH} characters`,
  })
  @MaxLength(LOCATION_CONFIG.NAME_MAX_LENGTH, {
    message: `District name must not exceed ${LOCATION_CONFIG.NAME_MAX_LENGTH} characters`,
  })
  @Matches(LOCATION_CONFIG.NAME_REGEX, {
    message: LOCATION_CONFIG.NAME_MESSAGE,
  })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Province ID must be a string' })
  @IsEncodedId({ message: 'Invalid province ID' })
  province_id?: string;
  updated_at?: Date;

  // Virtual property for validation
  @Validate(AtLeastOne, [['name', 'province_id']], {
    message:
      'At least one field (name or province_id) must be provided for update',
  })
  _atLeastOne?: any;
}

export class DistrictResponseDto {
  @Expose()
  id: string; // Encoded ID

  @Expose()
  name: string;

  @Expose()
  province_id: string; // Encoded ID

  @Expose()
  created_at?: Date;

  @Expose()
  updated_at?: Date;
}

export class DistrictParamDto {
  @IsString()
  @IsNotEmpty({ message: 'District ID is required' })
  @Matches(/^[0-9A-Za-z]+-[0-9a-f]{8}$/, {
    message: 'Invalid district ID format',
  })
  districtId: string;
}

export class ProvinceParamDto {
  @IsString()
  @IsNotEmpty({ message: 'Province ID is required' })
  @Matches(/^[0-9A-Za-z]+-[0-9a-f]{8}$/, {
    message: 'Invalid province ID format',
  })
  provinceId: string;
}
