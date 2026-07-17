"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "../_components/TopBar";
import Footer from "../_components/Footer";
import { apiFetch, setSession, SessionUser } from "../../lib/api";

export default function Registro() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function enviar() {
    setError(null);
    setLoading(true);
    try {
      const r = await apiFetch<{ accessToken: string; user: SessionUser }>("/auth/registro", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSession(r.accessToken, r.user);
      router.push("/panel");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <TopBar />
      <section className="hero" style={{ padding: "40px 0" }}>
        <div className="wrap" style={{ display: "block", padding: "40px 20px" }}>
          <h1 style={{ fontSize: "2rem" }}>Crear cuenta</h1>
          <p>Registrá un usuario para iniciar el trámite de habilitación de tu empresa.</p>
        </div>
      </section>
      <div className="wrap" style={{ padding: "28px 20px 56px" }}>
        <div className="card" style={{ maxWidth: 480 }}>
          <label className="muted">Nombre y apellido</label>
          <div className="field"><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Juan Pérez" /></div>
          <label className="muted" style={{ marginTop: 12, display: "block" }}>Email (será tu domicilio electrónico de acceso)</label>
          <div className="field"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="empresa@dominio.com" /></div>
          <label className="muted" style={{ marginTop: 12, display: "block" }}>Contraseña (mínimo 8 caracteres)</label>
          <div className="field"><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} onKeyDown={(e) => e.key === "Enter" && enviar()} /></div>
          {error && <div className="result show invalid">{error}</div>}
          <div style={{ marginTop: 18, display: "flex", gap: 12, alignItems: "center" }}>
            <button className="btn gold" onClick={enviar} disabled={loading}>
              {loading ? "Creando…" : "Crear cuenta →"}
            </button>
            <a href="/ingresar">Ya tengo cuenta</a>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
