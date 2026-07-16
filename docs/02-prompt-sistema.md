# Prompt Maestro + Arquitectura — Sistema DI.SE.P. (GESDISEP)

Este documento contiene: **(A)** el prompt maestro reutilizable para generar/construir el sistema con un agente de código o equipo de desarrollo, y **(B)** la arquitectura recomendada y justificación del stack.

---

## A. PROMPT MAESTRO (copiar y usar)

> Podés pegar este prompt en Claude Code / un LLM de codificación, o entregarlo como pliego de especificación a un equipo. Está pensado para ser autocontenido.

```
Actuá como un equipo senior de arquitectura y desarrollo de software gubernamental.
Construí "GESDISEP", el Sistema de Gestión del Registro Provincial de Prestadores de
Seguridad Privada (Humana, Interna y Tecnológica) de la Dirección de Seguridad Privada
(DI.SE.P.) del Ministerio de Seguridad y Justicia de Mendoza, conforme a la Ley N° 9578
y su Decreto Reglamentario N° 264/2025.

OBJETIVO
Plataforma web robusta, segura y escalable para gestionar el ciclo de vida completo de:
(1) empresas/prestadores de seguridad privada (alta, baja, modificación, habilitación,
    renovación anual, suspensión e inhabilitación), y
(2) personal habilitado (vigiladores, directores técnicos, responsables técnicos y
    supervisores), con emisión y verificación de credenciales con QR.
El sistema debe validar la documentación requerida según la categoría del prestador y
verificar los requisitos, en lo posible de forma automática, contra APIs de organismos
externos (interoperabilidad — Art. 6 inc. e y Art. 49 de la Ley).

ALCANCE FUNCIONAL (MÓDULOS)
1. Registro y ABM de prestadores, con las tres categorías: Humana, Interna, Tecnológica,
   y sus subtipos de servicio. Reglas por categoría (ver "REGLAS DE NEGOCIO").
2. Gestión documental: carga de documentos por requisito, con estado
   (pendiente/presentado/verificado/observado/vencido), versionado, antivirus,
   OCR opcional y checklist dinámico por categoría.
3. Motor de validación de requisitos: cada requisito se resuelve por
   (a) verificación automática vía adaptador de organismo, o
   (b) verificación manual por analista, registrando método y evidencia.
4. Workflow con máquina de estados del legajo y del personal, con perfiles por etapa:
   Empresa → Mesa de Entradas → Analista/Verificador → Inspector → Director DI.SE.P.
   → (Ministro para inhabilitación definitiva).
5. Gestión de usuarios, roles y permisos (RBAC), multi-perfil, con SSO opcional a
   Ciudadano Digital Mendoza (CIDI) para usuarios externos.
6. Emisión de credenciales por rol (7 colores según Art. 6 inc. N del Decreto) con QR,
   número de registro, foto, vigencia 2 años, y verificación pública por QR.
7. Objetivos y libro de novedades digital (registro cronológico, conservación 5 años).
8. Inspecciones (actas), régimen de sanciones (leve/grave/gravísima → apercibimiento,
   multa, inhabilitación temporal ≤60 días, inhabilitación definitiva) y reincidencia.
9. Renovaciones anuales (campaña 1 ene – 10 mar) con notificaciones y alertas de
   vencimiento.
10. Notificaciones electrónicas al domicilio procesal electrónico (valen como fehacientes).
11. Landing page pública informativa con guía de requisitos y verificador de credenciales.
12. Panel de reportes/tablero para la Dirección (KPIs, vencimientos, trámites por estado).

INTEGRACIONES EXTERNAS (capa de adaptadores, tolerante a fallos)
Diseñá un "integration layer" con un adaptador por organismo, patrón puerto/adaptador,
reintentos con backoff, circuit breaker, colas asíncronas, caché de respuestas y
fallback a verificación manual. Cada adaptador implementa una interfaz común
(verificar(input) -> {estado, datos, fuente, fechaConsulta, evidencia}).
Organismos: AFIP/ARCA (CUIT, F931), ATM Mendoza (tasas/deudas), Dirección de Personas
Jurídicas y Registro Público Mendoza (sociedad/quiebra), Registro Nacional de
Reincidencia (antecedentes), RENAPER (identidad DNI), ANMaC (armas), SRT/ART,
compañías de seguros/SSN (caución y RC), Subsecretaría de Trabajo y Empleo,
Obra social/SSS, Municipalidades (habilitación), 911/CEO (cotejo tecnológica),
registro Ley 8611 (huellas/genética), CIDI (autenticación).
Donde no exista API pública, dejá el adaptador con implementación "manual/stub"
claramente marcada y configurable, sin bloquear el resto del flujo.

REGLAS DE NEGOCIO (obligatorias)
- Renovación anual: ventana 1 ene – 10 mar. Bloquear/alertar según vigencia.
- Credencial: vigencia 2 años; capacitación válida 5 años; alertas 60/30/7 días.
  Bombero incluye general, nocturna y deportivos.
- Director Técnico: máximo 3 empresas simultáneas. Validar al asignar.
- Seguridad Interna: máx. 30 vigiladores; DT obligatorio si > 5 simultáneos;
  prohibido prestar servicio a terceros.
- Aptitud psico-física: mayores de 55 años, revalidar cada 4 años.
- Comunicación de cambios administrativos / cambio de local: 5 días hábiles.
- Reemplazo de DT: informar en 5 días, efectivizar en 10.
- Sanciones: reincidencia dentro de 2 años (multa x2 y x3); pago voluntario en 5 días
  reduce hasta 40%. Inhabilitación definitiva solo la resuelve el Ministro.
- Personas jurídicas no habilitables: asociaciones civiles, simples asociaciones,
  fundaciones, mutuales, cooperativas (salvo preexistentes autorizadas).
- Exclusiones del registro: transporte de caudales/bancarias/financieras y seguridad
  ciudadana estatal.

REQUISITOS NO FUNCIONALES
- Seguridad: cumplimiento Ley 25.326 (datos personales); se manejan antecedentes
  penales y datos biométricos. Cifrado TLS en tránsito y AES en reposo; gestión de
  secretos (Vault/KMS); principio de mínimo privilegio; MFA para usuarios internos.
- Auditoría: log inmutable (append-only) de toda acción, verificación y cambio de estado
  (quién, cuándo, qué, resultado de API). Retención según normativa.
- Confiabilidad: reintentos, colas, idempotencia, health checks, degradación elegante.
- Escalabilidad: preparar para picos de la campaña de renovación.
- Documentos oficiales: resoluciones y credenciales con firma digital y verificación QR;
  generación de PDF. Compatibilidad conceptual con expediente electrónico (GDE/GEM).
- Accesibilidad WCAG 2.1 AA en el portal público; responsive; i18n es-AR.
- Observabilidad: OpenTelemetry, métricas, trazas, logs centralizados, alertas.

STACK TECNOLÓGICO (usar salvo indicación en contra)
- Frontend: Next.js (App Router) + TypeScript + TailwindCSS + shadcn/ui + React Query.
- Backend: NestJS (TypeScript), arquitectura modular/hexagonal, API REST + OpenAPI,
  eventos de dominio. Workers para integraciones y tareas programadas.
- Base de datos: PostgreSQL (JSONB para checklists flexibles, RLS para aislamiento),
  Prisma o TypeORM. Redis para caché y colas (BullMQ).
- Almacenamiento de documentos: S3-compatible (MinIO on-prem o S3) con antivirus (ClamAV).
- Autenticación/RBAC: Keycloak (o Auth.js) con SSO a CIDI para externos; MFA internos.
- Mensajería/colas: BullMQ (Redis) o RabbitMQ para integraciones asíncronas.
- Notificaciones: email (SMTP institucional), plantillas; opción SMS/push.
- Generación de credenciales/PDF: servicio dedicado con QR firmado (JWT/estampado) y
  endpoint público de verificación.
- Infra/DevOps: Docker; despliegue con Docker Compose (mínimo) o Kubernetes;
  CI/CD con GitHub Actions; IaC (Terraform) opcional.
- Observabilidad: OpenTelemetry + Prometheus + Grafana + Sentry.
- Testing: Jest/Vitest (unit), Supertest (API), Playwright (E2E), datos de prueba.

ENTREGABLES
1. Monorepo (pnpm workspaces o Nx) con apps: web (Next.js), api (NestJS),
   worker (integraciones/cron), y packages compartidos (dominio, tipos, ui).
2. Modelo de datos y migraciones (ver "MODELO DE DATOS" abajo como punto de partida).
3. Capa de integración con interfaz común y adaptadores (con stubs para APIs no
   disponibles) + configuración por variables de entorno.
4. Autenticación, RBAC y semillas de roles/usuarios.
5. Landing pública + verificador de credenciales por QR.
6. Suite de tests y pipeline CI. Documentación (README, OpenAPI, diagramas C4).
7. docker-compose para levantar todo el entorno de desarrollo con un comando.

Empezá por: (1) modelo de dominio y migraciones, (2) RBAC + auth, (3) legajo de empresa
con workflow y gestión documental, (4) motor de validación con un adaptador real (RENAPER
o AFIP) y el resto en stub, (5) credenciales + QR, (6) landing. Escribí código idiomático,
tipado estricto, con tests para las reglas de negocio críticas. No expongas datos sensibles
en logs. Entregá incrementos funcionales y explicá decisiones de arquitectura.
```

