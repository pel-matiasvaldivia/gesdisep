import TopBar from "../../_components/TopBar";
import Footer from "../../_components/Footer";
import CredentialVerifier from "../../_components/CredentialVerifier";

/**
 * Ruta de destino del QR de las credenciales
 * (PUBLIC_VERIFY_URL = http://host/verificar/<token>).
 * Verifica automáticamente el token escaneado.
 */
export default function VerificarToken({ params }: { params: { token: string } }) {
  return (
    <main>
      <TopBar />
      <section className="hero" style={{ padding: "40px 0" }}>
        <div className="wrap" style={{ display: "block", padding: "40px 20px" }}>
          <h1 style={{ fontSize: "2rem" }}>Verificación de credencial</h1>
          <p>Resultado de la credencial escaneada.</p>
        </div>
      </section>
      <div className="wrap">
        <div className="card" style={{ maxWidth: 620 }}>
          <CredentialVerifier initialToken={decodeURIComponent(params.token)} autoRun />
        </div>
      </div>
      <Footer />
    </main>
  );
}
