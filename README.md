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

## Ver la landing

Abrí `landing/index.html` en el navegador (es un único archivo autocontenido, sin dependencias externas).

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
