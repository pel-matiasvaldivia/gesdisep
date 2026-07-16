import Link from "next/link";
import TopBar from "./_components/TopBar";
import Footer from "./_components/Footer";
import CredentialVerifier from "./_components/CredentialVerifier";

const requisitos: { titulo: string; color: string; items: string[] }[] = [
  {
    titulo: "Empresa de Seguridad Privada Humana",
    color: "#0e4d8b",
    items: [
      "Sociedad constituida (Ley 19.550 / SAS 27.349)",
      "Contrato social inscripto en Personas Jurídicas",
      "Razón social, domicilio electrónico, CUIT y teléfono",
      "Datos del órgano de dirección (DNI, CUIL, domicilio)",
      "Antecedentes penales de directores y propietarios",
      "Huellas y tomas genéticas (Ley 8611)",
      "Seguro de caución a favor del Ministerio",
      "Seguro de responsabilidad civil contra terceros",
      "Seguro ART",
      "Inscripción AFIP, ATM, obra social y habilitación municipal",
      "Pago de la tasa anual",
      "Declaración de vehículos afectados",
      "Designación de Director Técnico",
      "Inscripción en ANMaC (si usa armas de fuego)",
      "Sede/local de uso exclusivo habilitado",
    ],
  },
  {
    titulo: "Seguridad Privada Interna",
    color: "#e0b000",
    items: [
      "Nota de solicitud con datos y domicilio electrónico",
      "Estatuto y resolución de Personas Jurídicas (si es PJ)",
      "Nómina de trabajadores + Formulario 931 AFIP",
      "Copia del DNI del solicitante",
      "Certificado de antecedentes penales",
      "Pago de la tasa anual diferenciada",
      "Libro de objetivos autorizado",
      "Seguro de RC y de caución (si es PJ)",
      "Director Técnico si supera 5 vigiladores simultáneos",
      "Personal habilitado y capacitado",
    ],
  },
  {
    titulo: "Seguridad Privada Tecnológica",
    color: "#7c3aed",
    items: [
      "Inscripción AFIP y ATM",
      "Datos personales y domicilio electrónico",
      "Certificado de antecedentes penales",
      "Formulario 931 AFIP (si corresponde)",
      "Pago de tasa anual",
      "Responsable técnico con título afín o idoneidad",
      "Seguro de caución (si es PJ)",
      "Protocolos de actuación ante eventos/alarmas",
      "Contrato social inscripto (si es PJ)",
      "Capacitación e idoneidad del personal",
    ],
  },
  {
    titulo: "Personal — Vigiladores",
    color: "#2e7dd1",
    items: [
      "Argentino o residencia precaria autorizada",
      "Secundario completo",
      "Mayor de 18 años",
      "Residencia en Mendoza",
      "Aptitud psico-física (55+: cada 4 años)",
      "Capacitación básica y por especialidad (cada 5 años)",
      "Certificado de reincidencia penal",
      "Sin antecedentes que afecten la idoneidad",
      "No pertenecer a FFAA/FFSS/policía en actividad",
      "Huellas y tomas genéticas (Ley 8611)",
    ],
  },
];

const creds: { label: string; sub: string; color: string }[] = [
  { label: "Director Técnico / Supervisor", sub: "Credencial blanca", color: "#f8fafc" },
  { label: "Vigilador Bombero", sub: "Credencial roja", color: "#d92d20" },
  { label: "Eventos Deportivos", sub: "Credencial verde", color: "#1f9d55" },
  { label: "Diversión Nocturna", sub: "Credencial negra", color: "#111827" },
  { label: "Vigilador General", sub: "Credencial azul", color: "#2e7dd1" },
  { label: "Seguridad Interna", sub: "Credencial amarilla", color: "#eab308" },
  { label: "Instalación / Monitoreo", sub: "Credencial violeta", color: "#7c3aed" },
  { label: "Verificá por QR", sub: "Autenticidad y vigencia", color: "linear-gradient(135deg,#0b3d6e,#2e7dd1)" },
];

