import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { QueryLocationDto } from './dto/query-location.dto';
import { HttpService } from '@nestjs/axios';
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
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not defined');
    }

    const { lat, lng } = query;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;

    const { data } = await this.httpService.axiosRef.get(url);
    console.log('GOOGLE_API_KEY:', GOOGLE_API_KEY);
    console.log('Google API response:', JSON.stringify(data, null, 2));

    if (!data?.results?.length) {
      throw new BadRequestException(
        'No results found for the provided coordinates.',
      );
    }
    console.log(data, 'd');

    const components: AddressComponent[] = data.results[0].address_components;

    const street =
      components.find((c) => c.types.includes('route'))?.long_name || null;
    const city =
      components.find((c) => c.types.includes('locality'))?.long_name || null;
    const country =
      components.find((c) => c.types.includes('country'))?.long_name || null;

    return {
      street,
      city,
      country,
      fullAddress: data.results[0].formatted_address,
    };
  }

  update(id: number, updateLocationDto: UpdateLocationDto) {
    return `This action updates a #${id} location`;
  }
}
