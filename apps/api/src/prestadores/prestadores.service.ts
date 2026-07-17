import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  CrearPrestadorDto,
  LegajoEstado,
  PrestadorTipo,
  REQUISITOS_POR_TIPO,
  normalizarCuit,
} from "@gesdisep/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PrestadoresService {
  constructor(private prisma: PrismaService) {}

  async crear(dto: CrearPrestadorDto, usuarioId?: string) {
    const cuit = normalizarCuit(dto.cuit);
    const existe = await this.prisma.prestador.findUnique({ where: { cuit } });
    if (existe) throw new BadRequestException("Ya existe un prestador con ese CUIT");

    const prestador = await this.prisma.prestador.create({
      data: {
        tipo: dto.tipo,
        tipoPersona: dto.tipoPersona,
        razonSocial: dto.razonSocial,
        cuit,
        domicilioSocial: dto.domicilioSocial,
        domicilioElectronico: dto.domicilioElectronico,
        telefono: dto.telefono,
      },
    });

    // Crea el legajo inicial con el checklist de requisitos de la categoría.
    const requisitos = REQUISITOS_POR_TIPO[dto.tipo as PrestadorTipo];
    const legajo = await this.prisma.legajo.create({
      data: {
        prestadorId: prestador.id,
        categoria: dto.tipo,
        periodo: new Date().getFullYear(),
        estado: LegajoEstado.BORRADOR,
        requisitos: {
          create: requisitos.map((r) => ({
            codigo: r.codigo,
            descripcion: r.descripcion,
            obligatorio: r.obligatorio,
            organismo: r.organismo ?? null,
          })),
        },
      },
      include: { requisitos: true },
    });

    // Vincula el usuario que registra (si viene) al prestador.
    if (usuarioId) {
      await this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { prestadorId: prestador.id },
      });
    }

    return { prestador, legajo };
  }

  /** Prestador vinculado al usuario autenticado (portal de empresa). */
  async miPrestador(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario?.prestadorId) {
      throw new NotFoundException("El usuario no tiene un prestador registrado");
    }
    return this.prisma.prestador.findUnique({
      where: { id: usuario.prestadorId },
      include: {
        legajos: {
          orderBy: { createdAt: "desc" },
          include: { requisitos: { orderBy: { codigo: "asc" } }, historial: true },
        },
      },
    });
  }

  async listar() {
    return this.prisma.prestador.findMany({
      orderBy: { createdAt: "desc" },
      include: { legajos: { select: { id: true, estado: true, periodo: true } } },
    });
  }

  async obtener(id: string) {
    const prestador = await this.prisma.prestador.findUnique({
      where: { id },
      include: {
        legajos: { include: { requisitos: true, historial: true } },
        personal: { include: { persona: true } },
      },
    });
    if (!prestador) throw new NotFoundException("Prestador no encontrado");
    return prestador;
  }

  /** Baja lógica del prestador (marca el legajo vigente en estado BAJA). */
  async baja(id: string) {
    const legajo = await this.prisma.legajo.findFirst({
      where: { prestadorId: id, estado: LegajoEstado.HABILITADA },
      orderBy: { createdAt: "desc" },
    });
    if (!legajo) throw new BadRequestException("No hay legajo habilitado para dar de baja");
    return this.prisma.legajo.update({
      where: { id: legajo.id },
      data: { estado: LegajoEstado.BAJA },
    });
  }
}
