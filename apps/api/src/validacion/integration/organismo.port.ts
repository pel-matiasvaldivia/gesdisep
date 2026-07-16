import { Organismo } from "@gesdisep/shared";

export type ResultadoVerificacion = "OK" | "RECHAZO" | "NO_DISPONIBLE" | "ERROR";

export interface VerificacionInput {
  /** CUIT o DNI a verificar, según el organismo. */
  identificador: string;
  /** Datos adicionales (razón social, período, etc.). */
  extra?: Record<string, unknown>;
}

export interface VerificacionResult {
  organismo: Organismo;
  resultado: ResultadoVerificacion;
  /** Datos devueltos por el organismo. */
  datos: Record<string, unknown>;
  fuente: string;
  fechaConsulta: string;
}

/**
 * Puerto común que implementa cada adaptador de organismo.
 * Permite intercambiar la implementación real por un stub sin tocar el dominio.
 */
export interface OrganismoPort {
  readonly organismo: Organismo;
  verificar(input: VerificacionInput): Promise<VerificacionResult>;
}
