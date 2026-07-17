"use client";

import { useEffect, useState } from "react";
import TopBar from "../_components/TopBar";
import Footer from "../_components/Footer";
import { apiFetch } from "../../lib/api";
import { ESTADO_LEGAJO, GRUPOS_PADRON, TIPO_PRESTADOR } from "../../lib/estados";

interface Fila {
  razonSocial: string;
  cuit: string;
  tipo: string;
  estado: string;
  grupo: string;
  periodo: number;
  actualizado: string;
}

export default function Padron() {
  const [grupo, setGrupo] = useState("todas");
  const [filas, setFilas] = useState<Fila[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    setFilas(null);
    setError(null);
    apiFetch<{ prestadores: Fila[] }>(`/publico/padron?grupo=${grupo}`)
      .then((r) => setFilas(r.prestadores))
      .catch(() => setError("No se pudo consultar el padrón. Intentá nuevamente."));
  }, [grupo]);

  const visibles = (filas ?? []).filter(
    (f) =>
      !busqueda ||
      f.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
      f.cuit.includes(busqueda),
  );

  return (
    <main>
      <TopBar />
      <section className="hero" style={{ padding: "40px 0" }}>
        <div className="wrap" style={{ display: "block", padding: "40px 20px" }}>
          <h1 style={{ fontSize: "2rem" }}>Padrón público de prestadores</h1>
          <p>
            Consultá qué empresas están habilitadas, cuáles tienen su trámite en curso y cuáles
            fueron suspendidas o dadas de baja del Registro.
          </p>
        </div>
      </section>

      <div className="wrap" style={{ padding: "28px 20px 56px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {GRUPOS_PADRON.map((g) => (
            <button
              key={g.valor}
              className="btn"
              onClick={() => setGrupo(g.valor)}
              style={
                grupo === g.valor
                  ? {}
                  : { background: "transparent", color: "var(--text)", border: "1px solid var(--border)" }
              }
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="field" style={{ maxWidth: 420, marginBottom: 18 }}>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por razón social o CUIT"
            aria-label="Buscar prestador"
          />
        </div>

        {error && <div className="result show invalid">{error}</div>}
        {!error && filas === null && <p className="muted">Cargando padrón…</p>}

        {filas !== null && (
          <div className="card" style={{ padding: 0, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".92rem" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "12px 16px" }}>Razón social</th>
                  <th style={{ padding: "12px 16px" }}>CUIT</th>
                  <th style={{ padding: "12px 16px" }}>Categoría</th>
                  <th style={{ padding: "12px 16px" }}>Estado</th>
                  <th style={{ padding: "12px 16px" }}>Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="muted" style={{ padding: "18px 16px" }}>
                      No hay prestadores para mostrar con este filtro.
                    </td>
                  </tr>
                )}
                {visibles.map((f) => {
                  const e = ESTADO_LEGAJO[f.estado] ?? { label: f.estado, color: "#8a94a6" };
                  return (
                    <tr key={f.cuit} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{f.razonSocial}</td>
                      <td style={{ padding: "12px 16px" }}>{f.cuit}</td>
                      <td style={{ padding: "12px 16px" }}>{TIPO_PRESTADOR[f.tipo] ?? f.tipo}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          className="badge"
                          style={{ background: `${e.color}22`, color: e.color, border: `1px solid ${e.color}` }}
                        >
                          {e.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }} className="muted">
                        {f.actualizado}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="note">
          El padrón se publica a los fines del Art. 4 y 18 inc. f) de la Ley N° 9578. Para verificar
          una credencial individual usá el <a href="/verificar">verificador por QR</a>.
        </p>
      </div>
      <Footer />
    </main>
  );
}