export default function Home() {
  return (
    <main>
      <TopBar />

      <div className="hero">
        <div className="wrap">
          <div>
            <span className="badge">● Ley N° 9578 · Decreto N° 264/2025</span>
            <h1>Registro Provincial de Prestadores de Seguridad Privada</h1>
            <p>
              Gestioná en línea la habilitación de empresas de seguridad <strong>humana, interna y
              tecnológica</strong> y de tu personal habilitado. Carga documental, validación con
              organismos y credenciales verificables por QR.
            </p>
            <div className="hero-cta">
              <Link href="#requisitos" className="btn gold">
                Ver requisitos →
              </Link>
              <Link
                href="/verificar"
                className="btn ghost"
                style={{ color: "#eaf2fb", borderColor: "rgba(255,255,255,.3)" }}
              >
                Verificar credencial
              </Link>
            </div>
            <div className="stats">
              <div>
                <b>3</b>
                <span>Categorías de prestador</span>
              </div>
              <div>
                <b>7</b>
                <span>Tipos de credencial</span>
              </div>
              <div>
                <b>100%</b>
                <span>Trámite digital</span>
              </div>
            </div>
          </div>
          <div className="verify-card">
            <h3>🔎 Verificar una credencial</h3>
            <p className="muted" style={{ fontSize: ".9rem", margin: ".2em 0 0" }}>
              Ingresá el token del QR o el número de registro para comprobar su autenticidad y
              vigencia.
            </p>
            <div className="qr">▦ Escaneá el código QR</div>
            <CredentialVerifier />
          </div>
        </div>
      </div>

      {/* CATEGORÍAS */}
      <section id="categorias" className="wrap">
        <div className="eyebrow">Sujetos regulados</div>
        <h2>Tres categorías de prestador</h2>
        <p className="lead">
          Según la actividad, cada prestador se inscribe en una categoría con requisitos propios. El
          sistema te guía con un checklist específico.
        </p>
        <div className="grid g3" style={{ marginTop: 32 }}>
          <div className="card">
            <div className="ic">👮</div>
            <span className="tag">Art. 7 · 11 · 12</span>
            <h3>Seguridad Privada Humana</h3>
            <p>
              Empresas de vigilancia, custodias personales y de mercadería, investigación, locales
              bailables, seguridad nocturna y eventos masivos.
            </p>
          </div>
          <div className="card">
            <div className="ic">🏢</div>
            <span className="tag">Art. 8 · 13 · 14</span>
            <h3>Seguridad Privada Interna</h3>
            <p>
              Comercios, industrias y consorcios con personal propio para fines propios. Hasta 30
              vigiladores; no puede prestar servicios a terceros.
            </p>
          </div>
          <div className="card">
            <div className="ic">📡</div>
            <span className="tag">Art. 9 · 15</span>
            <h3>Seguridad Privada Tecnológica</h3>
            <p>
              Instalación y mantenimiento de alarmas y videovigilancia, y monitoreo remoto de
              objetivos fijos y móviles. Requiere responsable técnico y protocolos.
            </p>
          </div>
        </div>
      </section>

      {/* REQUISITOS */}
      <section
        id="requisitos"
        style={{ background: "linear-gradient(180deg,transparent,rgba(46,125,209,.05))" }}
      >
        <div className="wrap">
          <div className="eyebrow">Documentación</div>
          <h2>¿Qué tenés que presentar?</h2>
          <p className="lead">
            Reuní esta documentación antes de iniciar el trámite. El sistema verifica automáticamente
            lo que puede contra AFIP, ATM, Personas Jurídicas, Reincidencia y RENAPER.
          </p>
          <div style={{ marginTop: 30 }}>
            {requisitos.map((r, i) => (
              <details key={r.titulo} open={i === 0}>
                <summary>
                  <span className="dot" style={{ background: r.color }} /> {r.titulo}
                  <span className="chev">›</span>
                </summary>
                <div className="det-body">
                  <ul>
                    {r.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
          <div className="note">
            ⚠️ Esta guía es orientativa y se basa en la Ley N° 9578 y el Decreto N° 264/2025. La
            documentación definitiva y las tasas vigentes las determina la Autoridad de Aplicación
            (Ministerio de Seguridad y Justicia — DI.SE.P.).
          </div>
        </div>
      </section>

      {/* TRÁMITE */}
      <section id="tramite" className="wrap">
        <div className="eyebrow">Cómo funciona</div>
        <h2>El trámite, paso a paso</h2>
        <p className="lead">
          Un flujo digital con perfiles por etapa: desde el registro de la empresa hasta la
          resolución de habilitación y la emisión de credenciales.
        </p>
        <div className="steps" style={{ marginTop: 36 }}>
          {[
            ["Registro", "Creás tu cuenta y el legajo de la empresa o persona."],
            ["Carga documental", "Subís la documentación según tu categoría con un checklist guiado."],
            ["Validación", "Verificación automática con organismos y revisión del analista. Si falta algo, se observa para subsanar."],
            ["Habilitación", "Inspección si corresponde, resolución de la Dirección y emisión de credenciales con QR."],
          ].map(([t, d], i) => (
            <div className="step" key={t}>
              <div className="num">{i + 1}</div>
              <h4>{t}</h4>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CREDENCIALES */}
      <section style={{ background: "linear-gradient(180deg,transparent,rgba(46,125,209,.05))" }}>
        <div className="wrap">
          <div className="eyebrow">Credenciales habilitantes</div>
          <h2>Un color por función</h2>
          <p className="lead">
            Vigencia de 2 años, con QR de verificación, holograma y elementos de seguridad. La
            credencial de Vigilador Bombero incluye general, nocturna y eventos deportivos.
          </p>
          <div className="creds" style={{ marginTop: 30 }}>
            {creds.map((c) => (
              <div className="cred" key={c.label}>
                <span className="swatch" style={{ background: c.color }} />
                <div>
                  <b>{c.label}</b>
                  <span>{c.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="wrap">
        <div className="band">
          <div className="inner">
            <div>
              <h2>¿Listo para registrar tu empresa?</h2>
              <p>
                Ingresá con tu identidad provincial, cargá la documentación y seguí el estado de tu
                trámite en línea.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/verificar" className="btn gold">
                Verificar credencial
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
