import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { JwtPayload } from 'src/utils/types';
import { userRole } from 'src/utils/enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { NotFoundError } from 'rxjs';
import { FilterTestimonialDto } from './dto/filter-testimonial.dto';
import { Request } from 'express';
import { FullPaginationDto } from 'src/common/pagination/pagination.dto';

@Injectable()
export class TestimonialService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialsRespository: Repository<Testimonial>,
  ) {}

  async create(body: CreateTestimonialDto, user: User) {
    const { role, fullName: userFullName, avatar: userAvatar } = user;
    const { fullName, testimonial, avatar, rate } = body;

    const newTestimonial: Partial<Testimonial> = {
      testimonial,
      rate,
      avatar: avatar ?? null,
    };

    if (role === userRole.ADMIN) {
      if (!fullName) {
        throw new BadRequestException({
          message: 'Full name is required',
          error: { fullName: 'Full name is required' },
        });
      }
      newTestimonial.fullName = fullName;
    } else {
      newTestimonial.fullName = userFullName;
      newTestimonial.avatar = userAvatar;
    }

    await this.testimonialsRespository.save(newTestimonial);
    return newTestimonial;
  }

  async radnomtestimonial() {
    const testimonials = await this.testimonialsRespository
      .createQueryBuilder('testimonial')
      .orderBy('RANDOM()')
      .limit(6)
      .getMany();

    return testimonials;
  }
  async adminList(query: FilterTestimonialDto, req: Request) {
    const { search, page = '1', limit = '10' } = query ?? {};
    const currentPage = parseInt(page, 10);
    const take = parseInt(limit, 10);
    const skip = (currentPage - 1) * take;

    const qb = this.testimonialsRespository.createQueryBuilder('testimonial');
    if (search) {
      qb.andWhere('(user.fullName ILIKE :search )', {
        search: `%${search}%`,
      });
    }
    const [results, count] = await qb
      .orderBy('testimonial.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return new FullPaginationDto(currentPage, count, take, req, results);
  }

  async findOne(id: number) {
    const testimonial = await this.testimonialsRespository.findOneBy({ id });
    if (!testimonial) {
      throw new NotFoundError('Testimonial not found');
    } else {
      return testimonial;
    }
  }

  async update(id: number, body: UpdateTestimonialDto) {
    const testimonial = await this.findOne(id);
    console.log(body, 'body');
    if (body) {
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined) {
          testimonial[key] = value;
        }
      });
      await this.testimonialsRespository.save(testimonial);
    }
    return testimonial;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.testimonialsRespository.delete(id);
  }
}
