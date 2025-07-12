import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

export const AcceptFormData = () => {
  return applyDecorators(UseInterceptors(AnyFilesInterceptor()));
};
