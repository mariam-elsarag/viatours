import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { Roles } from 'src/auth/decorators/auth.decrators';
import { userRole } from 'src/utils/enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AgentStatusDto, ApplicationFilterDto } from './dto/application.dto';
import { Request } from 'express';
import { AcceptFormData } from 'src/common/decorators/accept-form-data.decorator';

@Controller('/api/application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  @Roles(userRole.ADMIN)
  @UseGuards(AuthGuard)
  getAllApplications(
    @Query() query: ApplicationFilterDto,
    @Req() req: Request,
  ) {
    return this.applicationService.findAll(query, req);
  }

  @Patch()
  @Roles(userRole.ADMIN)
  @UseGuards(AuthGuard)
  @AcceptFormData()
  agentStatus(@Body() body: AgentStatusDto) {
    return this.applicationService.agentStatus(body);
  }
}
