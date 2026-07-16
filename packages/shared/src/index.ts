/**
 * Dominio compartido GESDISEP.
 * Enums, tipos y esquemas de validación derivados de la Ley 9578 y el Decreto 264/2025.
 */
import { z } from "zod";

/* ─────────────────────────── Enums de dominio ─────────────────────────── */

/** Categoría del prestador (Art. 7, 8, 9 Ley). */
export enum PrestadorTipo {
  HUMANA = "HUMANA",
  INTERNA = "INTERNA",
  TECNOLOGICA = "TECNOLOGICA",
}

export enum TipoPersona {
  HUMANA = "PERSONA_HUMANA",
  JURIDICA = "PERSONA_JURIDICA",
}

/** Máquina de estados del legajo de una empresa (ver docs/01). */
export enum LegajoEstado {
  BORRADOR = "BORRADOR",
  PRESENTADA = "PRESENTADA",
  EN_REVISION_DOCUMENTAL = "EN_REVISION_DOCUMENTAL",
  OBSERVADA = "OBSERVADA",
  VERIFICACION_EXTERNA = "VERIFICACION_EXTERNA",
  INSPECCION = "INSPECCION",
  EN_APROBACION = "EN_APROBACION",
  HABILITADA = "HABILITADA",
  RECHAZADA = "RECHAZADA",
  SUSPENDIDA = "SUSPENDIDA",
  INHAB_TEMPORAL = "INHAB_TEMPORAL",
  INHAB_DEFINITIVA = "INHAB_DEFINITIVA",
  BAJA = "BAJA",
}

/** Estado de un requisito documental. */
export enum RequisitoEstado {
  PENDIENTE = "PENDIENTE",
  PRESENTADO = "PRESENTADO",
  VERIFICADO = "VERIFICADO",
  OBSERVADO = "OBSERVADO",
  VENCIDO = "VENCIDO",
}

/** Método por el que se verificó un requisito. */
export enum MetodoVerificacion {
  AUTOMATICO = "AUTOMATICO",
  MANUAL = "MANUAL",
}

/** Tipos de credencial por color (Art. 6 inc. N Decreto). */
export enum CredencialTipo {
  DIRECTOR_TECNICO = "DIRECTOR_TECNICO", // Blanca
  SUPERVISOR = "SUPERVISOR", // Blanca
  VIGILADOR_BOMBERO = "VIGILADOR_BOMBERO", // Roja
  VIGILADOR_DEPORTIVO = "VIGILADOR_DEPORTIVO", // Verde
  VIGILADOR_NOCTURNO = "VIGILADOR_NOCTURNO", // Negra
  VIGILADOR_GENERAL = "VIGILADOR_GENERAL", // Azul
  VIGILADOR_INTERNO = "VIGILADOR_INTERNO", // Amarilla
  TECNOLOGICO = "TECNOLOGICO", // Violeta
}

export const CREDENCIAL_COLOR: Record<CredencialTipo, string> = {
  [CredencialTipo.DIRECTOR_TECNICO]: "BLANCA",
  [CredencialTipo.SUPERVISOR]: "BLANCA",
  [CredencialTipo.VIGILADOR_BOMBERO]: "ROJA",
  [CredencialTipo.VIGILADOR_DEPORTIVO]: "VERDE",
  [CredencialTipo.VIGILADOR_NOCTURNO]: "NEGRA",
  [CredencialTipo.VIGILADOR_GENERAL]: "AZUL",
  [CredencialTipo.VIGILADOR_INTERNO]: "AMARILLA",
  [CredencialTipo.TECNOLOGICO]: "VIOLETA",
};

export enum CredencialEstado {
  VIGENTE = "VIGENTE",
  POR_VENCER = "POR_VENCER",
  VENCIDA = "VENCIDA",
  SUSPENDIDA = "SUSPENDIDA",
  BAJA = "BAJA",
}

/** Roles del sistema (RBAC). */
export enum Rol {
  EMPRESA = "EMPRESA",
  PERSONAL = "PERSONAL",
  MESA_ENTRADAS = "MESA_ENTRADAS",
  ANALISTA = "ANALISTA",
  INSPECTOR = "INSPECTOR",
  DIRECTOR = "DIRECTOR",
  MINISTRO = "MINISTRO",
  ADMIN = "ADMIN",
  AUDITOR = "AUDITOR",
}

/** Organismos externos integrables (interoperabilidad Art. 6 inc. e / Art. 49). */
export enum Organismo {
  AFIP = "AFIP",
  ATM = "ATM",
  DPJ = "DPJ",
  REINCIDENCIA = "REINCIDENCIA",
  RENAPER = "RENAPER",
  ANMAC = "ANMAC",
  SRT = "SRT",
  SEGUROS = "SEGUROS",
  TRABAJO = "TRABAJO",
  MUNICIPIO = "MUNICIPIO",
  CEO_911 = "CEO_911",
  LEY8611 = "LEY8611",
}

