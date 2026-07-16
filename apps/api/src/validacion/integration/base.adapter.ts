import { Logger } from "@nestjs/common";
import { Organismo } from "@gesdisep/shared";
import {
  OrganismoPort,
  VerificacionInput,
  VerificacionResult,
} from "./organismo.port";

/**
 * Base para los adaptadores. Resuelve el modo (real|stub) por variable de
 * entorno ADAPTER_<ORGANISMO>_MODE y aplica reintentos con backoff.
 */
export abstract class BaseAdapter implements OrganismoPort {
  abstract readonly organismo: Organismo;
  protected readonly logger = new Logger(this.constructor.name);

  protected get mode(): "real" | "stub" {
    const v = process.env[`ADAPTER_${this.organismoKey()}_MODE`];
    return v === "real" ? "real" : "stub";
  }

  private organismoKey(): string {
    return this.organismo.toString().toUpperCase();
  }

  async verificar(input: VerificacionInput): Promise<VerificacionResult> {
    if (this.mode === "stub") {
      return this.stub(input);
    }
    return this.withRetries(() => this.real(input));
  }

  /** Implementación real contra la API del organismo. */
  protected abstract real(input: VerificacionInput): Promise<VerificacionResult>;

  /** Respuesta simulada determinística para desarrollo. */
  protected abstract stub(input: VerificacionInput): Promise<VerificacionResult>;

  protected result(
    resultado: VerificacionResult["resultado"],
    datos: Record<string, unknown>,
    fuente: string,
  ): VerificacionResult {
    return {
      organismo: this.organismo,
      resultado,
      datos,
      fuente,
      fechaConsulta: new Date().toISOString(),
    };
  }

  protected async withRetries<T>(fn: () => Promise<T>, intentos = 3): Promise<T> {
    let ultimoError: unknown;
    for (let i = 0; i < intentos; i++) {
      try {
        return await fn();
      } catch (e) {
        ultimoError = e;
        const espera = 2 ** i * 500;
        this.logger.warn(`Reintento ${i + 1}/${intentos} en ${espera}ms: ${String(e)}`);
        await new Promise((r) => setTimeout(r, espera));
      }
    }
    throw ultimoError;
  }

  /** Dígito determinístico a partir de un string (para stubs estables). */
  protected hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
}
