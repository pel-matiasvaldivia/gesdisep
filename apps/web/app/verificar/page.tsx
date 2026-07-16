import TopBar from "../_components/TopBar";
import Footer from "../_components/Footer";
import CredentialVerifier from "../_components/CredentialVerifier";

export default function Verificar() {
  return (
    <main>
      <TopBar />
      <section className="hero" style={{ padding: "40px 0" }}>
        <div className="wrap" style={{ display: "block", padding: "40px 20px" }}>
          <h1 style={{ fontSize: "2rem" }}>Verificar credencial</h1>
          <p>
            Ingresá el token del QR o el número de registro para comprobar su autenticidad y
            vigencia.
          </p>
        </div>
      </section>
      <div className="wrap">
        <div className="card" style={{ maxWidth: 620 }}>
          <CredentialVerifier />
        </div>
      </div>
      <Footer />
    </main>
  );
}
