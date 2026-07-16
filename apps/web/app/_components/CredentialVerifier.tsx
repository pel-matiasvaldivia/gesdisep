"use client";

import { useEffect, useState, useCallback } from "react";

export interface VerifResult {
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

/** Verificador de credenciales que consulta el endpoint público de la API. */
export default function CredentialVerifier({
  initialToken = "",
  autoRun = false,
}: {
  initialToken?: string;
  autoRun?: boolean;
}) {
  const [token, setToken] = useState(initialToken);
  const [res, setRes] = useState<VerifResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verificar = useCallback(async (value: string) => {
    const t = value.trim();
    if (!t) return;
    setLoading(true);
    setError(null);
    setRes(null);
    try {
      const r = await fetch(`${API}/api/credenciales/verificar/${encodeURIComponent(t)}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setRes((await r.json()) as VerifResult);
    } catch {
      setError("No se pudo consultar el registro. Verificá que la API esté disponible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoRun && initialToken) void verificar(initialToken);
  }, [autoRun, initialToken, verificar]);

  return (
    <div>
      <div className="field">
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token del QR o N° de registro"
          aria-label="Token o número de registro"
          onKeyDown={(e) => e.key === "Enter" && verificar(token)}
        />
        <button className="btn" onClick={() => verificar(token)} disabled={loading}>
          {loading ? "Verificando…" : "Verificar"}
        </button>
      </div>

      {error && <div className="result show invalid">{error}</div>}

      {res && res.valida && (
        <div className="result show valid">
          <strong>✔ Credencial vigente</strong>
          <div style={{ marginTop: 6 }}>
            {res.titular} · {res.funcion} (credencial {res.color})
            <br />
            N° {res.numeroRegistro} · vence {res.vencimiento}
          </div>
        </div>
      )}

      {res && !res.valida && (
        <div className="result show invalid">
          <strong>✖ Credencial no válida</strong>
          <div style={{ marginTop: 6 }}>{res.motivo ?? `Estado: ${res.estado}`}</div>
        </div>
      )}
    </div>
  );
}
