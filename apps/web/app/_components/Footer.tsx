import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="cols">
          <div>
            <div className="brand" style={{ marginBottom: 12 }}>
              <div className="crest">🛡️</div>
              <div>
                GESDISEP
                <br />
                <small>Registro Provincial de Prestadores de Seguridad Privada</small>
              </div>
            </div>
            <p style={{ maxWidth: "44ch" }}>
              Sistema de gestión del registro conforme a la Ley N° 9578 y su Decreto Reglamentario
              N° 264/2025. Dirección de Seguridad Privada (DI.SE.P.) — Ministerio de Seguridad y
              Justicia de Mendoza.
            </p>
          </div>
          <div>
            <h5>Trámites</h5>
            <Link href="/#categorias">Categorías de prestador</Link>
            <Link href="/#requisitos">Requisitos y documentación</Link>
            <Link href="/#tramite">Etapas del trámite</Link>
            <Link href="/verificar">Verificar credencial</Link>
          </div>
          <div>
            <h5>Normativa</h5>
            <span>Ley N° 9578</span>
            <span>Decreto N° 264/2025</span>
            <span>Ley 25.326 (Datos Personales)</span>
          </div>
        </div>
        <p style={{ marginTop: 26, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          Prototipo demostrativo · Contenido orientativo, no constituye notificación oficial. ©
          Gobierno de Mendoza.
        </p>
      </div>
    </footer>
  );
}
