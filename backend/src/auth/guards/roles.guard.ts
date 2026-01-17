import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';
import { UserWithRole } from '../types/user-with-role.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, allow access
    }

    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as UserWithRole;

    if (!user || !user.role || !user.role.name) {
      throw new ForbiddenException(
        'You are not allowed to access this resource',
      );
    }

    const hasRole = requiredRoles.includes(user.role.name.toLowerCase());

    if (!hasRole) {
      throw new ForbiddenException(
        'You are not allowed to access this resource',
      );
    }

    return true;
  }
}
