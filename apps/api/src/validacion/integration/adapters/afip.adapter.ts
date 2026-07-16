import { Injectable } from "@nestjs/common";
import { Organismo, normalizarCuit } from "@gesdisep/shared";
import { BaseAdapter } from "../base.adapter";
import { VerificacionInput, VerificacionResult } from "../organismo.port";

/** AFIP/ARCA — inscripción, condición fiscal y Formulario 931. */
@Injectable()
export class AfipAdapter extends BaseAdapter {
  readonly organismo = Organismo.AFIP;

  protected async real(input: VerificacionInput): Promise<VerificacionResult> {
    const base = process.env.AFIP_BASE_URL;
    if (!base) return this.result("NO_DISPONIBLE", { motivo: "Endpoint no configurado" }, "AFIP");
    const res = await fetch(`${base}/contribuyentes/${normalizarCuit(input.identificador)}`);
    if (!res.ok) throw new Error(`AFIP HTTP ${res.status}`);
    return this.result("OK", (await res.json()) as Record<string, unknown>, "AFIP");
  }

  protected async stub(input: VerificacionInput): Promise<VerificacionResult> {
    const cuit = normalizarCuit(input.identificador);
    const digits = cuit.replace(/\D/g, "");
    if (digits.length !== 11) {
      return this.result("RECHAZO", { motivo: "CUIT inválido" }, "AFIP (stub)");
    }
    const activo = this.hash(digits) % 7 !== 0; // ~85% activos
    return this.result(activo ? "OK" : "RECHAZO", {
      cuit,
      estadoInscripcion: activo ? "ACTIVO" : "INACTIVO",
      f931Presentado: activo,
    }, "AFIP (stub)");
  }
}
