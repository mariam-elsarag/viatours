import { userRole } from './enum';

export type JwtPayload = {
  id: number;
  role: userRole;
};
