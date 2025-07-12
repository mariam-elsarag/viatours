import { userRole } from 'src/utils/enum';
import {
  IsEmail,
  IsString,
  IsEnum,
  MaxLength,
  IsStrongPassword,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MaxLength(80)
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @MaxLength(80)
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @IsEnum([userRole.User, userRole.Agent], { message: 'Invalid role' })
  @IsOptional()
  role?: userRole.User | userRole.Agent;
}
