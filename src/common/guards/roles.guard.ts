import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../../app.constants";
import { RolesEnum } from "../enum";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException(
        "Sizda ushbu amalni bajarish uchun ruxsat yo'q (Rol topilmadi)"
      );
    }

    const hasPermission = requiredRoles.includes(user.role);

    if (!hasPermission) {
      throw new ForbiddenException(
        "Sizning huquqingiz ushbu amalga yetarli emas"
      );
    }

    return true;
  }
}
