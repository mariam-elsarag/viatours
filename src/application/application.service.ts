import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Agent } from 'src/users/entities/agent.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { AgentStatusDto, ApplicationFilterDto } from './dto/application.dto';
import { MailService } from 'src/mail/mail.service';
import { AgentStatus } from 'src/utils/enum';
import { User } from 'src/users/entities/user.entity';
import { FullPaginationDto } from 'src/common/pagination/pagination.dto';
import { Request } from 'express';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly userService: UsersService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Toggle application status
   * @param body
   */
  async agentStatus(body: AgentStatusDto) {
    const { status, id } = body;
    const agent = await this.userService.findOneAgent(id);
    const user = await this.userService.findOneUser(agent.userId);
    if (agent.status !== status) {
      if (status === AgentStatus.ACTIVE) {
        await this.mailService.approveAgent(user.email, user.fullName);
      } else if (status === AgentStatus.REJECTED) {
        const reason = body.reason ?? '';

        await this.mailService.rejectAgent(user.email, user.fullName, reason);
      }
      agent.status = status;
      await this.agentRepository.save(agent);
    }
    return { message: `Successfully ${status} agent account` };
  }

  async findAll(query: ApplicationFilterDto, req: Request) {
    const { search, page = '1', limit = '10' } = query ?? {};

    const currentPage = parseInt(page, 10);
    const take = parseInt(limit, 10);
    const skip = (currentPage - 1) * take;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.agent', 'agent');

    qb.andWhere('agent.status = :status', { status: AgentStatus.PENDING });

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
      return {
        id: item.agent.id,
        fullName: item.fullName,
        email: item.email,
        licenseNumber: item.agent.licenseNumber,
        status: item.agent.status,
        attachment: item.agent.attachment,
      };
    });

    return new FullPaginationDto(currentPage, count, take, req, data);
  }
}
