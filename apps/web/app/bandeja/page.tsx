"use client";

import { useCallback, useEffect, useState } from "react";
import TopBar from "../_components/TopBar";
import Footer from "../_components/Footer";
import { apiDownload, apiFetch, clearSession, getToken, getUser, SessionUser } from "../../lib/api";
import {
  ACCIONES_BANDEJA,
  ESTADO_LEGAJO,
  ESTADO_REQUISITO,
  ESTADOS_OBSERVABLES,
  TIPO_PRESTADOR,
  esUsuarioInterno,
} from "../../lib/estados";

interface Verificacion {
  id: string;
  organismo: string;
  resultado: string;
  fuente?: string | null;
  createdAt: string;
}
interface Documento {
  id: string;
  nombre: string;
  version: number;
  createdAt: string;
}
interface Requisito {
  id: string;
  codigo: string;
  descripcion: string;
  obligatorio: boolean;
  estado: string;
  observacion?: string | null;
  organismo?: string | null;
  documentos: Documento[];
  verificaciones: Verificacion[];
}
interface Historial {
  id: string;
  desde: string;
  hacia: string;
  observacion?: string | null;
  createdAt: string;
}
interface Resolucion {
  id: string;
  numero: string;
  tipo: string;
  createdAt: string;
}
interface LegajoDetalle {
  id: string;
  estado: string;
  periodo: number;
  categoria: string;
  prestador: {
    id: string;
    razonSocial: string;
    cuit: string;
    tipo: string;
    domicilioSocial?: string | null;
    domicilioElectronico?: string | null;
    telefono?: string | null;
  };
  requisitos: Requisito[];
  historial: Historial[];
  resoluciones: Resolucion[];
}
interface PrestadorItem {
  id: string;
  razonSocial: string;
  cuit: string;
  tipo: string;
  createdAt: string;
  legajos: { id: string; estado: string; periodo: number }[];
}

function badge(estado: string, mapa: Record<string, { label: string; color: string }>) {
  const meta = mapa[estado] ?? { label: estado, color: "#8a94a6" };
  return (
    <span
      className="badge"
      style={{ background: `${meta.color}22`, color: meta.color, border: `1px solid ${meta.color}` }}
    >
      {meta.label}
    </span>
  );
}