/* ─────────────── Transiciones válidas de la máquina de estados ─────────────── */

export const TRANSICIONES_LEGAJO: Record<LegajoEstado, LegajoEstado[]> = {
  [LegajoEstado.BORRADOR]: [LegajoEstado.PRESENTADA],
  [LegajoEstado.PRESENTADA]: [LegajoEstado.EN_REVISION_DOCUMENTAL],
  [LegajoEstado.EN_REVISION_DOCUMENTAL]: [
    LegajoEstado.OBSERVADA,
    LegajoEstado.VERIFICACION_EXTERNA,
  ],
  [LegajoEstado.OBSERVADA]: [LegajoEstado.EN_REVISION_DOCUMENTAL],
  [LegajoEstado.VERIFICACION_EXTERNA]: [
    LegajoEstado.INSPECCION,
    LegajoEstado.EN_APROBACION,
    LegajoEstado.OBSERVADA,
  ],
  [LegajoEstado.INSPECCION]: [LegajoEstado.EN_APROBACION, LegajoEstado.OBSERVADA],
  [LegajoEstado.EN_APROBACION]: [LegajoEstado.HABILITADA, LegajoEstado.RECHAZADA],
  [LegajoEstado.HABILITADA]: [
    LegajoEstado.SUSPENDIDA,
    LegajoEstado.INHAB_TEMPORAL,
    LegajoEstado.INHAB_DEFINITIVA,
    LegajoEstado.BAJA,
  ],
  [LegajoEstado.RECHAZADA]: [LegajoEstado.BORRADOR],
  [LegajoEstado.SUSPENDIDA]: [LegajoEstado.HABILITADA, LegajoEstado.INHAB_DEFINITIVA],
  [LegajoEstado.INHAB_TEMPORAL]: [
    LegajoEstado.HABILITADA,
    LegajoEstado.INHAB_DEFINITIVA,
  ],
  [LegajoEstado.INHAB_DEFINITIVA]: [],
  [LegajoEstado.BAJA]: [],
};

export function puedeTransicionar(desde: LegajoEstado, hacia: LegajoEstado): boolean {
  return TRANSICIONES_LEGAJO[desde]?.includes(hacia) ?? false;
}

/* ─────────────── Catálogo de requisitos por categoría ─────────────── */

export interface RequisitoDef {
  codigo: string;
  descripcion: string;
  obligatorio: boolean;
  /** Organismo que permite verificarlo automáticamente, si existe. */
  organismo?: Organismo;
}

export const REQUISITOS_POR_TIPO: Record<PrestadorTipo, RequisitoDef[]> = {
  [PrestadorTipo.HUMANA]: [
    { codigo: "HUM_CONSTITUCION", descripcion: "Sociedad constituida (Ley 19.550 / 27.349)", obligatorio: true, organismo: Organismo.DPJ },
    { codigo: "HUM_CONTRATO_SOCIAL", descripcion: "Contrato social inscripto en DPJ", obligatorio: true, organismo: Organismo.DPJ },
    { codigo: "HUM_DATOS", descripcion: "Razón social, domicilio electrónico, CUIT y teléfono", obligatorio: true, organismo: Organismo.AFIP },
    { codigo: "HUM_ANTECEDENTES", descripcion: "Antecedentes penales de directores y propietarios", obligatorio: true, organismo: Organismo.REINCIDENCIA },
    { codigo: "HUM_CAUCION", descripcion: "Seguro de caución a favor del Ministerio", obligatorio: true, organismo: Organismo.SEGUROS },
    { codigo: "HUM_RC", descripcion: "Seguro de responsabilidad civil contra terceros", obligatorio: true, organismo: Organismo.SEGUROS },
    { codigo: "HUM_ART", descripcion: "Seguro ART", obligatorio: true, organismo: Organismo.SRT },
    { codigo: "HUM_AFIP_ATM", descripcion: "Inscripción y constancias al día AFIP y ATM", obligatorio: true, organismo: Organismo.AFIP },
    { codigo: "HUM_MUNICIPAL", descripcion: "Habilitación municipal", obligatorio: true, organismo: Organismo.MUNICIPIO },
    { codigo: "HUM_TASA", descripcion: "Pago de la tasa anual", obligatorio: true, organismo: Organismo.ATM },
    { codigo: "HUM_VEHICULOS", descripcion: "Declaración de vehículos afectados", obligatorio: false },
    { codigo: "HUM_DT", descripcion: "Designación de Director Técnico", obligatorio: true },
    { codigo: "HUM_ANMAC", descripcion: "Inscripción ANMaC (si usa armas)", obligatorio: false, organismo: Organismo.ANMAC },
    { codigo: "HUM_LEY8611", descripcion: "Huellas y tomas genéticas de directores (Ley 8611)", obligatorio: true, organismo: Organismo.LEY8611 },
    { codigo: "HUM_SEDE", descripcion: "Sede/local de uso exclusivo habilitado", obligatorio: true },
  ],
  [PrestadorTipo.INTERNA]: [
    { codigo: "INT_NOTA", descripcion: "Nota de solicitud con datos y domicilio electrónico", obligatorio: true },
    { codigo: "INT_TRABAJADORES", descripcion: "Nómina de trabajadores + F931 AFIP", obligatorio: true, organismo: Organismo.AFIP },
    { codigo: "INT_DNI", descripcion: "Copia del DNI del solicitante", obligatorio: true, organismo: Organismo.RENAPER },
    { codigo: "INT_ANTECEDENTES", descripcion: "Certificado de antecedentes penales", obligatorio: true, organismo: Organismo.REINCIDENCIA },
    { codigo: "INT_TASA", descripcion: "Pago de la tasa anual diferenciada", obligatorio: true, organismo: Organismo.ATM },
    { codigo: "INT_LIBRO", descripcion: "Libro de objetivos autorizado", obligatorio: true },
    { codigo: "INT_RC", descripcion: "Seguro de RC contra terceros", obligatorio: true, organismo: Organismo.SEGUROS },
    { codigo: "INT_DT", descripcion: "Director Técnico si supera 5 vigiladores simultáneos", obligatorio: false },
  ],
  [PrestadorTipo.TECNOLOGICA]: [
    { codigo: "TEC_AFIP_ATM", descripcion: "Inscripción AFIP y ATM", obligatorio: true, organismo: Organismo.AFIP },
    { codigo: "TEC_DATOS", descripcion: "Datos personales y domicilio electrónico", obligatorio: true },
    { codigo: "TEC_ANTECEDENTES", descripcion: "Certificado de antecedentes penales", obligatorio: true, organismo: Organismo.REINCIDENCIA },
    { codigo: "TEC_TASA", descripcion: "Pago de tasa anual", obligatorio: true, organismo: Organismo.ATM },
    { codigo: "TEC_RESP_TECNICO", descripcion: "Responsable técnico con título afín o idoneidad", obligatorio: true },
    { codigo: "TEC_PROTOCOLOS", descripcion: "Protocolos de actuación ante eventos/alarmas", obligatorio: true },
    { codigo: "TEC_CAUCION", descripcion: "Seguro de caución (si es persona jurídica)", obligatorio: false, organismo: Organismo.SEGUROS },
  ],
};

