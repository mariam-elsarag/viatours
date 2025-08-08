import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { User } from './users/entities/user.entity';
import { MailModule } from './mail/mail.module';

import { LocationModule } from './location/location.module';
import { Agent } from './users/entities/agent.entity';
import { Location } from './location/entities/location.entity';
import { AdminModule } from './admin/admin.module';
import { ApplicationModule } from './application/application.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { Testimonial } from './testimonial/entities/testimonial.entity';
@Module({
  imports: [
    AuthModule,
    UsersModule,
    MailModule,
    LocationModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          global: true,
          secret: config.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: config.get<string>('JWT_EXPIRE_IN') },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          database: config.get<string>('DB_DATABASE'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          port: config.get<number>('DB_PORT'),
          host: 'localhost',
          synchronize: process.env.NODE_ENV !== 'producation' ? true : false,
          entities: [User, Agent, Location, Testimonial],
        };
      },
    }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    LocationModule,

    AdminModule,

    ApplicationModule,

    TestimonialModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
