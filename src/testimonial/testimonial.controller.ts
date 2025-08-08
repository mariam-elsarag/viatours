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
  Req,
  Query,
} from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { AcceptFormData } from 'src/common/decorators/accept-form-data.decorator';
import { currentUser, Roles } from 'src/auth/decorators/auth.decrators';
import { userRole } from 'src/utils/enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { JwtPayload } from 'src/utils/types';
import { User } from 'src/users/entities/user.entity';
import { Request } from 'express';
import { FilterTestimonialDto } from './dto/filter-testimonial.dto';

@Controller('/api/testimonial')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}
  // will change later only user who make booking can make testimnail and admin can add new one

  @Post()
  @Roles(userRole.ADMIN, userRole.User)
  @AcceptFormData()
  @UseGuards(AuthGuard)
  create(
    @Body() createTestimonialDto: CreateTestimonialDto,
    @currentUser() user: User,
  ) {
    return this.testimonialService.create(createTestimonialDto, user);
  }
  // random testimonials for landing
  @Get()
  randomTestimonials() {
    return this.testimonialService.radnomtestimonial();
  }

  // list for admin
  @Get('admin/list')
  @Roles(userRole.ADMIN)
  @UseGuards(AuthGuard)
  adminList(@Query() query: FilterTestimonialDto, @Req() req: Request) {
    return this.testimonialService.adminList(query, req);
  }

  @Get(':id')
  @Roles(userRole.ADMIN)
  @UseGuards(AuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.testimonialService.findOne(id);
  }

  @Patch(':id')
  @Roles(userRole.ADMIN)
  @UseGuards(AuthGuard)
  @AcceptFormData()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTestimonialDto,
  ) {
    return this.testimonialService.update(id, body);
  }

  @Delete(':id')
  @Roles(userRole.ADMIN)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.testimonialService.remove(id);
  }
}