/* ─────────────── Reglas de negocio (constantes) ─────────────── */

export const REGLAS = {
  DT_MAX_EMPRESAS: 3, // Art. 11 inc. m Decreto
  INTERNA_MAX_VIGILADORES: 30, // Art. 13 Decreto
  INTERNA_DT_UMBRAL: 5, // Art. 14 Decreto
  CREDENCIAL_VIGENCIA_ANIOS: 2, // Art. 30 Ley
  CAPACITACION_VIGENCIA_ANIOS: 5, // Art. 24 f Ley
  PSICOFISICA_55_ANIOS: 4, // Art. 24 e Decreto
  RENOVACION_DESDE: { mes: 1, dia: 1 }, // 1 enero (Art. 17)
  RENOVACION_HASTA: { mes: 3, dia: 10 }, // 10 marzo
  INHAB_TEMPORAL_MAX_DIAS: 60, // Art. 37 c
  PAGO_VOLUNTARIO_DIAS: 5, // Art. 41
  PAGO_VOLUNTARIO_DESCUENTO: 0.4, // hasta 40%
} as const;

/* ─────────────── Esquemas Zod (validación de entrada) ─────────────── */

export const crearPrestadorSchema = z.object({
  tipo: z.nativeEnum(PrestadorTipo),
  tipoPersona: z.nativeEnum(TipoPersona),
  razonSocial: z.string().min(2),
  cuit: z.string().regex(/^\d{2}-?\d{8}-?\d$/, "CUIT inválido"),
  domicilioSocial: z.string().min(3),
  domicilioElectronico: z.string().email(),
  telefono: z.string().min(6),
});
export type CrearPrestadorDto = z.infer<typeof crearPrestadorSchema>;

export const transicionLegajoSchema = z.object({
  hacia: z.nativeEnum(LegajoEstado),
  observacion: z.string().optional(),
});
export type TransicionLegajoDto = z.infer<typeof transicionLegajoSchema>;

/* ─────────────── Utilidades ─────────────── */

/** ¿La fecha dada cae dentro de la ventana de renovación (1 ene – 10 mar)? */
export function enVentanaRenovacion(fecha = new Date()): boolean {
  const mes = fecha.getMonth() + 1;
  const dia = fecha.getDate();
  if (mes === 1 || mes === 2) return true;
  if (mes === 3 && dia <= REGLAS.RENOVACION_HASTA.dia) return true;
  return false;
}

/** Normaliza un CUIT a formato XX-XXXXXXXX-X. */
export function normalizarCuit(cuit: string): string {
  const d = cuit.replace(/\D/g, "");
  if (d.length !== 11) return cuit;
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
}
