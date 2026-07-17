"use client";

import Link from "next/link";

/** Barra superior con navegación y alternador de tema claro/oscuro. */
export default function TopBar() {
  function toggleTheme() {
    const root = document.documentElement;
    const cur = root.getAttribute("data-theme");
    const isDark = cur
      ? cur === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", isDark ? "light" : "dark");
  }

  return (
    <header className="topbar">
      <div className="wrap">
        <Link className="brand" href="/" style={{ color: "inherit" }}>
          <div className="crest">🛡️</div>
          <div>
            GESDISEP
            <br />
            <small>Dirección de Seguridad Privada · Mendoza</small>
          </div>
        </Link>
        <nav className="nav">
          <Link href="/#categorias">Categorías</Link>
          <Link href="/#requisitos">Requisitos</Link>
          <Link href="/padron">Padrón</Link>
          <Link href="/verificar">Verificar credencial</Link>
          <button className="theme-toggle" onClick={toggleTheme} title="Cambiar tema" aria-label="Cambiar tema">
            ◐
          </button>
          <Link href="/panel" className="btn">Mi empresa</Link>
        </nav>
      </div>
    </header>
  );
}
