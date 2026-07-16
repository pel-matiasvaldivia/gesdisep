/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Genera un build autocontenido para imágenes Docker pequeñas.
  output: "standalone",
};
export default nextConfig;
