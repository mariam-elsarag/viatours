import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { QueryLocationDto } from './dto/query-location.dto';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}
@Injectable()
export class LocationService {
  constructor(private readonly httpService: HttpService) {}
  create(createLocationDto: CreateLocationDto) {
    return 'This action adds a new location';
  }

  async findOne(query: QueryLocationDto) {
    const { lat, lng } = query;
    try {
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/reverse',
        {
          params: {
            lat,
            lon: lng,
            format: 'json',
          },
          headers: {
            'User-Agent': 'viatours-app',
          },
        },
      );

      return {
        address: response.data.display_name,
        country: response.data.address.country,
        city: response.data.address.city,
      };
    } catch (error) {
      console.log(error);
      new BadRequestException('Failed to fetch location from Nominatim');
    }
  }

  update(id: number, updateLocationDto: UpdateLocationDto) {
    return `This action updates a #${id} location`;
  }
}
