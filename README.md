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

## Próximo paso sugerido

Usar el **prompt maestro** de `docs/02-prompt-sistema.md` para generar el monorepo del sistema (Next.js + NestJS + PostgreSQL + capa de integración con organismos).

---

> Documentos y prototipo orientativos, basados en la normativa citada. No constituyen asesoramiento oficial ni notificación de la Autoridad de Aplicación.
