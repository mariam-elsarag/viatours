import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from 'src/users/entities/agent.entity';
import { UsersModule } from 'src/users/users.module';
import { MailModule } from 'src/mail/mail.module';
import { User } from 'src/users/entities/user.entity';

@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService],
  imports: [TypeOrmModule.forFeature([Agent, User]), UsersModule, MailModule],
})
export class ApplicationModule {}
