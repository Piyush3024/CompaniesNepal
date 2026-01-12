import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { EMAIL_CONFIG } from '../../common/constants/validation.constants';

export class ForgotPasswordDto {
  @IsEmail({}, { message: EMAIL_CONFIG.MESSAGE })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(EMAIL_CONFIG.MAX_LENGTH, {
    message: `Email must not exceed ${EMAIL_CONFIG.MAX_LENGTH} characters`,
  })
  email: string;
}
