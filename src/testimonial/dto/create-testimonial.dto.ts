import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  @MaxLength(80)
  @IsOptional()
  @IsNotEmpty({ message: "Full name can't be empty" })
  fullName?: string;

  @IsString()
  @IsNotEmpty()
  testimonial: string;

  @IsString()
  @IsOptional()
  avatar?: string | null;

  @Type(() => Number)
  @IsIn([1, 2, 3, 4, 5])
  rate: number;
}
