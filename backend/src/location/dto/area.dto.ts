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
import {
  LOCATION_CONFIG,
  POSTAL_CODE_CONFIG,
} from '../../common/constants/validation.constants';
import { IsEncodedId } from '../../common/validators/is-encoded-id.validator';
import { AtLeastOne } from '../../common/validators/at-least-one.validator';

export class CreateAreaDto {
  @IsString({ message: 'Area name must be a string' })
  @IsNotEmpty({ message: 'Area name is required' })
  @MinLength(LOCATION_CONFIG.NAME_MIN_LENGTH, {
    message: `Area name must be at least ${LOCATION_CONFIG.NAME_MIN_LENGTH} characters`,
  })
  @MaxLength(LOCATION_CONFIG.NAME_MAX_LENGTH, {
    message: `Area name must not exceed ${LOCATION_CONFIG.NAME_MAX_LENGTH} characters`,
  })
  @Matches(LOCATION_CONFIG.NAME_REGEX, {
    message: LOCATION_CONFIG.NAME_MESSAGE,
  })
  name: string;

  @IsString({ message: 'City ID must be a string' })
  @IsNotEmpty({ message: 'City ID is required' })
  @IsEncodedId({ message: 'Invalid city ID' })
  city_id: string;

  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  @MaxLength(POSTAL_CODE_CONFIG.MAX_LENGTH, {
    message: `Postal code must not exceed ${POSTAL_CODE_CONFIG.MAX_LENGTH} characters`,
  })
  @Matches(POSTAL_CODE_CONFIG.REGEX, {
    message: POSTAL_CODE_CONFIG.MESSAGE,
  })
  postal_code?: string;

  @IsOptional()
  @IsString({ message: 'Nearby area ID must be a string' })
  @IsEncodedId({ message: 'Invalid nearby area ID' })
  nearby_id?: string;
}

export class UpdateAreaDto {
  @IsOptional()
  @IsString({ message: 'Area name must be a string' })
  @MinLength(LOCATION_CONFIG.NAME_MIN_LENGTH, {
    message: `Area name must be at least ${LOCATION_CONFIG.NAME_MIN_LENGTH} characters`,
  })
  @MaxLength(LOCATION_CONFIG.NAME_MAX_LENGTH, {
    message: `Area name must not exceed ${LOCATION_CONFIG.NAME_MAX_LENGTH} characters`,
  })
  @Matches(LOCATION_CONFIG.NAME_REGEX, {
    message: LOCATION_CONFIG.NAME_MESSAGE,
  })
  name?: string;

  @IsOptional()
  @IsString({ message: 'City ID must be a string' })
  @IsEncodedId({ message: 'Invalid city ID' })
  city_id?: string;

  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  @MaxLength(POSTAL_CODE_CONFIG.MAX_LENGTH, {
    message: `Postal code must not exceed ${POSTAL_CODE_CONFIG.MAX_LENGTH} characters`,
  })
  @Matches(POSTAL_CODE_CONFIG.REGEX, {
    message: POSTAL_CODE_CONFIG.MESSAGE,
  })
  postal_code?: string;

  @IsOptional()
  @IsString({ message: 'Nearby area ID must be a string' })
  @IsEncodedId({ message: 'Invalid nearby area ID' })
  nearby_id?: string;

  // Virtual property for validation
  @Validate(AtLeastOne, [['name', 'city_id', 'postal_code', 'nearby_id']], {
    message: 'At least one field must be provided for update',
  })
  _atLeastOne?: any;
}

export class AreaResponseDto {
  @Expose()
  id: string; // Encoded ID

  @Expose()
  name: string;

  @Expose()
  city_id: string; // Encoded ID

  @Expose()
  postal_code: string | null;

  @Expose()
  nearby_id: string | null; // Encoded ID

  @Expose()
  created_at?: Date;

  @Expose()
  updated_at?: Date;
}

export class AreaParamDto {
  @IsString()
  @IsNotEmpty({ message: 'Area ID is required' })
  @Matches(/^[0-9A-Za-z]+-[0-9a-f]{8}$/, {
    message: 'Invalid area ID format',
  })
  areaId: string;
}

export class CityParamDto {
  @IsString()
  @IsNotEmpty({ message: 'City ID is required' })
  @Matches(/^[0-9A-Za-z]+-[0-9a-f]{8}$/, {
    message: 'Invalid city ID format',
  })
  cityId: string;
}
