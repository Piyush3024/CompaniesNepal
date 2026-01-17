import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { STATUS_NAME_CONFIG } from '../constants/status.constants';

export class CreateStatusDto {
  @IsString()
  @MinLength(STATUS_NAME_CONFIG.MIN_LENGTH)
  @MaxLength(STATUS_NAME_CONFIG.MAX_LENGTH)
  @Matches(STATUS_NAME_CONFIG.REGEX, {
    message: STATUS_NAME_CONFIG.MESSAGE,
  })
  name: string;
}
