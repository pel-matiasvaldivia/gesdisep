import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "GESDISEP — Registro Provincial de Prestadores de Seguridad Privada (Mendoza)",
  description:
    "Portal del Registro Provincial de Prestadores de Seguridad Privada (Ley 9578 / Decreto 264/2025).",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-AR">
      <body>
        <header className="topbar">
          <div className="wrap">
            <div className="crest">🛡️</div>
            <div className="brand">
              <b>GESDISEP</b>
              <small>Dirección de Seguridad Privada · Mendoza</small>
            </div>
          </div>
        </header>
        {children}
        <footer>
          <div className="wrap">
            Prototipo · Registro Provincial de Prestadores de Seguridad Privada — Ley N° 9578 /
            Decreto N° 264/2025. Contenido orientativo, no constituye notificación oficial.
          </div>
        </footer>
      </body>
    </html>
  );
}
