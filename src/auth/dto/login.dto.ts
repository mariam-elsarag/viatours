import {
  IsEmail,
  MaxLength,
  IsStrongPassword,
  IsNotEmpty,
} from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';
export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}

@Exclude()
export class LoginResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.id)
  userId: number;

  @Expose()
  token: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  avatar: string | null;

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}
