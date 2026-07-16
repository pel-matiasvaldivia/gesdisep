import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { MetodoVerificacion, Organismo, RequisitoEstado } from "@gesdisep/shared";
import { PrismaService } from "../prisma/prisma.service";
import { AdapterRegistry } from "./integration/adapter.registry";

@Injectable()
export class ValidacionService {
  constructor(
    private prisma: PrismaService,
    private registry: AdapterRegistry,
  ) {}

  /**
   * Ejecuta la verificación automática de todos los requisitos de un legajo
   * que tengan un organismo con adaptador disponible.
   */
  async verificarLegajo(legajoId: string) {
    const legajo = await this.prisma.legajo.findUnique({
      where: { id: legajoId },
      include: { prestador: true, requisitos: true },
    });
    if (!legajo) throw new NotFoundException("Legajo no encontrado");

    const resultados = [];
    for (const req of legajo.requisitos) {
      if (!req.organismo) continue;
      const organismo = req.organismo as Organismo;
      const adapter = this.registry.get(organismo);
      if (!adapter) continue; // sin adaptador → queda para verificación manual

      // El identificador depende del organismo: DNI para personas, CUIT para fiscales.
      const identificador =
        organismo === Organismo.RENAPER || organismo === Organismo.REINCIDENCIA
          ? (legajo.prestador.cuit.replace(/\D/g, "").slice(2, 10)) // proxy de DNI en el stub
          : legajo.prestador.cuit;

      const res = await adapter.verificar({
        identificador,
        extra: { tipoPersona: legajo.prestador.tipoPersona },
      });

      await this.prisma.verificacionExterna.create({
        data: {
          requisitoId: req.id,
          organismo,
          input: { identificador } as Prisma.InputJsonValue,
          output: res.datos as Prisma.InputJsonValue,
          resultado: res.resultado,
          fuente: res.fuente,
        },
      });

      const nuevoEstado =
        res.resultado === "OK"
          ? RequisitoEstado.VERIFICADO
          : res.resultado === "RECHAZO"
            ? RequisitoEstado.OBSERVADO
            : req.estado; // NO_DISPONIBLE/ERROR: no cambia, requiere revisión manual

      await this.prisma.requisito.update({
        where: { id: req.id },
        data: {
          estado: nuevoEstado,
          metodoVerificacion: MetodoVerificacion.AUTOMATICO,
          fuente: res.fuente,
          fechaVerificacion: new Date(),
          observacion:
            res.resultado === "RECHAZO" ? JSON.stringify(res.datos) : req.observacion,
        },
      });

      resultados.push({ codigo: req.codigo, organismo, resultado: res.resultado });
    }

    return { legajoId, verificados: resultados.length, resultados };
  }

  /** Verificación/carga manual de un requisito por parte de un analista. */
  async verificarManual(
    requisitoId: string,
    aprobado: boolean,
    fuente: string,
    observacion?: string,
  ) {
    const req = await this.prisma.requisito.findUnique({ where: { id: requisitoId } });
    if (!req) throw new NotFoundException("Requisito no encontrado");
    if (!fuente) throw new BadRequestException("Debe indicar la fuente de verificación");

    return this.prisma.requisito.update({
      where: { id: requisitoId },
      data: {
        estado: aprobado ? RequisitoEstado.VERIFICADO : RequisitoEstado.OBSERVADO,
        metodoVerificacion: MetodoVerificacion.MANUAL,
        fuente,
        observacion,
        fechaVerificacion: new Date(),
      },
    });
  }
}
