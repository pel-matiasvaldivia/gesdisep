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

export const GRUPOS_PADRON: { valor: string; label: string }[] = [
  { valor: "todas", label: "Todas" },
  { valor: "habilitada", label: "Habilitadas" },
  { valor: "tramite", label: "En trámite" },
  { valor: "inhabilitada", label: "Suspendidas / Inhabilitadas" },
  { valor: "baja", label: "Bajas" },
];
