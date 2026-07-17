import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Rol } from "@gesdisep/shared";
import { DocumentosService, MAX_TAMANO_BYTES, ArchivoSubido } from "./documentos.service";
import { LegajosService } from "../legajos/legajos.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CurrentUser, AuthUser } from "../auth/current-user.decorator";

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentosController {
  constructor(
    private documentos: DocumentosService,
    private legajos: LegajosService,
  ) {}

  /** Sube la documentación digitalizada de un requisito (campo "archivo"). */
  @Post("legajos/:id/requisitos/:requisitoId/documentos")
  @Roles(Rol.EMPRESA, Rol.MESA_ENTRADAS, Rol.ANALISTA)
  @UseInterceptors(
    FileInterceptor("archivo", { limits: { fileSize: MAX_TAMANO_BYTES } }),
  )
  async subir(
    @Param("id") legajoId: string,
    @Param("requisitoId") requisitoId: string,
    @UploadedFile() archivo: ArchivoSubido,
    @CurrentUser() user: AuthUser,
  ) {
    await this.legajos.assertAcceso(user, legajoId);
    return this.documentos.subir(legajoId, requisitoId, archivo, user.id);
  }

  /** Descarga un documento (la empresa solo los propios). */
  @Get("documentos/:id/descargar")
  @Roles(
    Rol.EMPRESA,
    Rol.MESA_ENTRADAS,
    Rol.ANALISTA,
    Rol.INSPECTOR,
    Rol.DIRECTOR,
    Rol.AUDITOR,
    Rol.MINISTRO,
  )
  async descargar(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    // Response de Express, tipado mínimo para no depender de @types/express.
    @Res({ passthrough: true }) res: { set(headers: Record<string, string>): void },
  ) {
    const { contenido, nombre, mime } = await this.documentos.descargar(id, user);
    res.set({
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${nombre}"`,
    });
    return new StreamableFile(contenido);
  }
}