---

## B. ARQUITECTURA Y JUSTIFICACIÓN DEL STACK

### B.1 Vista de alto nivel (C4 – contenedores)

```
                          ┌───────────────────────────────────────────┐
                          │                Usuarios                    │
                          │  Empresas · Vigiladores · Analistas ·      │
                          │  Inspectores · Director · Ministro · Público│
                          └───────────────┬────────────────────────────┘
                                          │ HTTPS
                        ┌─────────────────▼──────────────────┐
                        │      Web App (Next.js / SSR)        │
                        │  Portal público + Backoffice + QR   │
                        └─────────────────┬──────────────────┘
                                          │ REST/OpenAPI (JWT)
             ┌────────────────────────────▼────────────────────────────┐
             │                    API (NestJS)                          │
             │  Módulos: Prestadores · Documental · Validación ·        │
             │  Workflow · Personal/Credenciales · Objetivos ·          │
             │  Inspecciones/Sanciones · Notificaciones · Reportes      │
             └───┬───────────────┬───────────────┬───────────────┬──────┘
                 │               │               │               │
        ┌────────▼───┐   ┌───────▼──────┐  ┌─────▼──────┐  ┌─────▼─────────┐
        │ PostgreSQL │   │ Redis (cache │  │ Object     │  │ Keycloak /    │
        │ (RLS,JSONB)│   │ + BullMQ)    │  │ Storage    │  │ CIDI (SSO)    │
        └────────────┘   └──────┬───────┘  │ (MinIO/S3) │  └───────────────┘
                                │          │ +ClamAV    │
                                │          └────────────┘
                    ┌───────────▼─────────────┐
                    │  Worker de Integraciones │  (colas, cron, reintentos)
                    │  + Integration Layer     │
                    └───────────┬─────────────┘
                                │  adaptadores (puerto/adaptador)
   ┌──────┬──────┬──────┬───────┼───────┬──────┬──────┬──────┬──────┬───────┐
   ▼      ▼      ▼      ▼       ▼       ▼      ▼      ▼      ▼      ▼       ▼
 AFIP   ATM   DPJ    RNR    RENAPER  ANMaC  SRT/  Seguros Trabajo 911/  Ley 8611
                                             ART   /SSN            CEO
```

