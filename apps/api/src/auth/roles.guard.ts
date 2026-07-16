import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Rol } from "@gesdisep/shared";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    const roles: string[] = user?.roles ?? [];
    // ADMIN puede todo.
    if (roles.includes(Rol.ADMIN)) return true;
    const ok = required.some((r) => roles.includes(r));
    if (!ok) {
      throw new ForbiddenException("No tiene permisos para esta operación");
    }
    return true;
  }
}
