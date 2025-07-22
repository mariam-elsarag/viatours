import { Exclude, Expose } from 'class-transformer';
import { UserResponseDto } from './user-response.dto';

@Exclude()
export class AgentResponseDto extends UserResponseDto {
  @Expose()
  companyName: string | null;

  @Expose()
  bio: string | null;

  @Expose()
  licenseNumber: string | null;

  constructor(partial: Partial<AgentResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
