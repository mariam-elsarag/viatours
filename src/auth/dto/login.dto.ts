import {
  IsEmail,
  MaxLength,
  IsStrongPassword,
  IsNotEmpty,
} from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';
import { userRole } from 'src/utils/enum';
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

  @Expose()
  @Transform(
    ({ obj }) =>
      obj.role === userRole.Agent ? obj.agent?.companyName : undefined,
    { toPlainOnly: true },
  )
  companyName?: string;
  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}
