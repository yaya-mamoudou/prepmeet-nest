import { UserRole } from './enum';

export type JwtContent = {
  uid: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
};
