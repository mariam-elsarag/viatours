import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from 'src/users/entities/agent.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [TypeOrmModule.forFeature([Agent]), UsersModule],
})
export class AdminModule {}
