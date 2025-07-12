import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionsFilter } from './common/fillters/http-exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // to return error the way i want
  app.useGlobalFilters(new GlobalExceptionsFilter());
  // for validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      transform: true,

      exceptionFactory: (validationErrors = []) => {
        // if you wanna show array of join messages
        // const errors: Record<string, string[]> = {};
        const errors: Record<string, string> = {};

        for (const error of validationErrors) {
          if (error.constraints) {
            // only show fist message
            errors[error.property] = Object.values(error.constraints)[0];
          }
        }

        return new BadRequestException({
          message: 'Validation failed',
          error: errors,
        });
      },
    }),
  );
  // this for security header
  app.use(helmet());
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
