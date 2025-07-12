import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'src/utils/types';
import { RegisterDto } from './dto/register.dto';

import { userRole } from 'src/utils/enum';
import { MailService } from 'src/mail/mail.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { OtpQueryDto, SendOtpDto, VerifyOtpDto } from './dto/otp.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailService,
  ) {}

  /**
   * Create new account
   * @param body (fullName,role is optional, email, password)
   * @returns message explain that otp has send to user email
   */
  async register(body: RegisterDto) {
    const { fullName, email, password, role } = body;

    // check user exist
    const user = await this.userRepository.findOne({
      where: { email: email.toLocaleLowerCase() },
    });

    if (user) {
      throw new BadRequestException({
        message: 'Email already exists',
        error: { email: 'Email already exists' },
      });
    }
    const hashedPassword = await this.hashPassword(password);
    let newUser = this.userRepository.create({
      fullName,
      email,
      password: hashedPassword,
      role: role ?? userRole.User,
    });

    newUser = await this.userRepository.save(newUser);

    // for activate account
    const otp = await this.generateOtp(3, newUser);
    await this.mailerService.activateAccountEmail(email, fullName, otp);

    return {
      message:
        'Registration successful. We’ve sent an activation code to your email to activate your account.',
      email: newUser.email,
    };
  }
  /**
   * Login
   * @param body
   * @returns
   */
  async login(body: LoginDto) {
    const { email, password } = body;
    //check if user exist
    const user = await this.userRepository.findOne({
      where: { email: email.toLocaleLowerCase() },
    });

    if (!user) {
      throw new BadRequestException(
        'The email or password you entered is incorrect.',
      );
    }
    if (!user.isActive) {
      if (user.otpExpiredAt && this.isOtpExpire(user.otpExpiredAt)) {
        const otp = await this.generateOtp(3, user);
        await this.mailerService.activateAccountEmail(
          email,
          user.fullName,
          otp,
        );
      }
      throw new BadRequestException(
        'Your account is not active. Please verify your account first. An OTP has been sent to your email for verification.',
      );
    }
    // check password right
    if (
      user.password &&
      !(await this.comparePassword(password, user.password))
    ) {
      throw new BadRequestException(
        'The email or password you entered is incorrect.',
      );
    }

    const payload: JwtPayload = { id: user.id, role: user.role };
    const token = await this.generateJwtToken(payload);

    return new LoginResponseDto({ ...user, token });
  }

  /**
   * Send otp
   * @param body email
   * @param query type (forget, activate) by default it work as activate
   * @returns message
   */
  async sendOtp(body: SendOtpDto, query: OtpQueryDto) {
    const { email } = body;
    //check if user exist
    const user = await this.userRepository.findOne({
      where: { email: email.toLocaleLowerCase() },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = await this.generateOtp(3, user);

    if (query.type === 'forget') {
      await this.mailerService.forgetPasswordEmail(email, user.fullName, otp);
    } else {
      await this.mailerService.activateAccountEmail(email, user.fullName, otp);
    }
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(body: VerifyOtpDto, query: OtpQueryDto) {
    const { email, otp } = body;
    // find this user
    const user = await this.userRepository.findOne({
      where: { email: email.toLocaleLowerCase() },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // check if he has no otp
    if (!user.otp || !user.otpExpiredAt) {
      throw new BadRequestException('No OTP was generated for this user');
    }
    // check expire
    if (this.isOtpExpire(user.otpExpiredAt)) {
      throw new BadRequestException('OTP expired');
    }
    //check is it a valid otp
    if (!(await this.comparePassword(otp, user.otp))) {
      throw new BadRequestException('Invalid Otp');
    }

    if (query.type === 'forget') {
      user.isForgetPassword = true;
    } else {
      user.isActive = true;
      user.otpExpiredAt = null;
    }
    user.otp = null;
    await this.userRepository.save(user);
    return { message: 'OTP verified successfully' };
  }
  /**
   * Hash password
   * @param password
   * @returns new hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Generate jwt token
   * @param payload (id, and role)
   * @returns token
   */
  private async generateJwtToken(payload: JwtPayload): Promise<string> {
    return await this.jwtService.signAsync(payload);
  }

  /**
   * Generate Otp
   * @param expire Otp expiration Minutes
   * @param user
   * @returns Otp
   */
  private async generateOtp(expire: number, user: User): Promise<string> {
    const otp = Math.floor(Math.random() * 900000 + 100000).toString();
    const hashedOtp = await this.hashPassword(otp);
    user.otp = hashedOtp;
    user.otpExpiredAt = new Date(Date.now() + expire * 60 * 1000);
    await this.userRepository.save(user);
    return otp;
  }

  private async comparePassword(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
  }

  private isOtpExpire(otpExpireAt: Date): boolean {
    return otpExpireAt.getTime() < Date.now();
  }
}
