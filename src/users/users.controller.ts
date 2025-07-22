import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UpdateProfileDto } from './dto/update-user.dto';
import { currentUser, Roles } from 'src/auth/decorators/auth.decrators';
import { JwtPayload } from 'src/utils/types';
import { AcceptFormData } from 'src/common/decorators/accept-form-data.decorator';
import { userRole } from 'src/utils/enum';

@Controller('/api/user/')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // User profile
  @Get()
  @UseGuards(AuthGuard)
  getProfileData(@currentUser() payload: JwtPayload) {
    return this.usersService.getUserDetails(payload.id);
  }

  // public profile
  @Get(':id')
  getPublicProfileData(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserDetails(id);
  }

  @Patch()
  @AcceptFormData()
  @UseGuards(AuthGuard)
  updateProfile(
    @Body() body: UpdateProfileDto,
    @currentUser() payload: JwtPayload,
  ) {
    return this.usersService.updateProfile(body, payload);
  }

  @Delete()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAccount(@currentUser() payload: JwtPayload) {
    return this.usersService.remove(payload);
  }
  // Delete by admin
  @Delete('/admin/:id')
  @Roles(userRole.ADMIN)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUserAccount(
    @Param('id', ParseIntPipe) id: number,
    @currentUser() payload: JwtPayload,
  ) {
    return this.usersService.remove({ id, role: payload.role });
  }
}
