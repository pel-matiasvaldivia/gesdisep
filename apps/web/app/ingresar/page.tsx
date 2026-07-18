"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "../_components/TopBar";
import Footer from "../_components/Footer";
import { apiFetch, setSession, SessionUser } from "../../lib/api";
import { esUsuarioInterno } from "../../lib/estados";

export default function Ingresar() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function enviar() {
    setError(null);
    setLoading(true);
    try {
      const r = await apiFetch<{ accessToken: string; user: SessionUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSession(r.accessToken, r.user);
      router.push(esUsuarioInterno(r.user.roles) ? "/bandeja" : "/panel");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <TopBar />
      <section className="hero" style={{ padding: "40px 0" }}>
        <div className="wrap" style={{ display: "block", padding: "40px 20px" }}>
          <h1 style={{ fontSize: "2rem" }}>Ingresar</h1>
          <p>Accedé al panel de tu empresa para seguir el estado del trámite.</p>
        </div>
      </section>
      <div className="wrap" style={{ padding: "28px 20px 56px" }}>
        <div className="card" style={{ maxWidth: 480 }}>
          <label className="muted">Email</label>
          <div className="field"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <label className="muted" style={{ marginTop: 12, display: "block" }}>Contraseña</label>
          <div className="field"><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} onKeyDown={(e) => e.key === "Enter" && enviar()} /></div>
          {error && <div className="result show invalid">{error}</div>}
          <div style={{ marginTop: 18, display: "flex", gap: 12, alignItems: "center" }}>
            <button className="btn" onClick={enviar} disabled={loading}>
              {loading ? "Ingresando…" : "Ingresar →"}
            </button>
            <a href="/registro">Crear una cuenta</a>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
