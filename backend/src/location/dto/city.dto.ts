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

export class CreateCityDto {
  @IsString({ message: 'City name must be a string' })
  @IsNotEmpty({ message: 'City name is required' })
  @MinLength(LOCATION_CONFIG.NAME_MIN_LENGTH, {
    message: `City name must be at least ${LOCATION_CONFIG.NAME_MIN_LENGTH} characters`,
  })
  @MaxLength(LOCATION_CONFIG.NAME_MAX_LENGTH, {
    message: `City name must not exceed ${LOCATION_CONFIG.NAME_MAX_LENGTH} characters`,
  })
  @Matches(LOCATION_CONFIG.NAME_REGEX, {
    message: LOCATION_CONFIG.NAME_MESSAGE,
  })
  name: string;

  @IsString({ message: 'District ID must be a string' })
  @IsNotEmpty({ message: 'District ID is required' })
  @IsEncodedId({ message: 'Invalid district ID' })
  district_id: string;
}

export class UpdateCityDto {
  @IsOptional()
  @IsString({ message: 'City name must be a string' })
  @MinLength(LOCATION_CONFIG.NAME_MIN_LENGTH, {
    message: `City name must be at least ${LOCATION_CONFIG.NAME_MIN_LENGTH} characters`,
  })
  @MaxLength(LOCATION_CONFIG.NAME_MAX_LENGTH, {
    message: `City name must not exceed ${LOCATION_CONFIG.NAME_MAX_LENGTH} characters`,
  })
  @Matches(LOCATION_CONFIG.NAME_REGEX, {
    message: LOCATION_CONFIG.NAME_MESSAGE,
  })
  name?: string;

  @IsOptional()
  @IsString({ message: 'District ID must be a string' })
  @IsEncodedId({ message: 'Invalid district ID' })
  district_id?: string;

  // Virtual property for validation
  @Validate(AtLeastOne, [['name', 'district_id']], {
    message:
      'At least one field (name or district_id) must be provided for update',
  })
  _atLeastOne?: any;
}

export class CityResponseDto {
  @Expose()
  id: string; // Encoded ID

  @Expose()
  name: string;

  @Expose()
  district_id: string; // Encoded ID

  @Expose()
  created_at?: Date;

  @Expose()
  updated_at?: Date;
}

export class CityParamDto {
  @IsString()
  @IsNotEmpty({ message: 'City ID is required' })
  @Matches(/^[0-9A-Za-z]+-[0-9a-f]{8}$/, {
    message: 'Invalid city ID format',
  })
  cityId: string;
}

export class DistrictParamDto {
  @IsString()
  @IsNotEmpty({ message: 'District ID is required' })
  @Matches(/^[0-9A-Za-z]+-[0-9a-f]{8}$/, {
    message: 'Invalid district ID format',
  })
  districtId: string;
}
