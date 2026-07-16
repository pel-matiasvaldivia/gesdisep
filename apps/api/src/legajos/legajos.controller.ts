import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { transicionLegajoSchema, Rol, LegajoEstado } from "@gesdisep/shared";
import { z } from "zod";
import { LegajosService } from "./legajos.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CurrentUser, AuthUser } from "../auth/current-user.decorator";

const observarSchema = z.object({
  requisitos: z
    .array(z.object({ requisitoId: z.string(), observacion: z.string().min(1) }))
    .min(1),
});

@Controller("legajos")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LegajosController {
  constructor(private service: LegajosService) {}

  @Get(":id")
  @Roles(Rol.EMPRESA, Rol.MESA_ENTRADAS, Rol.ANALISTA, Rol.INSPECTOR, Rol.DIRECTOR, Rol.AUDITOR)
  obtener(@Param("id") id: string) {
    return this.service.obtener(id);
  }

  @Post(":id/transicion")
  @Roles(Rol.EMPRESA, Rol.MESA_ENTRADAS, Rol.ANALISTA, Rol.INSPECTOR, Rol.DIRECTOR)
  transicionar(@Param("id") id: string, @Body() body: unknown, @CurrentUser() user: AuthUser) {
    const dto = transicionLegajoSchema.parse(body);
    return this.service.transicionar(id, dto.hacia as LegajoEstado, user.id, dto.observacion);
  }

  @Post(":id/observar")
  @Roles(Rol.ANALISTA, Rol.INSPECTOR)
  observar(@Param("id") id: string, @Body() body: unknown, @CurrentUser() user: AuthUser) {
    const dto = observarSchema.parse(body);
    return this.service.observar(id, dto.requisitos, user.id);
  }
}
