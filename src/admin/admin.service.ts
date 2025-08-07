import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Agent } from 'src/users/entities/agent.entity';
import { Repository } from 'typeorm';
import { AgentStatusDto } from '../application/dto/application.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    private readonly userService: UsersService,
  ) {}
}
