import { user, role } from '@prisma/client';

export type UserWithRole = user & {
  role: role;
};