### B.2 Justificación del stack

- **Next.js + TypeScript + Tailwind + shadcn/ui:** SSR/SSG para un portal público rápido y accesible (SEO de la landing y del verificador QR), y un backoffice moderno reutilizando componentes. Tipado end-to-end reduce errores en un dominio con muchas reglas.
- **NestJS (TypeScript):** framework backend maduro, modular y con arquitectura hexagonal natural (ideal para separar dominio de integraciones), inyección de dependencias, OpenAPI automático, guards para RBAC y soporte de colas. Mismo lenguaje que el frontend → un solo ecosistema y equipo.
- **PostgreSQL:** robustez transaccional, **RLS** para aislar datos por prestador/organismo, **JSONB** para checklists de requisitos que varían por categoría sin rigidizar el esquema, y auditoría. Estándar de facto en el Estado.
- **Redis + BullMQ:** las verificaciones contra organismos son lentas y pueden fallar; procesarlas de forma **asíncrona con colas, reintentos y circuit breaker** evita bloquear al usuario y da resiliencia. Caché de respuestas para no golpear organismos innecesariamente.
- **MinIO/S3 + ClamAV:** documentación sensible (antecedentes, contratos), almacenada cifrada, versionada y escaneada por antivirus.
- **Keycloak + CIDI:** RBAC/SSO de nivel gubernamental; integración con **Ciudadano Digital Mendoza** para que las empresas usen su identidad provincial. MFA para usuarios internos.
- **Capa de adaptadores (puerto/adaptador):** desacopla el dominio de cada organismo. Permite empezar con **stubs** donde no hay API y activar la integración real sin tocar la lógica de negocio. Cada verificación deja **traza del método y la fuente**.
- **OpenTelemetry + Prometheus + Grafana + Sentry:** observabilidad imprescindible para un sistema crítico con integraciones externas.

