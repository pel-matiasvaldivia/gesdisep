import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <span className="badge" style={{ background: "rgba(255,255,255,.15)", color: "#eaf2fb" }}>
            Ley N° 9578 · Decreto N° 264/2025
          </span>
          <h1>Registro Provincial de Prestadores de Seguridad Privada</h1>
          <p>
            Gestioná la habilitación de empresas de seguridad humana, interna y tecnológica y de tu
            personal habilitado. Validación con organismos y credenciales verificables por QR.
          </p>
          <p style={{ marginTop: 24 }}>
            <Link className="btn" href="/verificar">
              Verificar una credencial →
            </Link>
          </p>
        </div>
      </section>

      <div className="wrap">
        <div className="grid" style={{ marginTop: 28 }}>
          <div className="card">
            <h3>👮 Seguridad Humana</h3>
            <p className="muted">Empresas de vigilancia, custodias, investigación y eventos.</p>
          </div>
          <div className="card">
            <h3>🏢 Seguridad Interna</h3>
            <p className="muted">Personal propio para fines propios (hasta 30 vigiladores).</p>
          </div>
          <div className="card">
            <h3>📡 Seguridad Tecnológica</h3>
            <p className="muted">Alarmas, videovigilancia y monitoreo remoto.</p>
          </div>
        </div>

        <div className="card">
          <h2>¿Qué necesitás para registrarte?</h2>
          <p className="muted">
            La documentación requerida depende de tu categoría (contrato social, seguros,
            antecedentes penales, inscripciones AFIP/ATM, tasa anual, entre otros). Consultá la guía
            completa en el repositorio (<code>docs/03-guia-presentacion.md</code>) o la landing
            informativa (<code>landing/index.html</code>).
          </p>
        </div>
      </div>
    </main>
  );
}
