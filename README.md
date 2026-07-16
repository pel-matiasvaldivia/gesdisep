# GESDISEP — Sistema de Gestión del Registro Provincial de Prestadores de Seguridad Privada (Mendoza)

Base de análisis, especificación y prototipo de landing para el sistema de gestión documental del **Registro Provincial de Prestadores de Seguridad Privada Humana, Interna y Tecnológica** de la **Dirección de Seguridad Privada (DI.SE.P.)** del Ministerio de Seguridad y Justicia de Mendoza.

Marco normativo: **Ley N° 9578** (B.O. 28/10/2024) y su **Decreto Reglamentario N° 264/2025** (B.O. 19/02/2025).

## Contenido de este repositorio

| Archivo | Descripción |
|---------|-------------|
| [`docs/01-analisis-requerimientos.md`](docs/01-analisis-requerimientos.md) | Análisis de requerimientos: sujetos regulados, requisitos documentales por categoría, roles/perfiles, máquina de estados, organismos externos a integrar y reglas de negocio, con referencia a los artículos de la Ley y el Decreto. |
| [`docs/02-prompt-sistema.md`](docs/02-prompt-sistema.md) | **Prompt maestro** listo para usar + arquitectura recomendada, justificación del stack, modelo de datos y roadmap de implementación. |
| [`docs/03-guia-presentacion.md`](docs/03-guia-presentacion.md) | Guía práctica de qué debe presentar cada prestador y cada persona para el registro. |
| [`landing/index.html`](landing/index.html) | Landing page pública, autocontenida y responsive: categorías, requisitos, pasos del trámite, credenciales y verificador de credenciales por QR (demo). |

## ¿Qué resuelve el sistema?

- Alta, baja y modificación de **empresas/prestadores** (Humana, Interna, Tecnológica) y de **personal habilitado** (vigiladores, directores/responsables técnicos, supervisores).
- **Gestión documental** con validación de requisitos según categoría.
- **Verificación automática** de requisitos contra APIs de organismos (AFIP, ATM, Personas Jurídicas, Reincidencia, RENAPER, ANMaC, seguros, etc.) — interoperabilidad (Art. 6 inc. e y Art. 49).
- **Workflow con perfiles por etapa**: registro → carga documental → validación → inspección → autorización/habilitación → renovación.
- **Credenciales** por rol (7 colores) con **QR verificable**, sanciones, renovaciones y notificaciones electrónicas.

## Landing page

La landing está **integrada en la app Next.js**: es la home (`/`) de `apps/web`, servida por la aplicación, con el **verificador de credenciales conectado a la API real**. El QR de cada credencial apunta a `/verificar/<token>`, que verifica automáticamente al escanear.

- `apps/web/app/page.tsx` — landing (home de la app).
- `apps/web/app/verificar` — verificador manual y por deep-link de QR.
- `landing/index.html` — copia estática autocontenida (material informativo/offline).

## CI/CD (GitHub Actions)

Workflow en [`.github/workflows/ci.yml`](.github/workflows/ci.yml), en cada push y PR:

1. **quality** — instala, genera Prisma Client, typecheck de `shared`/`api`/`web` y build de API y Web.
2. **e2e** — levanta un servicio PostgreSQL, aplica `prisma migrate deploy`, siembra y corre un **smoke test** (login → registro → verificación de credencial).
3. **docker** — solo en push: construye las imágenes Docker de API y Web y las publica en **GitHub Container Registry**:
   - `ghcr.io/<owner>/<repo>-api`
   - `ghcr.io/<owner>/<repo>-web`

   Usa el `GITHUB_TOKEN` del repo (permiso `packages: write`), sin secretos adicionales. Para la URL pública de la API en el bundle web, definí la variable de repo `NEXT_PUBLIC_API_URL`.

### Imágenes Docker

Cada app tiene su `Dockerfile` multi-stage (contexto = raíz del monorepo):

```bash
# API (aplica migraciones al arrancar vía docker-entrypoint.sh)
docker build -f apps/api/Dockerfile -t gesdisep-api .
# Web (Next.js standalone)
docker build -f apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.tu-dominio -t gesdisep-web .
```

