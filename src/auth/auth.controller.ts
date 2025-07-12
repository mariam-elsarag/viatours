import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AcceptFormData } from 'src/common/decorators/accept-form-data.decorator';
import { LoginDto } from './dto/login.dto';
import { OtpQueryDto, SendOtpDto, VerifyOtpDto } from './dto/otp.dto';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //Post:/api/auth/register
  @Post('register')
  @AcceptFormData()
  async createNewUser(@Body() body: RegisterDto) {
    console.log(body, 'body');
    return this.authService.register(body);
  }

  //Post:/api/auth/login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @AcceptFormData()
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  //Post/api/auth/send-otp
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @AcceptFormData()
  async sendOtp(@Body() body: SendOtpDto, @Query() query: OtpQueryDto) {
    return this.authService.sendOtp(body, query);
  }

  //Post:/api/auth/verify-otp
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @AcceptFormData()
  async verifyOtp(@Body() body: VerifyOtpDto, @Query() query: OtpQueryDto) {
    return this.authService.verifyOtp(body, query);
  }

  //Patch:/api/auth/reset-password
  @Patch('reset-password')
  @AcceptFormData()
  async resetPassword(@Body() body: LoginDto) {
    return this.authService.resetPassword(body);
  }
}
