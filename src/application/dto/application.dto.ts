import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { AgentStatus } from 'src/utils/enum';

export class AgentStatusDto {
  @IsEnum([AgentStatus.REJECTED, AgentStatus.ACTIVE], {
    message: `Invalid status`,
  })
  status: AgentStatus;

  @IsNumberString()
  id: number;

  @ValidateIf((d: AgentStatusDto) => d.status === AgentStatus.REJECTED)
  @IsString()
  @IsNotEmpty({ message: 'Reason is required' })
  reason?: string;
}

export class ApplicationFilterDto {
  @IsOptional()
  search?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
