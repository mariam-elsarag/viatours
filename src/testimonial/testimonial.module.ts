import { Module } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { TestimonialController } from './testimonial.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Testimonial } from './entities/testimonial.entity';

@Module({
  controllers: [TestimonialController],
  providers: [TestimonialService],
  imports: [TypeOrmModule.forFeature([User, Testimonial])],
})
export class TestimonialModule {}
