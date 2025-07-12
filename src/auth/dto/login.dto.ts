import {
  IsEmail,
  MaxLength,
  IsStrongPassword,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
export class LoginDto {
  @IsEmail()
  @MaxLength(80)
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
export class LoginResponseDto {
  @Transform(({ obj }) => obj.id)
  userId: number;

  token: string;

  fullName: string;

  email: string;

  role: string;

  avatar: string | null;

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}
