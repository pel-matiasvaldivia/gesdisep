"use client";

import { useState } from "react";

interface VerifResult {
  valida: boolean;
  motivo?: string;
  titular?: string;
  funcion?: string;
  color?: string;
  numeroRegistro?: string;
  vencimiento?: string;
  estado?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function Verificar() {
  const [token, setToken] = useState("");
  const [res, setRes] = useState<VerifResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verificar() {
    if (!token.trim()) return;
    setLoading(true);
    setError(null);
    setRes(null);
    try {
      const r = await fetch(`${API}/api/credenciales/verificar/${encodeURIComponent(token.trim())}`);
      if (!r.ok) throw new Error(`Error ${r.status}`);
      setRes(await r.json());
    } catch (e) {
      setError("No se pudo consultar el registro. Verificá que la API esté disponible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="hero" style={{ padding: "40px 0" }}>
        <div className="wrap">
          <h1>Verificar credencial</h1>
          <p>Ingresá el token del QR o el número de registro para comprobar su autenticidad y vigencia.</p>
        </div>
      </section>

      <div className="wrap">
        <div className="card">
          <div className="field">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token del QR (ej. 3f9c...e1.ab12...)"
              onKeyDown={(e) => e.key === "Enter" && verificar()}
            />
            <button className="btn" onClick={verificar} disabled={loading}>
              {loading ? "Verificando…" : "Verificar"}
            </button>
          </div>

          {error && <div className="result err">{error}</div>}

          {res && res.valida && (
            <div className="result ok">
              <strong>✔ Credencial vigente</strong>
              <ul>
                <li>Titular: {res.titular}</li>
                <li>Función: {res.funcion} (credencial {res.color})</li>
                <li>N° de registro: {res.numeroRegistro}</li>
                <li>Vence: {res.vencimiento}</li>
              </ul>
            </div>
          )}

          {res && !res.valida && (
            <div className="result err">
              <strong>✖ Credencial no válida</strong>
              <p>{res.motivo ?? `Estado: ${res.estado}`}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