La imagen de API ejecuta `prisma migrate deploy` en el arranque; con `SEED_ON_START=true` siembra los usuarios por rol.

## Despliegue en VPS con Nginx Proxy Manager (NPM)

Pensado para un VPS donde **NPM ya resuelve el SSL**. Se expone **solo la web**; la API y la base quedan internas. El navegador llama a `/api` en el **mismo origen** y la web lo proxea a la API por la red de Docker (rewrite de Next horneado en la imagen apuntando al servicio `api`). Así no hace falta publicar la API.

Archivos: [`docker-compose.prod.yml`](docker-compose.prod.yml) y [`.env.prod.example`](.env.prod.example).

En el VPS:

```bash
# 1) Configurar
cp .env.prod.example .env      # completar secretos, dominio (PUBLIC_VERIFY_URL) y WEB_PORT
echo "$GHCR_TOKEN" | docker login ghcr.io -u <usuario> --password-stdin   # PAT read:packages

# 2) Traer imágenes y levantar
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# 3) En NPM: crear un Proxy Host apuntando a  http://127.0.0.1:${WEB_PORT}
#    (Forward Hostname/Port), con el certificado SSL del dominio.
```

Por defecto la web se liga a `127.0.0.1:${WEB_PORT}` (no queda pública; solo NPM la alcanza). Actualizaciones: `docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d`.

> Si tu NPM corre **dentro de Docker**, lo más limpio es compartir una red de Docker en vez de exponer el puerto al host — hay un override de ejemplo documentado dentro de `docker-compose.prod.yml`.

## El sistema (monorepo)

Esqueleto funcional del sistema, generado a partir del prompt maestro:

```
apps/
  api/          # Backend NestJS (REST) + Prisma + capa de integración
  web/          # Frontend Next.js (landing + verificador de credenciales)
packages/
  shared/       # Dominio compartido: enums, reglas, catálogo de requisitos, máquina de estados
docker-compose.yml   # PostgreSQL + Redis + MinIO
```

### Stack

- **Backend:** NestJS + TypeScript, Prisma (PostgreSQL), JWT + RBAC por rol.
- **Integraciones:** capa puerto/adaptador (`apps/api/src/validacion/integration`) con RENAPER, AFIP, ATM, DPJ y Reincidencia. Cada adaptador funciona en modo `real` o `stub` (configurable por `.env`), con reintentos y fallback a verificación manual.
- **Credenciales:** emisión con QR firmado (HMAC) y verificación pública sin autenticación.
- **Frontend:** Next.js (App Router) con verificador de credenciales que consume la API.

### Puesta en marcha (desarrollo)

Requisitos: Node 20+, pnpm 9+, Docker.

```bash
cp .env.example .env
pnpm install
pnpm infra:up            # levanta Postgres, Redis y MinIO
pnpm db:migrate          # crea el esquema (prisma migrate)
pnpm db:seed             # usuarios por rol (password: gesdisep123)
pnpm dev                 # API en :3001 y Web en :3000
```

Usuarios de prueba (password `gesdisep123`): `director@disep.mendoza.gob.ar`,
`analista@disep.mendoza.gob.ar`, `empresa@ejemplo.com`, etc. Ver `apps/api/prisma/seed.ts`.

Ejemplos de llamadas a la API en [`apps/api/requests.http`](apps/api/requests.http).

### Flujo implementado (extremo a extremo)

1. **Registro** de prestador (`POST /api/prestadores`) → crea el legajo con el **checklist de requisitos** de su categoría.
2. **Verificación automática** (`POST /api/validacion/legajos/:id/verificar`) → corre los adaptadores de organismos y marca cada requisito como verificado/observado.
3. **Workflow** del legajo (`POST /api/legajos/:id/transicion`) con **máquina de estados** validada y precondiciones por etapa.
4. **Habilitación** → genera la resolución.
5. **Emisión de credencial** con QR (`POST /api/credenciales`) y **verificación pública** (`GET /api/credenciales/verificar/:token`).

---

> Documentos y prototipo orientativos, basados en la normativa citada. No constituyen asesoramiento oficial ni notificación de la Autoridad de Aplicación.
