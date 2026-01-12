import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { PASSWORD_CONFIG } from '../../common/constants/validation.constants';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(PASSWORD_CONFIG.MIN_LENGTH, {
    message: PASSWORD_CONFIG.MESSAGE,
  })
  @MaxLength(PASSWORD_CONFIG.MAX_LENGTH, {
    message: PASSWORD_CONFIG.MESSAGE,
  })
  @Matches(PASSWORD_CONFIG.REGEX, {
    message: PASSWORD_CONFIG.MESSAGE,
  })
  password: string;
}
