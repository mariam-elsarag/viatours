import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { Agent } from './entities/agent.entity';
import { UpdateProfileDto } from './dto/update-user.dto';
import { JwtPayload } from 'src/utils/types';
import { UserResponseDto } from './dto/user-response.dto';
import { AccountStatus, AgentStatus, userRole } from 'src/utils/enum';
import { AgentResponseDto } from './dto/agent-response.dto';
import { FilterUserListDto } from './dto/user-query.dto';
import { FullPaginationDto } from 'src/common/pagination/pagination.dto';
import { Request } from 'express';
import { InviteUserDto } from './dto/invite-user-dto';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    private readonly authService: AuthService,
    private readonly mailerService: MailService,
  ) {}

  async findOneUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UserResponseDto(user);
  }
  async findOneAgent(id: number) {
    const agent = await this.agentRepository.findOneBy({ id });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return { ...agent };
  }
  /**
   * Get profile data
   * @param id user id
   * @returns
   */
  async getUserDetails(id: number) {
    const user = await this.findOneUser(id);

    if (user.role === userRole.Agent) {
      const agent = await this.findOneAgent(user.userId);

      return new AgentResponseDto({
        ...user,
        companyName: agent?.companyName || null,
        bio: agent?.bio || null,
        licenseNumber: agent?.licenseNumber || null,
      });
    }

    return new UserResponseDto(user);
  }

  async findAllUsers(query: FilterUserListDto, req: Request) {
    const { role, search, page = '1', limit = '10' } = query ?? {};
    const currentPage = parseInt(page, 10);
    const take = parseInt(limit, 10);
    const skip = (currentPage - 1) * take;

    const qb = this.userRepository.createQueryBuilder('user');

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (search) {
      qb.andWhere('(user.fullName ILIKE :search OR user.email ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    const [results, count] = await qb
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();
    const data = results?.map((item) => {
      return new UserResponseDto(item);
    });
    return new FullPaginationDto(currentPage, count, take, req, data);
  }

  async updateProfile(body: UpdateProfileDto, payload: JwtPayload) {
    const { id, role } = payload;
    const user = await this.findOneUser(id);
    if (user.id === id || role === userRole.ADMIN) {
      user.fullName = body?.fullName ?? user?.fullName;
      user.address = body?.address ?? user?.address;

      await this.userRepository.save(user);
      if (user.role === userRole.Agent) {
        const agent = await this.findOneAgent(user.userId);
        agent.companyName = body?.companyName ?? agent.companyName;
        agent.bio = body?.bio ?? agent.bio;
        await this.agentRepository.save(agent);
        return new AgentResponseDto({
          ...user,
          companyName: agent?.companyName || null,
          bio: agent?.bio || null,
          licenseNumber: agent?.licenseNumber || null,
        });
      }

      return new UserResponseDto(user);
    } else {
      throw new ForbiddenException(
        'Access denied,you are not allow to preform this action',
      );
    }
  }

  async remove(payload: JwtPayload) {
    const { id, role } = payload;
    const user = await this.findOneUser(id);
    if (user.id === id || role === userRole.ADMIN) {
      await this.userRepository.delete(id);
      return { message: 'Successfully delete account' };
    } else {
      throw new ForbiddenException(
        'Access denied,you are not allow to preform this action',
      );
    }
  }

  // invite user
  async inviteUser(body: InviteUserDto) {
    const { fullName, email, role, licenseNumber, companyName } = body;
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
    let newUser = this.userRepository.create({
      fullName,
      email,
      role: role ?? userRole.User,
      status: AccountStatus.Active,
    });
    newUser = await this.userRepository.save(newUser);

    if (role === userRole.Agent) {
      const newAgent = this.agentRepository.create({
        userId: newUser.id,
        licenseNumber,
        companyName,
        status: AgentStatus.ACTIVE,
      });
      await this.agentRepository.save(newAgent);
    }
    // for activate account
    const otp = await this.authService.generateOtp(3, newUser);
    await this.mailerService.inviteUserEmail(email, fullName, otp, 3);
    return {
      message:
        "Invitation successful. We've sent an invitation code to your email to activate your account.",
    };
  }
}
