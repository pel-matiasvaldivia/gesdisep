import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  LegajoEstado,
  RequisitoEstado,
  puedeTransicionar,
} from "@gesdisep/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LegajosService {
  constructor(private prisma: PrismaService) {}

  async obtener(id: string) {
    const legajo = await this.prisma.legajo.findUnique({
      where: { id },
      include: {
        prestador: true,
        requisitos: { include: { documentos: true, verificaciones: true } },
        historial: { orderBy: { createdAt: "asc" } },
        resoluciones: true,
      },
    });
    if (!legajo) throw new NotFoundException("Legajo no encontrado");
    return legajo;
  }

  /**
   * Transiciona un legajo a un nuevo estado validando la máquina de estados
   * y las precondiciones de negocio de cada etapa.
   */
  async transicionar(
    id: string,
    hacia: LegajoEstado,
    actorId?: string,
    observacion?: string,
  ) {
    const legajo = await this.prisma.legajo.findUnique({
      where: { id },
      include: { requisitos: true },
    });
    if (!legajo) throw new NotFoundException("Legajo no encontrado");

    const desde = legajo.estado as LegajoEstado;
    if (!puedeTransicionar(desde, hacia)) {
      throw new BadRequestException(
        `Transición no permitida: ${desde} → ${hacia}`,
      );
    }

    // Precondiciones por etapa.
    if (hacia === LegajoEstado.PRESENTADA) {
      const faltantes = legajo.requisitos.filter(
        (r) => r.obligatorio && r.estado === RequisitoEstado.PENDIENTE,
      );
      if (faltantes.length > 0) {
        throw new BadRequestException(
          `Faltan cargar ${faltantes.length} requisitos obligatorios`,
        );
      }
    }

    if (hacia === LegajoEstado.EN_APROBACION) {
      const noVerificados = legajo.requisitos.filter(
        (r) => r.obligatorio && r.estado !== RequisitoEstado.VERIFICADO,
      );
      if (noVerificados.length > 0) {
        throw new BadRequestException(
          `No se puede elevar a aprobación: ${noVerificados.length} requisitos obligatorios sin verificar`,
        );
      }
    }

    const [actualizado] = await this.prisma.$transaction([
      this.prisma.legajo.update({ where: { id }, data: { estado: hacia } }),
      this.prisma.legajoHistorial.create({
        data: { legajoId: id, desde, hacia, observacion, actorId },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId,
          accion: "LEGAJO_TRANSICION",
          entidad: "Legajo",
          entidadId: id,
          antes: { estado: desde },
          despues: { estado: hacia, observacion: observacion ?? null },
        },
      }),
    ]);

    // Al habilitar, genera la resolución de habilitación.
    if (hacia === LegajoEstado.HABILITADA) {
      await this.prisma.resolucion.create({
        data: {
          legajoId: id,
          numero: `RES-${new Date().getFullYear()}-${id.slice(-6).toUpperCase()}`,
          tipo: "HABILITACION",
        },
      });
    }

    return actualizado;
  }

  /** Observa uno o más requisitos y pasa el legajo a OBSERVADA. */
  async observar(id: string, requisitos: { requisitoId: string; observacion: string }[], actorId?: string) {
    await this.prisma.$transaction(
      requisitos.map((o) =>
        this.prisma.requisito.update({
          where: { id: o.requisitoId },
          data: { estado: RequisitoEstado.OBSERVADO, observacion: o.observacion },
        }),
      ),
    );
    return this.transicionar(id, LegajoEstado.OBSERVADA, actorId, "Requisitos observados");
  }
}
