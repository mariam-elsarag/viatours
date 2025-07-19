import { Type } from 'class-transformer';
import { IsNumber, IsDefined } from 'class-validator';

export class QueryLocationDto {
  @IsDefined({ message: 'lat is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'lat must be a number' })
  lat: number;

  @IsDefined({ message: 'lng is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'lng must be a number' })
  lng: number;
}
