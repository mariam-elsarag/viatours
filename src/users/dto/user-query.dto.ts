import { IsEnum, IsOptional } from 'class-validator';
import { userRole } from 'src/utils/enum';

export class FilterUserListDto {
  @IsOptional()
  @IsEnum(userRole)
  role?: userRole;

  @IsOptional()
  search?: string | null;
}
