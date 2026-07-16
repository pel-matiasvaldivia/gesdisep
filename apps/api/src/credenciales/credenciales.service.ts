import { Injectable, NotFoundException } from "@nestjs/common";
import { createHmac, randomUUID } from "crypto";
import * as QRCode from "qrcode";
import {
  CredencialEstado,
  CredencialTipo,
  CREDENCIAL_COLOR,
  REGLAS,
} from "@gesdisep/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CredencialesService {
  constructor(private prisma: PrismaService) {}

  private secret() {
    return process.env.CREDENCIAL_QR_SECRET ?? "dev-qr-secret";
  }

  /** Token firmado que viaja en el QR: <uuid>.<hmac>. */
  private firmar(uuid: string): string {
    const mac = createHmac("sha256", this.secret()).update(uuid).digest("hex").slice(0, 32);
    return `${uuid}.${mac}`;
  }

  private validarToken(token: string): boolean {
    const [uuid, mac] = token.split(".");
    if (!uuid || !mac) return false;
    const esperado = createHmac("sha256", this.secret()).update(uuid).digest("hex").slice(0, 32);
    return esperado === mac;
  }

  async emitir(personaId: string, tipo: CredencialTipo) {
    const persona = await this.prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) throw new NotFoundException("Persona no encontrada");

    const uuid = randomUUID();
    const qrToken = this.firmar(uuid);
    const emision = new Date();
    const vencimiento = new Date(emision);
    vencimiento.setFullYear(vencimiento.getFullYear() + REGLAS.CREDENCIAL_VIGENCIA_ANIOS);

    const numeroRegistro = `DISEP-${tipo.slice(0, 3)}-${uuid.slice(0, 8).toUpperCase()}`;

    const credencial = await this.prisma.credencial.create({
      data: {
        personaId,
        tipo,
        color: CREDENCIAL_COLOR[tipo],
        numeroRegistro,
        emision,
        vencimiento,
        estado: CredencialEstado.VIGENTE,
        qrToken,
      },
    });

    const urlVerificacion = `${process.env.PUBLIC_VERIFY_URL ?? "http://localhost:3000/verificar"}/${qrToken}`;
    const qrDataUrl = await QRCode.toDataURL(urlVerificacion);

    return { credencial, urlVerificacion, qrDataUrl };
  }

  /** Verificación pública por QR (sin autenticación). Devuelve datos mínimos. */
  async verificarPublico(qrToken: string) {
    if (!this.validarToken(qrToken)) {
      return { valida: false, motivo: "Token inválido o adulterado" };
    }
    const credencial = await this.prisma.credencial.findUnique({
      where: { qrToken },
      include: { persona: { select: { nombre: true, apellido: true } } },
    });
    if (!credencial) return { valida: false, motivo: "Credencial inexistente" };

    const vencida = credencial.vencimiento.getTime() < Date.now();
    const vigente = credencial.estado === CredencialEstado.VIGENTE && !vencida;

    return {
      valida: vigente,
      titular: `${credencial.persona.apellido}, ${credencial.persona.nombre}`,
      funcion: credencial.tipo,
      color: credencial.color,
      numeroRegistro: credencial.numeroRegistro,
      vencimiento: credencial.vencimiento.toISOString().slice(0, 10),
      estado: vencida ? CredencialEstado.VENCIDA : credencial.estado,
    };
  }
}
