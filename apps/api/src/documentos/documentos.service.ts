import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createHash } from "crypto";
import { RequisitoEstado, Rol } from "@gesdisep/shared";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "./storage.service";
import type { AuthUser } from "../auth/current-user.decorator";

/** Tipos de archivo admitidos para documentación digitalizada. */
const MIME_ADMITIDOS: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

export const MAX_TAMANO_BYTES = 10 * 1024 * 1024; // 10 MB

export interface ArchivoSubido {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class DocumentosService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  private sanitizarNombre(nombre: string): string {
    const base = nombre.split(/[\\/]/).pop() ?? "documento";
    return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  }

  /** Sube un documento para un requisito del legajo y lo marca presentado. */
  async subir(
    legajoId: string,
    requisitoId: string,
    archivo: ArchivoSubido,
    actorId?: string,
  ) {
    if (!archivo?.buffer?.length) {
      throw new BadRequestException("No se recibió ningún archivo");
    }
    if (!MIME_ADMITIDOS[archivo.mimetype]) {
      throw new BadRequestException(
        "Formato no admitido: se aceptan PDF, JPG o PNG",
      );
    }
    if (archivo.size > MAX_TAMANO_BYTES) {
      throw new BadRequestException("El archivo supera el máximo de 10 MB");
    }

    const requisito = await this.prisma.requisito.findUnique({
      where: { id: requisitoId },
      include: { documentos: { orderBy: { version: "desc" }, take: 1 } },
    });
    if (!requisito || requisito.legajoId !== legajoId) {
      throw new NotFoundException("Requisito no encontrado en este legajo");
    }

    const version = (requisito.documentos[0]?.version ?? 0) + 1;
    const nombre = this.sanitizarNombre(archivo.originalname);
    const archivoRef = `${legajoId}/${requisitoId}/v${version}-${nombre}`;
    const hash = createHash("sha256").update(archivo.buffer).digest("hex");

    await this.storage.guardar(archivoRef, archivo.buffer);

    const marcaPresentado: string[] = [
      RequisitoEstado.PENDIENTE,
      RequisitoEstado.OBSERVADO,
      RequisitoEstado.VENCIDO,
    ];

    const [documento] = await this.prisma.$transaction([
      this.prisma.documento.create({
        data: {
          requisitoId,
          archivoRef,
          nombre,
          version,
          hash,
          subidoPor: actorId,
          antivirusOk: false, // pendiente de escaneo (integración ClamAV futura)
        },
      }),
      ...(marcaPresentado.includes(requisito.estado)
        ? [
            this.prisma.requisito.update({
              where: { id: requisitoId },
              data: { estado: RequisitoEstado.PRESENTADO, observacion: null },
            }),
          ]
        : []),
      this.prisma.auditLog.create({
        data: {
          actorId,
          accion: "DOCUMENTO_SUBIDO",
          entidad: "Documento",
          entidadId: requisitoId,
          despues: { archivoRef, nombre, version, hash, bytes: archivo.size },
        },
      }),
    ]);

    return documento;
  }

  /** Descarga un documento validando propiedad si el usuario es empresa. */
  async descargar(documentoId: string, user: AuthUser) {
    const documento = await this.prisma.documento.findUnique({
      where: { id: documentoId },
      include: { requisito: { include: { legajo: true } } },
    });
    if (!documento) throw new NotFoundException("Documento no encontrado");

    const soloEmpresa = user.roles.every(
      (r) => r === Rol.EMPRESA || r === Rol.PERSONAL,
    );
    if (soloEmpresa) {
      const usuario = await this.prisma.usuario.findUnique({ where: { id: user.id } });
      const prestadorLegajo = documento.requisito.legajo?.prestadorId;
      if (!usuario?.prestadorId || usuario.prestadorId !== prestadorLegajo) {
        throw new ForbiddenException("El documento no pertenece a su empresa");
      }
    }

    const contenido = await this.storage.leer(documento.archivoRef);
    const extension = documento.nombre.toLowerCase().split(".").pop();
    const mime =
      extension === "pdf"
        ? "application/pdf"
        : extension === "png"
          ? "image/png"
          : extension === "jpg" || extension === "jpeg"
            ? "image/jpeg"
            : "application/octet-stream";

    return { contenido, nombre: documento.nombre, mime };
  }
}
