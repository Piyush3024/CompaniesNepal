import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsInt,
} from 'class-validator';
import {
  PASSWORD_CONFIG,
  USERNAME_CONFIG,
  EMAIL_CONFIG,
  PHONE_CONFIG,
} from '../../common/constants/validation.constants';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(USERNAME_CONFIG.MIN_LENGTH, {
    message: USERNAME_CONFIG.MESSAGE,
  })
  @MaxLength(USERNAME_CONFIG.MAX_LENGTH, {
    message: USERNAME_CONFIG.MESSAGE,
  })
  @Matches(USERNAME_CONFIG.REGEX, {
    message: USERNAME_CONFIG.MESSAGE,
  })
  username: string;

  @IsEmail({}, { message: EMAIL_CONFIG.MESSAGE })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(EMAIL_CONFIG.MAX_LENGTH, {
    message: `Email must not exceed ${EMAIL_CONFIG.MAX_LENGTH} characters`,
  })
  email: string;

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

  @IsOptional()
  @IsString()
  @Matches(PHONE_CONFIG.REGEX, {
    message: PHONE_CONFIG.MESSAGE,
  })
  phone?: string;

  @IsInt()
  @IsNotEmpty({ message: 'Role ID is required' })
  role_id: number;
}
