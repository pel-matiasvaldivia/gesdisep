import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { CredencialTipo, Rol } from "@gesdisep/shared";
import { CredencialesService } from "./credenciales.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

const emitirSchema = z.object({
  personaId: z.string().min(1),
  tipo: z.nativeEnum(CredencialTipo),
});

@Controller("credenciales")
export class CredencialesController {
  constructor(private service: CredencialesService) {}

  /** Emisión de credencial (solo la Dirección). */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.DIRECTOR)
  emitir(@Body() body: unknown) {
    const dto = emitirSchema.parse(body);
    return this.service.emitir(dto.personaId, dto.tipo);
  }

  /** Verificación pública por QR — endpoint abierto, sin autenticación. */
  @Get("verificar/:token")
  verificar(@Param("token") token: string) {
    return this.service.verificarPublico(token);
  }
}