### B.3 Modelo de datos (entidades núcleo)

```
Prestador (id, tipo[HUMANA|INTERNA|TECNOLOGICA], razonSocial, cuit, tipoPersona,
           domicilioSocial, domicilioElectronico, telefono, estado, fechaAlta, ...)
Persona (id, nombre, apellido, dni, cuil, fechaNac, domicilio, residenciaProv, ...)
Directivo (prestadorId, personaId, cargo)             -- órgano de dirección
DirectorTecnico (personaId, titulo, empresas[max 3])
Vigilador (personaId, categorias[], estado)
Credencial (id, personaId, tipo[color], numeroRegistro, emision, vencimiento,
            qrToken, estado[VIGENTE|VENCIDA|SUSPENDIDA])
Legajo (id, prestadorId, estado[máquina de estados], categoria, campaniaId)
Requisito (id, legajoId|personaId, tipo, obligatorio, estado, metodoVerificacion,
           fuente, fechaVerificacion, evidenciaRef)
Documento (id, requisitoId, archivoRef, version, hash, subidoPor, fecha, antivirusOk)
VerificacionExterna (id, requisitoId, organismo, request, response, resultado, fecha)
Objetivo (id, prestadorId, direccion, comitente, vigiladores, vehiculos[], armas[])
LibroNovedades (id, objetivoId) / Novedad (libroId, fechaHora, tipo, detalle, autorId)
Inspeccion (id, prestadorId|objetivoId, actaRef, inspectorId, hallazgos)
Sancion (id, prestadorId, gravedad, tipo, monto, fecha, reincidencia, estado)
Resolucion (id, legajoId, numero, fecha, tipo, pdfRef, firmaDigital)
Notificacion (id, destinatarioId, canal, asunto, cuerpo, estado, fechaLeida)
Tasa/Pago (id, prestadorId, concepto, periodo, monto, estado, comprobante)
Usuario (id, personaId?, email, roles[], mfa, origen[CIDI|LOCAL])
Rol / Permiso (RBAC)
AuditLog (id, actorId, accion, entidad, entidadId, antes, despues, ts)  -- inmutable
```

### B.4 Seguridad y cumplimiento

- **Ley 25.326 (datos personales):** minimización, consentimiento/base legal, derechos ARCO, retención definida, cifrado, segregación de datos sensibles (antecedentes, biométricos).
- **Confidencialidad (Art. 18 g / 26 e):** acceso por necesidad, watermarking de documentos, logging de accesos a datos sensibles.
- **Firma digital y QR verificable:** credenciales y resoluciones con validez legal; endpoint público `/verificar/{qrToken}` que muestra solo datos mínimos (titular, función, número de registro, vigencia).
- **Auditoría inmutable:** append-only, con hash encadenado opcional para no repudio.

### B.5 Roadmap de implementación sugerido

1. **Fundaciones:** monorepo, CI/CD, docker-compose, modelo de dominio y migraciones, RBAC + auth (Keycloak/CIDI).
2. **Legajo de empresa + gestión documental + workflow** (estados, observaciones, subsanación).
3. **Motor de validación + 1 adaptador real** (RENAPER o AFIP) y el resto en stub configurable.
4. **Personal y credenciales con QR** + verificador público.
5. **Inspecciones, sanciones y renovaciones** (campaña ene–mar) + notificaciones electrónicas.
6. **Objetivos y libro de novedades** + reportes/tablero.
7. **Hardening**: seguridad, observabilidad, performance, pruebas de carga para la campaña.

---

*Ver `01-analisis-requerimientos.md` (detalle normativo) y `03-guia-presentacion.md` (guía para empresas). La landing page está en `landing/index.html`.*
