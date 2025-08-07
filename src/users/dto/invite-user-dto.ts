import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { userRole } from 'src/utils/enum';

export class InviteUserDto {
  @IsString()
  @MaxLength(80)
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  email: string;

  @IsEnum(userRole, { message: 'Invalid role' })
  @IsOptional()
  role?: userRole;

  @ValidateIf((o) => o.role === userRole.Agent)
  @IsString()
  @MaxLength(20)
  @IsNotEmpty({ message: 'License number is required for agents.' })
  licenseNumber: string;

  @ValidateIf((o) => o.role === userRole.Agent)
  @IsString()
  @MaxLength(80)
  companyName: string;
}
