import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  Length,
} from 'class-validator';

export class SendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}

export class OtpQueryDto {
  @IsEnum(['activate', 'forget'])
  @IsOptional()
  type?: string;
}
