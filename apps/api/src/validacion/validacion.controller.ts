import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { Rol } from "@gesdisep/shared";
import { ValidacionService } from "./validacion.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

const manualSchema = z.object({
  aprobado: z.boolean(),
  fuente: z.string().min(1),
  observacion: z.string().optional(),
});

@Controller("validacion")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ValidacionController {
  constructor(private service: ValidacionService) {}

  /** Dispara la verificación automática de todos los requisitos del legajo. */
  @Post("legajos/:id/verificar")
  @Roles(Rol.ANALISTA, Rol.MESA_ENTRADAS)
  verificar(@Param("id") id: string) {
    return this.service.verificarLegajo(id);
  }

  /** Verificación manual de un requisito puntual. */
  @Post("requisitos/:id/manual")
  @Roles(Rol.ANALISTA, Rol.INSPECTOR)
  manual(@Param("id") id: string, @Body() body: unknown) {
    const dto = manualSchema.parse(body);
    return this.service.verificarManual(id, dto.aprobado, dto.fuente, dto.observacion);
  }
}
