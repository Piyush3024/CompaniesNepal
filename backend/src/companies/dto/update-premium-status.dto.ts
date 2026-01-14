// src/companies/dto/update-premium-status.dto.ts

import { IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePremiumStatusDto {
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value as boolean;
  })
  @IsBoolean({ message: 'is_premium must be a boolean value' })
  is_premium: boolean;
}