export default function Bandeja() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [prestadores, setPrestadores] = useState<PrestadorItem[] | undefined>(undefined);
  const [legajo, setLegajo] = useState<LegajoDetalle | null>(null);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [obsDraft, setObsDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const roles = user?.roles ?? [];
  const tiene = (...rs: string[]) => rs.some((r) => roles.includes(r)) || roles.includes("ADMIN");
  const puedeTransicionar = tiene("MESA_ENTRADAS", "ANALISTA", "INSPECTOR", "DIRECTOR");
  const puedeObservar = tiene("ANALISTA", "INSPECTOR");
  const puedeVerificarAuto = tiene("ANALISTA", "MESA_ENTRADAS");
  const puedeManual = tiene("ANALISTA", "INSPECTOR");
  const esDirector = tiene("DIRECTOR");

  const cargarLista = useCallback(async () => {
    try {
      setPrestadores(await apiFetch<PrestadorItem[]>("/prestadores"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la lista de trámites");
    }
  }, []);

  const abrirLegajo = useCallback(async (legajoId: string) => {
    setError(null);
    try {
      setLegajo(await apiFetch<LegajoDetalle>(`/legajos/${legajoId}`));
      setObsDraft({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo abrir el legajo");
    }
  }, []);

  useEffect(() => {
    const u = getToken() ? getUser() : null;
    setUser(u);
    if (u && esUsuarioInterno(u.roles)) void cargarLista();
  }, [cargarLista]);

  async function recargar() {
    await cargarLista();
    if (legajo) await abrirLegajo(legajo.id);
  }

  async function transicionar(hacia: string, label: string, pedirMotivo: boolean) {
    if (!legajo) return;
    let observacion: string | undefined;
    if (pedirMotivo) {
      const motivo = window.prompt(`Motivo de "${label}" (queda en el historial):`);
      if (motivo === null) return; // canceló
      observacion = motivo || undefined;
    }
    setError(null);
    setAviso(null);
    setOcupado(true);
    try {
      await apiFetch(`/legajos/${legajo.id}/transicion`, {
        method: "POST",
        body: JSON.stringify({ hacia, observacion }),
      });
      setAviso(`Legajo actualizado: ${ESTADO_LEGAJO[hacia]?.label ?? hacia}.`);
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo transicionar el legajo");
    } finally {
      setOcupado(false);
    }
  }

  async function observarSeleccionados() {
    if (!legajo) return;
    const requisitos = Object.entries(obsDraft)
      .filter(([, texto]) => texto.trim().length > 0)
      .map(([requisitoId, observacion]) => ({ requisitoId, observacion: observacion.trim() }));
    if (requisitos.length === 0) {
      setError("Escribí la observación en al menos un requisito.");
      return;
    }
    setError(null);
    setAviso(null);
    setOcupado(true);
    try {
      await apiFetch(`/legajos/${legajo.id}/observar`, {
        method: "POST",
        body: JSON.stringify({ requisitos }),
      });
      setAviso(`Se observaron ${requisitos.length} requisitos. El legajo vuelve a la empresa para subsanar.`);
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron registrar las observaciones");
    } finally {
      setOcupado(false);
    }
  }

  async function verificarAutomatico() {
    if (!legajo) return;
    setError(null);
    setAviso(null);
    setOcupado(true);
    try {
      await apiFetch(`/validacion/legajos/${legajo.id}/verificar`, { method: "POST" });
      setAviso("Verificación con organismos ejecutada. Revisá el resultado de cada requisito.");
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falló la verificación automática");
    } finally {
      setOcupado(false);
    }
  }

  async function verificarManual(requisitoId: string, aprobado: boolean) {
    setError(null);
    setAviso(null);
    try {
      await apiFetch(`/validacion/requisitos/${requisitoId}/manual`, {
        method: "POST",
        body: JSON.stringify({
          aprobado,
          fuente: "Constatación manual DI.SE.P.",
          observacion: obsDraft[requisitoId]?.trim() || undefined,
        }),
      });
      await recargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar la verificación manual");
    }
  }

  async function descargar(doc: Documento) {
    setError(null);
    try {
      await apiDownload(`/documentos/${doc.id}/descargar`, doc.nombre);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo descargar el archivo");
    }
  }

  function salir() {
    clearSession();
    window.location.href = "/";
  }

  /* ── Acceso ── */
  if (user === undefined) return null;
  if (user === null || !esUsuarioInterno(user.roles)) {
    return (
      <main>
        <TopBar />
        <div className="wrap" style={{ padding: "56px 20px" }}>
          <div className="card" style={{ maxWidth: 560 }}>
            <h2>Bandeja de trámites</h2>
            <p className="muted">
              Acceso exclusivo del personal de la Dirección de Seguridad Privada (mesa de
              entradas, analistas, inspección y Dirección).
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              {user === null ? (
                <a className="btn" href="/ingresar">Ingresar</a>
              ) : (
                <a className="btn" href="/panel">Ir al panel de mi empresa</a>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  /* ── Lista filtrada ── */
  const q = busqueda.trim().toLowerCase();
  const filas = (prestadores ?? []).flatMap((p) =>
    p.legajos.map((l) => ({ prestador: p, legajo: l })),
  );
  const visibles = filas.filter(({ prestador: p, legajo: l }) => {
    if (filtro !== "todos" && l.estado !== filtro) return false;
    if (q && !p.razonSocial.toLowerCase().includes(q) && !p.cuit.includes(q)) return false;
    return true;
  });
  const estadosPresentes = Array.from(new Set(filas.map((f) => f.legajo.estado)));

  const acciones = legajo ? ACCIONES_BANDEJA[legajo.estado] ?? [] : [];
  const observable = legajo ? ESTADOS_OBSERVABLES.includes(legajo.estado) && puedeObservar : false;

  return (
    <main>
      <TopBar />
      <section className="hero" style={{ padding: "36px 0" }}>
        <div className="wrap" style={{ display: "block", padding: "36px 20px" }}>
          <h1 style={{ fontSize: "1.8rem" }}>Bandeja de trámites</h1>
          <p>
            {user.nombre} · {roles.join(", ")} ·{" "}
            <a onClick={salir} style={{ cursor: "pointer", color: "#c6dcf2", textDecoration: "underline" }}>
              cerrar sesión
            </a>
          </p>
        </div>
      </section>

      <div className="wrap" style={{ padding: "28px 20px 56px" }}>
        {error && <div className="result show invalid" style={{ marginBottom: 16 }}>{error}</div>}
        {aviso && <div className="result show valid" style={{ marginBottom: 16 }}>{aviso}</div>}

        {/* ── Detalle de un legajo ── */}
        {legajo ? (
          <>
            <a onClick={() => setLegajo(null)} style={{ cursor: "pointer" }}>← Volver a la bandeja</a>

            <div className="card" style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ marginBottom: 4 }}>{legajo.prestador.razonSocial}</h2>
                  <p className="muted" style={{ margin: 0 }}>
                    {TIPO_PRESTADOR[legajo.prestador.tipo] ?? legajo.prestador.tipo} · CUIT{" "}
                    {legajo.prestador.cuit} · Período {legajo.periodo}
                  </p>
                  {legajo.prestador.domicilioSocial && (
                    <p className="muted" style={{ margin: "4px 0 0" }}>
                      {legajo.prestador.domicilioSocial}
                      {legajo.prestador.domicilioElectronico ? ` · ${legajo.prestador.domicilioElectronico}` : ""}
                      {legajo.prestador.telefono ? ` · ${legajo.prestador.telefono}` : ""}
                    </p>
                  )}
                </div>
                <span style={{ alignSelf: "center", fontSize: ".95rem" }}>
                  {badge(legajo.estado, ESTADO_LEGAJO)}
                </span>
              </div>

              {/* Acciones del estado */}
              <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {legajo.estado === "VERIFICACION_EXTERNA" && puedeVerificarAuto && (
                  <button className="btn" disabled={ocupado} onClick={verificarAutomatico}>
                    ⇄ Ejecutar verificación con organismos
                  </button>
                )}
                {puedeTransicionar &&
                  acciones
                    .filter((a) => !a.soloDirector || esDirector)
                    .map((a) => (
                      <button
                        key={a.hacia}
                        className={`btn${a.tono === "ok" ? " gold" : ""}`}
                        style={a.tono === "peligro" ? { borderColor: "#d92d20", color: "#d92d20" } : undefined}
                        disabled={ocupado}
                        onClick={() => transicionar(a.hacia, a.label, a.tono === "peligro")}
                      >
                        {a.label}
                      </button>
                    ))}
                {observable && (
                  <button
                    className="btn"
                    style={{ borderColor: "#e0a100", color: "#e0a100" }}
                    disabled={ocupado}
                    onClick={observarSeleccionados}
                  >
                    ⚠ Observar y devolver a la empresa
                  </button>
                )}
              </div>
              {observable && (
                <p className="muted" style={{ marginTop: 8, fontSize: ".85rem" }}>
                  Para observar: escribí el motivo en los requisitos correspondientes y usá
                  “Observar y devolver a la empresa”. El legajo pasa a subsanación.
                </p>
              )}
            </div>

            {/* Requisitos */}
            <div className="card" style={{ padding: 0, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".9rem" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "12px 16px" }}>Requisito</th>
                    <th style={{ padding: "12px 16px" }}>Estado</th>
                    <th style={{ padding: "12px 16px" }}>Verificación</th>
                    <th style={{ padding: "12px 16px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {legajo.requisitos.map((r) => {
                    const ultimaVerif = [...(r.verificaciones ?? [])].sort((a, b) =>
                      b.createdAt.localeCompare(a.createdAt),
                    )[0];
                    return (
                      <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 16px", minWidth: 260 }}>
                          {r.descripcion}
                          {!r.obligatorio && <span className="muted"> (si corresponde)</span>}
                          {r.estado === "OBSERVADO" && r.observacion && (
                            <div style={{ color: "#e0a100", fontSize: ".82rem", marginTop: 4 }}>
                              ⚠ {r.observacion}
                            </div>
                          )}
                          {(r.documentos ?? []).map((d) => (
                            <div key={d.id} style={{ fontSize: ".82rem", marginTop: 4 }}>
                              📄{" "}
                              <a onClick={() => descargar(d)} style={{ cursor: "pointer" }}>
                                {d.nombre}
                              </a>{" "}
                              <span className="muted">v{d.version} · {d.createdAt?.slice(0, 10)}</span>
                            </div>
                          ))}
                          {(observable || puedeManual) && (
                            <input
                              placeholder="Observación / motivo…"
                              value={obsDraft[r.id] ?? ""}
                              onChange={(e) => setObsDraft({ ...obsDraft, [r.id]: e.target.value })}
                              style={{
                                marginTop: 6,
                                width: "100%",
                                padding: "6px 9px",
                                fontSize: ".82rem",
                                borderRadius: 8,
                                border: "1px solid var(--border)",
                                background: "var(--bg)",
                                color: "var(--text)",
                              }}
                            />
                          )}
                        </td>
                        <td style={{ padding: "12px 16px" }}>{badge(r.estado, ESTADO_REQUISITO)}</td>
                        <td style={{ padding: "12px 16px", fontSize: ".82rem" }}>
                          {ultimaVerif ? (
                            <>
                              {ultimaVerif.resultado === "OK" ? "✔" : "✖"} {ultimaVerif.organismo}
                              <div className="muted">
                                {ultimaVerif.fuente ?? "—"} · {ultimaVerif.createdAt?.slice(0, 10)}
                              </div>
                            </>
                          ) : (
                            <span className="muted">{r.organismo ?? "—"}</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                          {puedeManual && r.estado !== "VERIFICADO" && (
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                              <button
                                className="btn"
                                style={{ padding: "6px 12px", fontSize: ".8rem" }}
                                onClick={() => verificarManual(r.id, true)}
                              >
                                ✔ Aprobar
                              </button>
                              <button
                                className="btn"
                                style={{ padding: "6px 12px", fontSize: ".8rem", borderColor: "#d92d20", color: "#d92d20" }}
                                onClick={() => verificarManual(r.id, false)}
                              >
                                ✖
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Resoluciones e historial */}
            {legajo.resoluciones.length > 0 && (
              <div className="card">
                <h3>Resoluciones</h3>
                {legajo.resoluciones.map((res) => (
                  <p key={res.id} style={{ margin: "6px 0" }}>
                    📜 <strong>{res.numero}</strong> · {res.tipo} ·{" "}
                    <span className="muted">{res.createdAt?.slice(0, 10)}</span>
                  </p>
                ))}
              </div>
            )}
            <div className="card">
              <h3>Historial del trámite</h3>
              {legajo.historial.length === 0 && <p className="muted">Sin movimientos.</p>}
              {legajo.historial.map((h) => (
                <p key={h.id} style={{ margin: "6px 0", fontSize: ".9rem" }}>
                  <span className="muted">{h.createdAt?.slice(0, 16).replace("T", " ")}</span> ·{" "}
                  {ESTADO_LEGAJO[h.desde]?.label ?? h.desde} → <strong>{ESTADO_LEGAJO[h.hacia]?.label ?? h.hacia}</strong>
                  {h.observacion && <span className="muted"> — {h.observacion}</span>}
                </p>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* ── Bandeja ── */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
              >
                <option value="todos">Todos los estados</option>
                {estadosPresentes.map((es) => (
                  <option key={es} value={es}>{ESTADO_LEGAJO[es]?.label ?? es}</option>
                ))}
              </select>
              <input
                placeholder="Buscar por razón social o CUIT…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ flex: 1, minWidth: 220, padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
              />
            </div>

            <div className="card" style={{ padding: 0, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".92rem" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "12px 16px" }}>Prestador</th>
                    <th style={{ padding: "12px 16px" }}>Categoría</th>
                    <th style={{ padding: "12px 16px" }}>Período</th>
                    <th style={{ padding: "12px 16px" }}>Estado</th>
                    <th style={{ padding: "12px 16px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map(({ prestador: p, legajo: l }) => (
                    <tr key={l.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 16px" }}>
                        {p.razonSocial}
                        <div className="muted" style={{ fontSize: ".82rem" }}>CUIT {p.cuit}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>{TIPO_PRESTADOR[p.tipo] ?? p.tipo}</td>
                      <td style={{ padding: "12px 16px" }}>{l.periodo}</td>
                      <td style={{ padding: "12px 16px" }}>{badge(l.estado, ESTADO_LEGAJO)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <button className="btn" style={{ padding: "7px 14px", fontSize: ".85rem" }} onClick={() => abrirLegajo(l.id)}>
                          Revisar →
                        </button>
                      </td>
                    </tr>
                  ))}
                  {prestadores !== undefined && visibles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="muted" style={{ padding: "18px 16px" }}>
                        No hay trámites que coincidan con el filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {prestadores === undefined && <p className="muted">Cargando…</p>}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
