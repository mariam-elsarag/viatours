import { Exclude, Expose } from 'class-transformer';
import { userRole } from 'src/utils/enum';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  role: userRole;

  password: string | null;
  passwordChangedAt: Date | null;

  userId: number;

  @Expose()
  avatar: string | null;

  @Expose()
  address: string | null;

  @Expose()
  createdAt: Date;
  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
