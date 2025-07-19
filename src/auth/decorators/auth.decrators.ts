import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { CURETNT_USER_KEY } from 'src/utils/constant';
import { userRole } from 'src/utils/enum';

import { JwtPayload } from 'src/utils/types';

// currentUser parameter Decorator
export const currentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const user: JwtPayload = req[CURETNT_USER_KEY];
    return user;
  },
);

// Roles method decrator
export const Roles = (...roles: userRole[]) => SetMetadata('roles', roles);
