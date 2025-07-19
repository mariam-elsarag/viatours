import { userRole } from './enum';

export type JwtPayload = {
  id: number;
  role: userRole;
};

export type JwtReturnTypePayload = {
  id: number;
  role: string;
  iat: number;
};
