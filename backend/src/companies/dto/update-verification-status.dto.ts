import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsEncodedId } from '../../common/validators/is-encoded-id.validator';

export class UpdateVerificationStatusDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value as boolean;
  })
  @IsBoolean({ message: 'is_verified must be a boolean value' })
  is_verified?: boolean;

  @IsOptional()
  @IsEncodedId({ message: 'Invalid verification status ID format' })
  verification_status_id?: string;
}
