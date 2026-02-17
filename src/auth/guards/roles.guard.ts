import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppRole } from '../../common/types/role.type';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const guardsEnabled =
      this.configService.get<string>('AUTH_GUARDS_ENABLED') === 'true';

    if (!guardsEnabled) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: AppRole } | undefined;

    if (!user?.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have enough permissions');
    }

    return true;
  }
}
