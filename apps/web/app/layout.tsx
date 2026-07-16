import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "GESDISEP — Registro Provincial de Prestadores de Seguridad Privada (Mendoza)",
  description:
    "Portal del Registro Provincial de Prestadores de Seguridad Privada Humana, Interna y Tecnológica de Mendoza (Ley 9578 / Decreto 264/2025). Guía de requisitos y verificación de credenciales.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
