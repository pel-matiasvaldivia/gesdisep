/** Metadatos de presentación de los estados del legajo y los requisitos. */

export const ESTADO_LEGAJO: Record<string, { label: string; color: string }> = {
  BORRADOR: { label: "Borrador", color: "#8a94a6" },
  PRESENTADA: { label: "Presentada", color: "#2e7dd1" },
  EN_REVISION_DOCUMENTAL: { label: "En revisión documental", color: "#2e7dd1" },
  OBSERVADA: { label: "Observada — requiere subsanación", color: "#e0a100" },
  VERIFICACION_EXTERNA: { label: "Verificación con organismos", color: "#2e7dd1" },
  INSPECCION: { label: "En inspección", color: "#7c3aed" },
  EN_APROBACION: { label: "En aprobación", color: "#7c3aed" },
  HABILITADA: { label: "Habilitada", color: "#1f9d55" },
  RECHAZADA: { label: "Rechazada", color: "#d92d20" },
  SUSPENDIDA: { label: "Suspendida", color: "#d92d20" },
  INHAB_TEMPORAL: { label: "Inhabilitación temporal", color: "#d92d20" },
  INHAB_DEFINITIVA: { label: "Inhabilitación definitiva", color: "#8a1f11" },
  BAJA: { label: "Baja", color: "#5a6675" },
};

export const ESTADO_REQUISITO: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: "Pendiente", color: "#8a94a6" },
  PRESENTADO: { label: "Presentado", color: "#2e7dd1" },
  VERIFICADO: { label: "Verificado", color: "#1f9d55" },
  OBSERVADO: { label: "Observado", color: "#e0a100" },
  VENCIDO: { label: "Vencido", color: "#d92d20" },
};

/** Camino "feliz" del trámite, para el stepper del panel. */
export const PASOS_TRAMITE = [
  "BORRADOR",
  "PRESENTADA",
  "EN_REVISION_DOCUMENTAL",
  "VERIFICACION_EXTERNA",
  "EN_APROBACION",
  "HABILITADA",
] as const;

export const TIPO_PRESTADOR: Record<string, string> = {
  HUMANA: "Seguridad Humana",
  INTERNA: "Seguridad Interna",
  TECNOLOGICA: "Seguridad Tecnológica",
};

/** Roles con acceso a la bandeja interna de la Dirección. */
export const ROLES_INTERNOS = [
  "ADMIN",
  "MESA_ENTRADAS",
  "ANALISTA",
  "INSPECTOR",
  "DIRECTOR",
  "AUDITOR",
  "MINISTRO",
];

export function esUsuarioInterno(roles: string[] | undefined | null): boolean {
  return (roles ?? []).some((r) => ROLES_INTERNOS.includes(r));
}

export interface AccionBandeja {
  hacia: string;
  label: string;
  /** Decisión final: el botón solo se muestra a DIRECTOR/ADMIN (la API también lo exige). */
  soloDirector?: boolean;
  /** Estilo del botón: avance normal, resolución favorable o desfavorable. */
  tono?: "ok" | "peligro";
}

/** Transiciones que la bandeja ofrece en cada estado (espejo de la máquina de estados). */
export const ACCIONES_BANDEJA: Record<string, AccionBandeja[]> = {
  PRESENTADA: [{ hacia: "EN_REVISION_DOCUMENTAL", label: "Tomar en revisión documental →" }],
  EN_REVISION_DOCUMENTAL: [
    { hacia: "VERIFICACION_EXTERNA", label: "Pasar a verificación con organismos →" },
  ],
  VERIFICACION_EXTERNA: [
    { hacia: "INSPECCION", label: "Enviar a inspección →" },
    { hacia: "EN_APROBACION", label: "Elevar a aprobación →" },
  ],
  INSPECCION: [{ hacia: "EN_APROBACION", label: "Elevar a aprobación →" }],
  EN_APROBACION: [
    { hacia: "HABILITADA", label: "✔ Habilitar (emite resolución)", soloDirector: true, tono: "ok" },
    { hacia: "RECHAZADA", label: "✖ Rechazar", soloDirector: true, tono: "peligro" },
  ],
  HABILITADA: [
    { hacia: "SUSPENDIDA", label: "Suspender", soloDirector: true, tono: "peligro" },
    { hacia: "INHAB_TEMPORAL", label: "Inhabilitación temporal", soloDirector: true, tono: "peligro" },
    { hacia: "INHAB_DEFINITIVA", label: "Inhabilitación definitiva", soloDirector: true, tono: "peligro" },
    { hacia: "BAJA", label: "Dar de baja", soloDirector: true, tono: "peligro" },
  ],
  SUSPENDIDA: [
    { hacia: "HABILITADA", label: "Rehabilitar", soloDirector: true, tono: "ok" },
    { hacia: "INHAB_DEFINITIVA", label: "Inhabilitación definitiva", soloDirector: true, tono: "peligro" },
  ],
  INHAB_TEMPORAL: [
    { hacia: "HABILITADA", label: "Rehabilitar", soloDirector: true, tono: "ok" },
    { hacia: "INHAB_DEFINITIVA", label: "Inhabilitación definitiva", soloDirector: true, tono: "peligro" },
  ],
};

/** Estados en los que el analista/inspector puede observar requisitos. */
export const ESTADOS_OBSERVABLES = [
  "EN_REVISION_DOCUMENTAL",
  "VERIFICACION_EXTERNA",
  "INSPECCION",
];

export const GRUPOS_PADRON: { valor: string; label: string }[] = [
  { valor: "todas", label: "Todas" },
  { valor: "habilitada", label: "Habilitadas" },
  { valor: "tramite", label: "En trámite" },
  { valor: "inhabilitada", label: "Suspendidas / Inhabilitadas" },
  { valor: "baja", label: "Bajas" },
];
