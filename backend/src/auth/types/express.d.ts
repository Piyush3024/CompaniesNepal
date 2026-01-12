import { UserWithRole } from './user-with-role.type';

declare global {
  namespace Express {
    interface Request {
      user?: UserWithRole;
    }
  }
}
