/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Genera un build autocontenido para imágenes Docker pequeñas.
  output: "standalone",
  // Proxy interno: si se define API_INTERNAL_URL, las llamadas del navegador a
  // /api/* se reenvían a la API por la red interna de Docker. Así, en producción
  // detrás de un reverse proxy (NPM) solo hace falta exponer la web: el navegador
  // habla siempre con el mismo origen y la API queda interna.
  async rewrites() {
    const api = process.env.API_INTERNAL_URL;
    if (!api) return [];
    return [{ source: "/api/:path*", destination: `${api}/api/:path*` }];
  },
};
export default nextConfig;
