import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  LegajoEstado,
  RequisitoEstado,
  Rol,
  puedeTransicionar,
} from "@gesdisep/shared";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/current-user.decorator";

@Injectable()
export class LegajosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Si el usuario solo tiene rol EMPRESA, valida que el legajo pertenezca a su
   * prestador. Los roles internos (analista, director, etc.) acceden a todos.
   */
  async assertAcceso(user: AuthUser, legajoId: string) {
    const soloEmpresa = user.roles.every(
      (r) => r === Rol.EMPRESA || r === Rol.PERSONAL,
    );
    if (!soloEmpresa) return;
    const [usuario, legajo] = await Promise.all([
      this.prisma.usuario.findUnique({ where: { id: user.id } }),
      this.prisma.legajo.findUnique({ where: { id: legajoId } }),
    ]);
    if (!legajo) throw new NotFoundException("Legajo no encontrado");
    if (!usuario?.prestadorId || usuario.prestadorId !== legajo.prestadorId) {
      throw new ForbiddenException("El legajo no pertenece a su empresa");
    }
  }

  /**
   * Restringe qué transiciones puede pedir cada rol:
   *  - EMPRESA: solo presentar, enviar subsanación o reiniciar tras un rechazo.
   *  - Decisiones finales (habilitar, rechazar, suspender, inhabilitar, baja):
   *    exclusivas de la Dirección (Art. 26 Ley 9578). ADMIN queda exceptuado.
   */
  async assertTransicionPermitida(user: AuthUser, legajoId: string, hacia: LegajoEstado) {
    if (user.roles.includes(Rol.ADMIN)) return;

    const soloEmpresa = user.roles.every(
      (r) => r === Rol.EMPRESA || r === Rol.PERSONAL,
    );
    if (soloEmpresa) {
      const legajo = await this.prisma.legajo.findUnique({ where: { id: legajoId } });
      if (!legajo) throw new NotFoundException("Legajo no encontrado");
      const permitidas: [LegajoEstado, LegajoEstado][] = [
        [LegajoEstado.BORRADOR, LegajoEstado.PRESENTADA],
        [LegajoEstado.OBSERVADA, LegajoEstado.EN_REVISION_DOCUMENTAL],
        [LegajoEstado.RECHAZADA, LegajoEstado.BORRADOR],
      ];
      const ok = permitidas.some(([d, h]) => d === legajo.estado && h === hacia);
      if (!ok) {
        throw new ForbiddenException(
          "Esa transición está reservada a la Dirección de Seguridad Privada",
        );
      }
      return;
    }

    const decisionesDireccion: LegajoEstado[] = [
      LegajoEstado.HABILITADA,
      LegajoEstado.RECHAZADA,
      LegajoEstado.SUSPENDIDA,
      LegajoEstado.INHAB_TEMPORAL,
      LegajoEstado.INHAB_DEFINITIVA,
      LegajoEstado.BAJA,
    ];
    if (decisionesDireccion.includes(hacia) && !user.roles.includes(Rol.DIRECTOR)) {
      throw new ForbiddenException(
        "Solo la Dirección puede resolver habilitaciones, rechazos y sanciones",
      );
    }
  }

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

  /**
   * La empresa marca un requisito como presentado (declaración de carga
   * documental). Vale para la primera carga y para subsanar observados.
   */
  async presentarRequisito(legajoId: string, requisitoId: string, actorId?: string) {
    const requisito = await this.prisma.requisito.findUnique({
      where: { id: requisitoId },
    });
    if (!requisito || requisito.legajoId !== legajoId) {
      throw new NotFoundException("Requisito no encontrado en este legajo");
    }
    const admitidos: string[] = [
      RequisitoEstado.PENDIENTE,
      RequisitoEstado.OBSERVADO,
      RequisitoEstado.VENCIDO,
    ];
    if (!admitidos.includes(requisito.estado)) {
      throw new BadRequestException(
        `El requisito ya está ${requisito.estado.toLowerCase()}`,
      );
    }
    const [actualizado] = await this.prisma.$transaction([
      this.prisma.requisito.update({
        where: { id: requisitoId },
        data: { estado: RequisitoEstado.PRESENTADO, observacion: null },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId,
          accion: "REQUISITO_PRESENTADO",
          entidad: "Requisito",
          entidadId: requisitoId,
          antes: { estado: requisito.estado },
          despues: { estado: RequisitoEstado.PRESENTADO },
        },
      }),
    ]);
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
