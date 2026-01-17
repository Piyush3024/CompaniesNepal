import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ROLE_NAME_CONFIG } from '../constants/role.constants';

export class CreateRoleDto {
  @IsString()
  @MinLength(ROLE_NAME_CONFIG.MIN_LENGTH)
  @MaxLength(ROLE_NAME_CONFIG.MAX_LENGTH)
  @Matches(ROLE_NAME_CONFIG.REGEX, {
    message: ROLE_NAME_CONFIG.MESSAGE,
  })
  name: string;
}
