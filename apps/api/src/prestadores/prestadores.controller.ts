import { Body, Controller, Get, Param, Post, Delete, UseGuards } from "@nestjs/common";
import { crearPrestadorSchema, Rol } from "@gesdisep/shared";
import { PrestadoresService } from "./prestadores.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CurrentUser, AuthUser } from "../auth/current-user.decorator";

@Controller("prestadores")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrestadoresController {
  constructor(private service: PrestadoresService) {}

  @Post()
  @Roles(Rol.EMPRESA, Rol.MESA_ENTRADAS)
  crear(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    const dto = crearPrestadorSchema.parse(body);
    return this.service.crear(dto, user.id);
  }

  @Get()
  @Roles(Rol.MESA_ENTRADAS, Rol.ANALISTA, Rol.DIRECTOR, Rol.AUDITOR)
  listar() {
    return this.service.listar();
  }

  @Get(":id")
  @Roles(Rol.EMPRESA, Rol.MESA_ENTRADAS, Rol.ANALISTA, Rol.INSPECTOR, Rol.DIRECTOR, Rol.AUDITOR)
  obtener(@Param("id") id: string) {
    return this.service.obtener(id);
  }

  @Delete(":id")
  @Roles(Rol.DIRECTOR)
  baja(@Param("id") id: string) {
    return this.service.baja(id);
  }
}
