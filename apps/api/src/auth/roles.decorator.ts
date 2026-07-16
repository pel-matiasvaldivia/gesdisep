import { SetMetadata } from "@nestjs/common";
import { Rol } from "@gesdisep/shared";

export const ROLES_KEY = "roles";
/** Restringe un endpoint a los roles indicados. */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
