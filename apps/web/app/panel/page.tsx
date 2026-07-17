"use client";

import { useCallback, useEffect, useState } from "react";
import TopBar from "../_components/TopBar";
import Footer from "../_components/Footer";
import { apiDownload, apiFetch, apiUpload, clearSession, getToken, getUser, SessionUser } from "../../lib/api";
import { ESTADO_LEGAJO, ESTADO_REQUISITO, PASOS_TRAMITE, TIPO_PRESTADOR } from "../../lib/estados";

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
  documentos?: Documento[];
}
interface Legajo {
  id: string;
  estado: string;
  periodo: number;
  requisitos: Requisito[];
}
interface Prestador {
  id: string;
  tipo: string;
  razonSocial: string;
  cuit: string;
  legajos: Legajo[];
}

const FORM_INICIAL = {
  tipo: "HUMANA",
  tipoPersona: "PERSONA_JURIDICA",
  razonSocial: "",
  cuit: "",
  domicilioSocial: "",
  domicilioElectronico: "",
  telefono: "",
};

export default function Panel() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [prestador, setPrestador] = useState<Prestador | null | undefined>(undefined);
  const [form, setForm] = useState(FORM_INICIAL);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const p = await apiFetch<Prestador>("/prestadores/mi");
      setPrestador(p);
    } catch {
      setPrestador(null); // aún no registró su empresa
    }
  }, []);

  useEffect(() => {
    const u = getToken() ? getUser() : null;
    setUser(u);
    if (u) void cargar();
  }, [cargar]);

  async function crearPrestador() {
    setError(null);
    setOcupado(true);
    try {
      await apiFetch("/prestadores", { method: "POST", body: JSON.stringify(form) });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar la empresa");
    } finally {
      setOcupado(false);
    }
  }

  async function presentarRequisito(legajoId: string, requisitoId: string) {
    setError(null);
    try {
      await apiFetch(`/legajos/${legajoId}/requisitos/${requisitoId}/presentar`, { method: "POST" });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar el requisito");
    }
  }

  async function subirDocumento(legajoId: string, requisitoId: string, archivo: File) {
    setError(null);
    setAviso(null);
    try {
      await apiUpload(`/legajos/${legajoId}/requisitos/${requisitoId}/documentos`, archivo);
      setAviso(`Documento "${archivo.name}" cargado correctamente.`);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir el archivo");
    }
  }

  async function descargarDocumento(doc: Documento) {
    setError(null);
    try {
      await apiDownload(`/documentos/${doc.id}/descargar`, doc.nombre);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo descargar el archivo");
    }
  }

  async function transicionar(legajoId: string, hacia: string, mensajeOk: string) {
    setError(null);
    setAviso(null);
    setOcupado(true);
    try {
      await apiFetch(`/legajos/${legajoId}/transicion`, {
        method: "POST",
        body: JSON.stringify({ hacia }),
      });
      setAviso(mensajeOk);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo avanzar el trámite");
    } finally {
      setOcupado(false);
    }
  }

  function salir() {
    clearSession();
    window.location.href = "/";
  }

  /* ── Sin sesión ── */
  if (user === undefined) return null;
  if (user === null) {
    return (
      <main>
        <TopBar />
        <div className="wrap" style={{ padding: "56px 20px" }}>
          <div className="card" style={{ maxWidth: 520 }}>
            <h2>Panel de empresa</h2>
            <p className="muted">Necesitás una cuenta para gestionar el trámite de habilitación.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              <a className="btn" href="/ingresar">Ingresar</a>
              <a className="btn gold" href="/registro">Crear cuenta</a>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const legajo = prestador?.legajos?.[0];
  const obligatoriosPendientes =
    legajo?.requisitos.filter((r) => r.obligatorio && r.estado === "PENDIENTE").length ?? 0;
  const pasoActual = legajo ? PASOS_TRAMITE.indexOf(legajo.estado as (typeof PASOS_TRAMITE)[number]) : -1;
  const estadoMeta = legajo ? ESTADO_LEGAJO[legajo.estado] ?? { label: legajo.estado, color: "#8a94a6" } : null;

  return (
    <main>
      <TopBar />
      <section className="hero" style={{ padding: "36px 0" }}>
        <div className="wrap" style={{ display: "block", padding: "36px 20px" }}>
          <h1 style={{ fontSize: "1.8rem" }}>Panel de empresa</h1>
          <p>
            {user.nombre} · <a onClick={salir} style={{ cursor: "pointer", color: "#c6dcf2", textDecoration: "underline" }}>cerrar sesión</a>
          </p>
        </div>
      </section>

      <div className="wrap" style={{ padding: "28px 20px 56px" }}>
        {error && <div className="result show invalid" style={{ marginBottom: 16 }}>{error}</div>}
        {aviso && <div className="result show valid" style={{ marginBottom: 16 }}>{aviso}</div>}

        {/* ── Paso 0: registrar la empresa ── */}
        {prestador === null && (
          <div className="card" style={{ maxWidth: 640 }}>
            <h2>Registrar mi empresa</h2>
            <p className="muted">
              Completá los datos básicos. Al crear el legajo se genera el checklist de requisitos de
              tu categoría según la Ley N° 9578.
            </p>
            <label className="muted" style={{ marginTop: 14, display: "block" }}>Categoría</label>
            <div className="field">
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                style={{ flex: 1, padding: "11px 13px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
              >
                <option value="HUMANA">Seguridad Privada Humana</option>
                <option value="INTERNA">Seguridad Privada Interna</option>
                <option value="TECNOLOGICA">Seguridad Privada Tecnológica</option>
              </select>
              <select
                value={form.tipoPersona}
                onChange={(e) => setForm({ ...form, tipoPersona: e.target.value })}
                style={{ flex: 1, padding: "11px 13px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
              >
                <option value="PERSONA_JURIDICA">Persona jurídica</option>
                <option value="PERSONA_HUMANA">Persona humana</option>
              </select>
            </div>
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Razón social</label>
            <div className="field"><input value={form.razonSocial} onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} /></div>
            <label className="muted" style={{ marginTop: 12, display: "block" }}>CUIT</label>
            <div className="field"><input value={form.cuit} onChange={(e) => setForm({ ...form, cuit: e.target.value })} placeholder="30-12345678-9" /></div>
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Domicilio social</label>
            <div className="field"><input value={form.domicilioSocial} onChange={(e) => setForm({ ...form, domicilioSocial: e.target.value })} /></div>
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Domicilio electrónico (email de notificaciones)</label>
            <div className="field"><input type="email" value={form.domicilioElectronico} onChange={(e) => setForm({ ...form, domicilioElectronico: e.target.value })} /></div>
            <label className="muted" style={{ marginTop: 12, display: "block" }}>Teléfono</label>
            <div className="field"><input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
            <button className="btn gold" style={{ marginTop: 18 }} onClick={crearPrestador} disabled={ocupado}>
              {ocupado ? "Creando…" : "Crear legajo →"}
            </button>
          </div>
        )}

        {/* ── Legajo y workflow ── */}
        {prestador && legajo && estadoMeta && (
          <>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ marginBottom: 4 }}>{prestador.razonSocial}</h2>
                  <p className="muted" style={{ margin: 0 }}>
                    {TIPO_PRESTADOR[prestador.tipo] ?? prestador.tipo} · CUIT {prestador.cuit} · Período {legajo.periodo}
                  </p>
                </div>
                <span className="badge" style={{ background: `${estadoMeta.color}22`, color: estadoMeta.color, border: `1px solid ${estadoMeta.color}`, alignSelf: "center", fontSize: ".9rem" }}>
                  {estadoMeta.label}
                </span>
              </div>

              {/* Stepper */}
              <div style={{ display: "flex", gap: 4, marginTop: 22, flexWrap: "wrap" }}>
                {PASOS_TRAMITE.map((p, i) => {
                  const meta = ESTADO_LEGAJO[p];
                  const alcanzado = pasoActual >= 0 ? i <= pasoActual : legajo.estado === "HABILITADA";
                  return (
                    <div key={p} style={{ flex: 1, minWidth: 110 }}>
                      <div style={{ height: 6, borderRadius: 3, background: alcanzado ? "var(--celeste)" : "var(--border)" }} />
                      <small style={{ color: alcanzado ? "var(--text)" : "var(--muted)", fontWeight: i === pasoActual ? 700 : 400 }}>
                        {meta.label}
                      </small>
                    </div>
                  );
                })}
              </div>

              {/* Acciones del estado */}
              <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
                {legajo.estado === "BORRADOR" && (
                  <button
                    className="btn gold"
                    disabled={ocupado || obligatoriosPendientes > 0}
                    onClick={() => transicionar(legajo.id, "PRESENTADA", "Solicitud presentada. La Dirección revisará tu documentación.")}
                    title={obligatoriosPendientes > 0 ? `Faltan ${obligatoriosPendientes} requisitos obligatorios` : ""}
                  >
                    Presentar solicitud →
                  </button>
                )}
                {legajo.estado === "OBSERVADA" && (
                  <button
                    className="btn gold"
                    disabled={ocupado}
                    onClick={() => transicionar(legajo.id, "EN_REVISION_DOCUMENTAL", "Subsanación enviada a revisión.")}
                  >
                    Enviar subsanación →
                  </button>
                )}
                {legajo.estado === "BORRADOR" && obligatoriosPendientes > 0 && (
                  <span className="muted" style={{ alignSelf: "center" }}>
                    Marcá como presentados los {obligatoriosPendientes} requisitos obligatorios pendientes para poder presentar.
                  </span>
                )}
              </div>
            </div>

            {/* Checklist */}
            <div className="card" style={{ padding: 0, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".92rem" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "12px 16px" }}>Requisito</th>
                    <th style={{ padding: "12px 16px" }}>Estado</th>
                    <th style={{ padding: "12px 16px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {legajo.requisitos.map((r) => {
                    const e = ESTADO_REQUISITO[r.estado] ?? { label: r.estado, color: "#8a94a6" };
                    const accionable = ["PENDIENTE", "OBSERVADO", "VENCIDO"].includes(r.estado);
                    return (
                      <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 16px" }}>
                          {r.descripcion}
                          {!r.obligatorio && <span className="muted"> (si corresponde)</span>}
                          {r.estado === "OBSERVADO" && r.observacion && (
                            <div style={{ color: "#e0a100", fontSize: ".84rem", marginTop: 4 }}>⚠ {r.observacion}</div>
                          )}
                          {(r.documentos ?? []).map((d) => (
                            <div key={d.id} style={{ fontSize: ".84rem", marginTop: 4 }}>
                              📄{" "}
                              <a onClick={() => descargarDocumento(d)} style={{ cursor: "pointer" }}>
                                {d.nombre}
                              </a>{" "}
                              <span className="muted">
                                v{d.version} · {d.createdAt?.slice(0, 10)}
                              </span>
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span className="badge" style={{ background: `${e.color}22`, color: e.color, border: `1px solid ${e.color}` }}>
                            {e.label}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <label className="btn" style={{ padding: "7px 14px", fontSize: ".85rem" }}>
                            📎 Subir documento
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                              style={{ display: "none" }}
                              onChange={(ev) => {
                                const archivo = ev.target.files?.[0];
                                ev.target.value = "";
                                if (archivo) void subirDocumento(legajo.id, r.id, archivo);
                              }}
                            />
                          </label>
                          {accionable && (
                            <div>
                              <a
                                className="muted"
                                style={{ fontSize: ".78rem", cursor: "pointer" }}
                                onClick={() => presentarRequisito(legajo.id, r.id)}
                              >
                                marcar presentado sin archivo
                              </a>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="note">
              Subí la documentación digitalizada en PDF, JPG o PNG (máximo 10 MB por archivo). Cada
              nueva carga genera una versión nueva sin borrar las anteriores. Al subir un archivo el
              requisito queda marcado como presentado.
            </p>
          </>
        )}

        {prestador === undefined && <p className="muted">Cargando…</p>}
      </div>
      <Footer />
    </main>
  );
}
