import { userRole } from 'src/utils/enum';
import {
  IsEmail,
  IsString,
  IsEnum,
  MaxLength,
  IsStrongPassword,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MaxLength(80)
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @IsEnum([userRole.User, userRole.Agent], { message: 'Invalid role' })
  @IsOptional()
  role?: userRole.User | userRole.Agent;

  @ValidateIf((o) => o.role === userRole.Agent)
  @IsString()
  @MaxLength(20)
  @IsNotEmpty({ message: 'License number is required for agents.' })
  licenseNumber: string;
}
