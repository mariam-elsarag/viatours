import {
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
import { userRole } from 'src/utils/enum';
import { AgentResponseDto } from './dto/agent-response.dto';
import { FilterUserListDto } from './dto/user-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
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

  async findAllUsers(query?: FilterUserListDto) {
    const { role, search } = query ?? {};

    const qb = this.userRepository.createQueryBuilder('user');

    if (role) {
      qb.andWhere('user.role = :role', { role: role });
    }

    if (search) {
      qb.andWhere('(user.fullName ILIKE :search OR user.email ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    return qb.orderBy('user.createdAt', 'DESC').getMany();
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
}
