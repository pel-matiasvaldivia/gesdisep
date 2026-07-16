import { Injectable } from "@nestjs/common";
import { Organismo } from "@gesdisep/shared";
import { BaseAdapter } from "../base.adapter";
import { VerificacionInput, VerificacionResult } from "../organismo.port";

/**
 * RENAPER — validación de identidad por DNI.
 * En modo "real" llama al endpoint configurado; en "stub" simula la respuesta.
 */
@Injectable()
export class RenaperAdapter extends BaseAdapter {
  readonly organismo = Organismo.RENAPER;

  protected async real(input: VerificacionInput): Promise<VerificacionResult> {
    const base = process.env.RENAPER_BASE_URL;
    const apiKey = process.env.RENAPER_API_KEY;
    if (!base) return this.result("NO_DISPONIBLE", { motivo: "Endpoint no configurado" }, "RENAPER");

    const res = await fetch(`${base}/personas/${encodeURIComponent(input.identificador)}`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    });
    if (res.status === 404) {
      return this.result("RECHAZO", { motivo: "DNI inexistente" }, "RENAPER");
    }
    if (!res.ok) throw new Error(`RENAPER HTTP ${res.status}`);
    const datos = (await res.json()) as Record<string, unknown>;
    return this.result("OK", datos, "RENAPER");
  }

  protected async stub(input: VerificacionInput): Promise<VerificacionResult> {
    const dni = input.identificador.replace(/\D/g, "");
    if (dni.length < 7 || dni.length > 8) {
      return this.result("RECHAZO", { motivo: "DNI con formato inválido" }, "RENAPER (stub)");
    }
    // Determinístico: ~10% de los DNI se simulan como no encontrados.
    if (this.hash(dni) % 10 === 0) {
      return this.result("RECHAZO", { motivo: "DNI no registrado" }, "RENAPER (stub)");
    }
    return this.result(
      "OK",
      {
        dni,
        vigente: true,
        fallecido: false,
        nombreCoincide: true,
      },
      "RENAPER (stub)",
    );
  }
}
