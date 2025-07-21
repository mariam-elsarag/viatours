import {
  BadRequestException,
  ForbiddenException,
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

import { AccountStatus, AgentStatus, userRole } from 'src/utils/enum';
import { MailService } from 'src/mail/mail.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { OtpQueryDto, SendOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { Agent } from 'src/agent/entities/agent.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailService,
  ) {}

  /**
   * Create new account
   * @param body (fullName,role is optional, email, password)
   * @returns message explain that otp has send to user email
   */
  async register(body: RegisterDto) {
    const { fullName, email, password, role, licenseNumber } = body;

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
    // create agent
    if (role === userRole.Agent) {
      const newAgent = this.agentRepository.create({
        userId: newUser.id,
        licenseNumber,
      });
      await this.agentRepository.save(newAgent);
    }

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
    const user = await this.checkUserExist(email);
    if (user.status === AccountStatus.Pending) {
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

    if (user.status === AccountStatus.Suspended) {
      throw new ForbiddenException(
        'Your account has been suspended. Please contact support for more information.',
      );
    }
    if (user.status === AccountStatus.Banned) {
      throw new ForbiddenException(
        'Your account has been permanently banned due to a violation of our terms.',
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
    // check if agent user try to login and he is not having permission to login
    if (user.role === userRole.Agent) {
      await this.checkAgentCanAccess(user.id);
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
    const user = await this.checkUserExist(email);
    if (user.role === userRole.Agent) {
      await this.checkAgentCanAccess(user.id);
    }
    const otp = await this.generateOtp(3, user);

    if (query.type === 'forget') {
      await this.mailerService.forgetPasswordEmail(email, user.fullName, otp);
    } else {
      await this.mailerService.activateAccountEmail(email, user.fullName, otp);
    }
    return { message: 'OTP sent successfully' };
  }

  /**
   * verify otp
   * @param body
   * @param query type (forget, activate) by default it work as activate
   * @returns message
   */
  async verifyOtp(body: VerifyOtpDto, query: OtpQueryDto) {
    const { email, otp } = body;
    // find this user
    const user = await this.checkUserExist(email);
    if (user.role === userRole.Agent) {
      await this.checkAgentCanAccess(user.id);
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
      user.isPasswordReset = true;
    } else {
      user.status = AccountStatus.Active;
      user.otpExpiredAt = null;
    }
    user.otp = null;
    await this.userRepository.save(user);
    return { message: 'OTP verified successfully' };
  }

  async resetPassword(body: LoginDto) {
    const { email, password } = body;
    const user = await this.checkUserExist(email);
    if (user.role === userRole.Agent) {
      await this.checkAgentCanAccess(user.id);
    }
    if (user.status === AccountStatus.Pending) {
      throw new BadRequestException(
        'Please activate your account before changing  password',
      );
    }
    if (!user.isPasswordReset && !user.otp) {
      throw new BadRequestException(
        'Please verify the OTP before changing your password',
      );
    }

    const hashPassword = await this.hashPassword(password);
    user.password = hashPassword;
    user.passwordChangedAt = new Date();
    user.isPasswordReset = false;
    await this.userRepository.save(user);
    return { message: 'Password changed successfully' };
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

  private async comparePassword(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
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

  private isOtpExpire(otpExpireAt: Date): boolean {
    return otpExpireAt.getTime() < Date.now();
  }

  private async checkUserExist(email: string) {
    //check if user exist
    const user = await this.userRepository.findOne({
      where: { email: email.toLocaleLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  private async checkAgentCanAccess(userId: number) {
    const agent = await this.agentRepository.findOne({
      where: { userId },
    });

    if (!agent) {
      throw new NotFoundException('Agent profile not found.');
    }

    switch (agent.status) {
      case AgentStatus.PENDING:
        throw new BadRequestException('Your account is pending approval.');
      case AgentStatus.SUSPENDED:
        throw new BadRequestException('Your account has been suspended.');
      case AgentStatus.REJECTED:
        throw new BadRequestException('Your account has been rejected.');
      case AgentStatus.ACTIVE:
        return agent;
      default:
        throw new BadRequestException('Your account status is invalid.');
    }
    return agent;
  }
}
