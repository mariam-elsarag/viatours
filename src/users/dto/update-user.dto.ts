import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { userRole } from 'src/utils/enum';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @IsNotEmpty()
  fullName?: string;

  @IsOptional()
  avatar?: string;

  @ValidateIf((o) => o.role === userRole.Agent)
  @IsString()
  @MaxLength(80)
  companyName?: string;

  @ValidateIf((o) => o.role === userRole.Agent)
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
