import { Controller, Get, Query } from "@nestjs/common";
import { LegajoEstado } from "@gesdisep/shared";
import { PrismaService } from "../prisma/prisma.service";

/** Agrupación de estados del legajo para la consulta pública. */
const GRUPO_POR_ESTADO: Record<string, string> = {
  [LegajoEstado.PRESENTADA]: "tramite",
  [LegajoEstado.EN_REVISION_DOCUMENTAL]: "tramite",
  [LegajoEstado.OBSERVADA]: "tramite",
  [LegajoEstado.VERIFICACION_EXTERNA]: "tramite",
  [LegajoEstado.INSPECCION]: "tramite",
  [LegajoEstado.EN_APROBACION]: "tramite",
  [LegajoEstado.HABILITADA]: "habilitada",
  [LegajoEstado.SUSPENDIDA]: "inhabilitada",
  [LegajoEstado.INHAB_TEMPORAL]: "inhabilitada",
  [LegajoEstado.INHAB_DEFINITIVA]: "inhabilitada",
  [LegajoEstado.BAJA]: "baja",
  // BORRADOR y RECHAZADA no se publican: nunca llegaron a estar en el registro.
};

/**
 * Padrón público del Registro (Art. 4 y 18 inc. f Ley 9578): consulta abierta
 * de prestadores y su estado, con datos mínimos (sin domicilios ni contactos).
 */
@Controller("publico")
export class PublicoController {
  constructor(private prisma: PrismaService) {}

  @Get("padron")
  async padron(@Query("grupo") grupo?: string) {
    const prestadores = await this.prisma.prestador.findMany({
      include: {
        legajos: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { razonSocial: "asc" },
    });

    const filas = prestadores
      .map((p) => {
        const legajo = p.legajos[0];
        if (!legajo) return null;
        const g = GRUPO_POR_ESTADO[legajo.estado];
        if (!g) return null; // estado no publicable (borrador/rechazada)
        return {
          razonSocial: p.razonSocial,
          cuit: p.cuit,
          tipo: p.tipo,
          estado: legajo.estado,
          grupo: g,
          periodo: legajo.periodo,
          actualizado: legajo.updatedAt.toISOString().slice(0, 10),
        };
      })
      .filter((f): f is NonNullable<typeof f> => f !== null)
      .filter((f) => !grupo || grupo === "todas" || f.grupo === grupo);

    return { total: filas.length, prestadores: filas };
  }
}
