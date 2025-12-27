import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Role } from "@prisma/client";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>("roles", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role requirement
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { id?: string; role?: Role } | undefined;

    // Debug logging to trace role guard behavior
    // eslint-disable-next-line no-console
    console.log("[RolesGuard] canActivate", {
      url: request.url,
      requiredRoles,
      hasUser: !!user,
      userId: user?.id,
      userRole: user?.role,
    });

    if (!user) {
      // User should always be set by JwtAuthGuard before RolesGuard
      throw new ForbiddenException("Authentication required");
    }

    if (!requiredRoles.includes(user.role as Role)) {
      throw new ForbiddenException(
        `User role '${user.role}' is not allowed to access this resource`
      );
    }

    return true;
  }
}
