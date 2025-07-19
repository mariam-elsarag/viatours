import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { User } from 'src/users/entities/user.entity';
import { CURETNT_USER_KEY } from 'src/utils/constant';
import { AccountStatus, userRole } from 'src/utils/enum';
import { JwtReturnTypePayload } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflactor: Reflector,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles: userRole[] = this.reflactor.getAllAndOverride<userRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    const req: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('Access denied. No token provided.');
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtReturnTypePayload>(
        token,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );

      const user = await this.userRepository.findOne({
        where: { id: payload.id },
      });

      // check if user exist
      if (!user) {
        throw new UnauthorizedException('User not found.');
      }
      //check if user activate account
      if (user.status === AccountStatus.Pending) {
        throw new UnauthorizedException(
          'Your account is not active. Please verify your account first.',
        );
      }
      if (user.status === AccountStatus.Suspended) {
        throw new UnauthorizedException(
          'Your account has been suspended. Please contact support for more information.',
        );
      }
      if (user.status === AccountStatus.Banned) {
        throw new UnauthorizedException(
          'Your account has been permanently banned due to a violation of our terms.',
        );
      }
      // check password change after change IAT
      if (this.isTokenBeforePasswordChange(user, payload.iat)) {
        throw new UnauthorizedException('Invalid or expired token.');
      }

      // check if this endpoint has authorization if yes and role if user not equal to type we want we will have exception
      if (roles && roles.length > 0 && !roles.includes(user.role)) {
        throw new UnauthorizedException(
          'You are not allowed to perform this action.',
        );
      }
      req[CURETNT_USER_KEY] = user;
      return true;
    } catch (error) {
      console.error('AuthGuard error:', error);
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError' ||
        error.name === 'NotBeforeError'
      ) {
        throw new UnauthorizedException('Invalid or expired token.');
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed.');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isTokenBeforePasswordChange(user: User, iat: number): boolean {
    if (!user.passwordChangedAt) {
      return false;
    }
    return (
      user.passwordChangedAt &&
      Math.floor(new Date(user.passwordChangedAt).getTime() / 1000) > iat
    );
  }
}
