import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { PASSWORD_CONFIG } from '../../common/constants/validation.constants';

export class LoginDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(PASSWORD_CONFIG.MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters`,
  })
  @MaxLength(PASSWORD_CONFIG.MAX_LENGTH, {
    message: `Password must not exceed ${PASSWORD_CONFIG.MAX_LENGTH} characters`,
  })
  @Matches(PASSWORD_CONFIG.REGEX, {
    message: PASSWORD_CONFIG.MESSAGE,
  })
  password: string;
}
