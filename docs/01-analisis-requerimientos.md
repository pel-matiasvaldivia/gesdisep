# Análisis de Requerimientos — Sistema de Gestión del Registro Provincial de Prestadores de Seguridad Privada (DI.SE.P.)

> **Marco normativo:** Ley N° 9578 (sancionada 08/10/2024, B.O. 28/10/2024) y su Decreto Reglamentario N° 264/2025 (B.O. 19/02/2025). Provincia de Mendoza.
> **Autoridad de Aplicación:** Ministerio de Seguridad y Justicia.
> **Órgano operativo:** Dirección de Seguridad Privada (**DI.SE.P.**), que reemplaza a la Dirección REPRIV (Art. 5 Decreto).

Este documento traduce la normativa a requerimientos funcionales de software. Es la fuente de verdad para el modelo de datos, las validaciones, los flujos de estado y las integraciones del sistema.

---

## 1. Objeto del sistema

Plataforma web para la **gestión integral del ciclo de vida** de los prestadores de seguridad privada y su personal habilitado en Mendoza:

- Alta, baja y modificación de **empresas/prestadores**.
- Alta, baja y modificación de **vigiladores y personal habilitado**.
- **Gestión documental** con validación de requisitos según categoría.
- **Verificación automática** contra bases de datos de organismos externos (interoperabilidad — Art. 6 inc. e y Art. 49 de la Ley).
- **Flujo de trabajo** (workflow) desde el registro de la empresa hasta la autorización/habilitación, con perfiles de usuario por etapa.
- **Emisión y verificación de credenciales** con QR (Art. 6 inc. n / Art. 29-32 Ley y reglamentación del Art. 6 inc. N del Decreto).
- **Renovaciones anuales**, **inspecciones**, **régimen de sanciones** y **notificaciones electrónicas**.

---

## 2. Sujetos regulados (tipos de prestador)

La Ley distingue tres grandes categorías, cada una con requisitos documentales propios.

### 2.1 Seguridad Privada Humana (Art. 7, 11, 12)
Personas jurídicas que prestan servicios de vigilancia y protección. Subtipos de servicio:
- Vigilancia privada (edificios, industrias, comercios, etc.).
- Custodias personales.
- Custodia de mercadería en tránsito y en depósitos.
- Investigación.
- Seguridad de locales bailables / diversión nocturna / recreación.
- Servicios de seguridad nocturna.
- Seguridad y vigilancia en eventos de concurrencia masiva.

### 2.2 Seguridad Privada Interna (Art. 8, 13, 14 Ley; Art. 8, 13 Decreto)
Comercios, empresas, industrias, consorcios, etc. con **personal propio en relación de dependencia** para protección interna. Persona humana o jurídica.
- **Límite: hasta 30 vigiladores** (Art. 13 Decreto). Superado ese número deben contratar una empresa de Seguridad Privada Humana.
- **Prohibido prestar servicios a terceros** (Art. 33 Decreto).
- Director técnico obligatorio si el personal simultáneo supera **5 vigiladores** (Art. 14 Decreto).

### 2.3 Seguridad Privada Tecnológica (Art. 9, 15 Ley; Art. 15 Decreto)
Personas humanas o jurídicas que realizan:
- Instalación y mantenimiento de alarmas y videovigilancia.
- Monitoreo remoto de objetivos fijos (comunicación con CEO — Centros Estratégicos de Operaciones).
- Monitoreo de objetivos móviles.
- Requiere **responsable técnico** con título afín (tecnología, ingeniería electrónica, informática, programación, sistemas) o idoneidad acreditada.
- Debe presentar **protocolos de actuación** ante eventos/alarmas (verificación previa antes de avisar al 911). La AA puede cotejar contra registros del 911.

### 2.4 Exclusiones (Art. 10 Ley)
- Transporte de caudales, bancarias y financieras (regulación nacional).
- Seguridad ciudadana estatal (nacional, provincial, municipal).

### 2.5 Personas jurídicas NO habilitables (Art. 16)
Asociaciones civiles, simples asociaciones, fundaciones, mutuales y cooperativas (salvo cooperativas preexistentes autorizadas, con registro interno especial — Art. 16 inc. e Decreto).

---

## 3. Personal regulado (tipos de credencial)

| Rol | Descripción | Credencial (color) | Norma |
|-----|-------------|--------------------|-------|
| Director Técnico | Conducción operativa. Título de grado en seguridad pública/ciudadana o retirado de FFSS con título de grado. Hasta **3 empresas**. | **Blanca** | Art. 19-22 Ley; Art. 6 inc. N, Art. 11 inc. m Decreto |
| Supervisor | Supervisión operativa. | **Blanca** | Art. 6 inc. N Decreto |
| Responsable Técnico (tecnológica) | Título técnico/afín o idoneidad. | (asimilado) | Art. 15 Ley |
| Vigilador General | Vigilancia general. | **Azul** | Art. 23-26 Ley |
| Vigilador Bombero | Incluye general, nocturna y deportivos. | **Roja** | Art. 6 inc. N Decreto |
| Vigilador de Eventos Deportivos | | **Verde** | Art. 6 inc. N Decreto |
| Vigilador de Diversión Nocturna | | **Negra** | Art. 6 inc. N Decreto |
| Vigilador de Seguridad Interna | | **Amarilla** | Art. 6 inc. N Decreto |
| Personal Instalación/Monitoreo/Verificador | Tecnológica. | **Violeta** | Art. 6 inc. N Decreto |

**Vigencia de credencial:** 2 años, renovable con actualización de capacitación; vencimiento de la capacitación a los 5 años (Art. 30 Ley; Art. 6 inc. N pto. 3 Decreto). La credencial de Vigilador Bombero habilita para general, diversión nocturna y deportivos.

**Elementos de seguridad obligatorios de la credencial** (Art. 6 inc. N pto. 6 Decreto):
- **Código QR** de verificación pública de autenticidad y vigencia.
- Sticker identificable (microtextos / tinta UV).
- Plastificado.
- Holograma de seguridad.
- Datos: nombre y apellido, foto actualizada, función/categoría, número de registro, fecha emisión/vencimiento, firma y sello de la AA.

---

## 4. Requisitos documentales por categoría (checklist de validación)

Estos son los "requisitos" que el sistema debe **exigir, cargar y validar**. Cada ítem es un tipo de documento/verificación con estado (pendiente / presentado / verificado / observado / vencido).

### 4.1 Empresa de Seguridad Privada Humana — Art. 11 Ley + Art. 11 Decreto
- [ ] a) Constitución regular conforme Ley 19.550 / Ley 27.349 (SAS).
- [ ] b) Copia autenticada del contrato social con inscripción en **Dirección de Personas Jurídicas y Registro Público (DPJ) Mendoza**.
- [ ] c) Denominación/razón social, domicilio social, **domicilio electrónico**, CUIT y teléfono.
- [ ] d) Datos del órgano de dirección: nombre, DNI, CUIL, teléfono y domicilio real.
- [ ] e) **Certificado de antecedentes penales** de directores y propietarios.
- [ ] f) **Seguro de caución** a favor del Ministerio de Seguridad y Justicia (renovación anual).
- [ ] g) Inscripción y constancias al día en **AFIP, ATM**, aportes patronales, obra social y **habilitación municipal**.
- [ ] h) **Seguro de responsabilidad civil** contra terceros.
- [ ] i) Inscripción en **ANMaC** (si corresponde / uso de armas de fuego — ver Art. 11 inc. i Decreto).
- [ ] j) **Seguro ART** (Accidentes de Riesgos del Trabajo).
- [ ] k) Comprobante de **pago de tasa anual** (Ley Tributaria vigente).
- [ ] l) **Declaración de vehículos** afectados, con documentación y seguros.
- [ ] m) Designación de **Director Técnico** (puede ejercer en hasta 3 empresas).
- [ ] n) Constancia de **huellas y tomas genéticas** de directores (Ley 8611).
- [ ] o) Directores / persona jurídica **no fallidos ni en quiebra**.
- [ ] p) Directores **no cesanteados/exonerados** de la administración pública.
- [ ] q) Cumplimiento de inscripción de **obra social** (Sistema Nacional de Seguridad Social — Ministerio de Salud Nación).
- [ ] Requisito de **sede/local** (Art. 12): uso exclusivo, ambientes adecuados, guarda de armamento según ANMaC, habilitación municipal. Cambio de local: comunicar en 5 días hábiles.

### 4.2 Seguridad Privada Interna — Art. 14 Ley + Art. 14 Decreto
- [ ] Nota de solicitud con: denominación/nombre de fantasía; (PJ) estatuto y resolución DPJ; domicilio real, comercial y **procesal electrónico**; CUIT y teléfonos.
- [ ] Trabajadores asignados + **Formulario 931 AFIP** o constancia de relación de dependencia.
- [ ] Copia DNI del solicitante.
- [ ] Certificado de antecedentes penales (PJ: de directivos y suplentes).
- [ ] Pago de **tasa anual diferenciada**.
- [ ] Libro de objetivos autorizado.
- [ ] Seguro de RC contra terceros.
- [ ] Seguro de caución (si PJ).
- [ ] **Director Técnico obligatorio si > 5 vigiladores simultáneos** (con requisitos Art. 19-20).
- [ ] Personal de seguridad interna habilitado + capacitación (Art. 24 inc. F, G, H, I, K, L, M + Art. 24 inc. J Decreto).

### 4.3 Seguridad Privada Tecnológica — Art. 15 Ley + Art. 15 Decreto
**Personas humanas:**
- [ ] Inscripción AFIP y ATM.
- [ ] Datos personales: nombre, domicilio, domicilio electrónico, CUIT, teléfono.
- [ ] Certificado de antecedentes penales.
- [ ] Formulario 931 AFIP (si corresponde).
- [ ] Pago de tasa anual.
- [ ] Capacitación e idoneidad del personal.

**Personas jurídicas:** incisos b, c, e, g, m, n del Art. 11; responsable técnico con título afín; huellas/genética solo si reside en Argentina; **seguro de caución**; **protocolos de actuación** aprobados.

### 4.4 Vigilador (persona) — Art. 24 Ley + Art. 24 Decreto
- [ ] a) Argentino o extranjero con residencia precaria autorizada.
- [ ] b) Estudios **secundarios completos** (plazo de 1 año para regularizar — Art. 25).
- [ ] c) Mayor de 18 años.
- [ ] d) Residencia en Mendoza.
- [ ] e) **Certificado de aptitud psico-física** (mayores de 55: cada 4 años — Art. 24 inc. e Decreto).
- [ ] f) Aptitud técnica y **capacitación básica/especialidad** (actualización cada 5 años).
- [ ] g) No incurrir en inhabilidades/incompatibilidades.
- [ ] h) **Certificado de reincidencia penal**, sin procesos penales pendientes por delitos dolosos (se re-exige en cada renovación).
- [ ] i) Sin antecedentes por contravenciones Ley 9099 (según grilla, en tanto afecten idoneidad).
- [ ] j) No pertenecer a FFAA/FFSS/policía en actividad ni ser empleado del poder judicial.
- [ ] k) No cesanteado/exonerado de la administración pública.
- [ ] l) No ejercer cargos jerárquicos en administración pública.
- [ ] m) Constancia de **huellas y tomas genéticas** (Ley 8611).
- Nota: un vigilador puede ser contratado por **más de una empresa** (compatibilidad horaria — Art. 23 Decreto).

### 4.5 Director Técnico — Art. 19-20 Ley
- [ ] Mayor de edad.
- [ ] Sin condenas por delitos dolosos ni violaciones a DDHH.
- [ ] Residencia fija en la provincia ≥ 2 años previos a su proposición.
- [ ] No cesanteado/exonerado de administración pública.
- [ ] Huellas y tomas genéticas (Ley 8611).
- [ ] Título de grado en seguridad pública/ciudadana o retirado de FFSS con título (transitoria: 5 años para acreditar título — Art. 21; excepción Art. 19 Decreto para quienes tengan > 2 años de antigüedad).

---

## 5. Organismos externos a integrar (interoperabilidad)

Base legal: **Art. 6 inc. e** (entrecruzamiento de bases) y **Art. 49** (interoperatividad: el Estado no debe pedir al privado lo que puede obtener por sí mismo). Cada verificación documental debería, en lo posible, resolverse por **API** contra la fuente autoritativa.

| Organismo | Verifica | Uso en el sistema | Prioridad |
|-----------|----------|-------------------|-----------|
| **AFIP** (ARCA) | CUIT, inscripción, Formulario 931, condición fiscal | Validar identidad fiscal empresa/persona, aportes | Alta |
| **ATM** (Administración Tributaria Mendoza) | Inscripción provincial, deudas exigibles, pago de tasas | Validar tasas y deuda provincial (Art. 17 inc. d) | Alta |
| **Dirección de Personas Jurídicas y Registro Público (DPJ Mendoza)** | Contrato social, inscripción societaria, estado (quiebra) | Validar existencia y regularidad de la sociedad (Art. 11 b/o) | Alta |
| **Registro Nacional de Reincidencia (RNR)** | Antecedentes penales / reincidencia | Certificados de directores, propietarios y vigiladores | Alta |
| **RENAPER** | Validación de identidad DNI, datos biográficos | Verificar identidad de personas | Alta |
| **ANMaC** | Registro de armas, legítimo usuario, tenencia, portación | Prestadores con armas de fuego (Art. 11 inc. i) | Media |
| **SRT / ART (aseguradoras)** | Cobertura ART vigente | Validar seguro ART (Art. 11 inc. j) | Media |
| **Compañías de seguros / SSN** | Vigencia de póliza de caución y RC | Validar seguros de caución y RC (Art. 11 f/h) | Media |
| **Subsecretaría de Trabajo y Empleo (Mendoza)** | Relaciones laborales, inspecciones conjuntas | Cruce de datos, inspecciones (Art. 6 inc. e) | Media |
| **Superintendencia de Servicios de Salud / Obra social** | Inscripción de obra social | Validar Art. 11 inc. q | Media |
| **Municipalidades** | Habilitación municipal del local | Validar sede (Art. 11 g / Art. 12) | Media |
| **Ministerio de Salud (Nación)** | Sistema Nacional de Seguridad Social | Obra social | Baja |
| **911 / CEO** | Eventos y desplazamientos policiales | Cotejo de protocolos de seguridad tecnológica (Art. 15 Decreto) | Media |
| **Registro de huellas y genética (Ley 8611)** | Constancia de extracción | Directores y vigiladores | Media |
| **Ciudadano Digital Mendoza (CIDI)** | Identidad ciudadana / SSO | Autenticación de usuarios externos | Alta (auth) |

> **Nota de diseño:** No todas estas APIs están públicamente disponibles hoy. El sistema debe diseñarse con una **capa de adaptadores (integration layer)** que permita: (a) verificación automática cuando la API existe, (b) **carga manual con verificación humana** como fallback, y (c) trazabilidad del método de verificación de cada requisito.

---

## 6. Roles / perfiles de usuario y flujo del proceso

### 6.1 Perfiles (RBAC)
| Perfil | Descripción | Permisos clave |
|--------|-------------|----------------|
| **Empresa / Solicitante** (externo) | Prestador que se registra y carga documentación. | Crear legajo, subir documentos, ver observaciones, subsanar, ver credenciales, iniciar renovación. |
| **Personal de seguridad** (externo) | Vigilador/DT que gestiona su propia credencial. | Ver estado de credencial, cargar certificados personales. |
| **Mesa de Entradas / Recepción** | Recepción y admisión formal de trámites. | Recibir, cotejar completitud, derivar. |
| **Analista / Verificador documental** | Valida requisitos y dispara verificaciones externas. | Aprobar/observar documentos, correr verificaciones API, solicitar subsanación. |
| **Inspector** | Inspección de sede/objetivos, actas. | Cargar actas de inspección, adjuntar evidencia. |
| **Director DI.SE.P.** | Otorga habilitación por resolución. | Aprobar/rechazar habilitación, firmar resoluciones, disponer sanciones/inhabilitaciones provisorias. |
| **Ministro / Asesoría Letrada** | Inhabilitaciones definitivas (Art. 37). | Resolver inhabilitación definitiva, dictamen jurídico. |
| **Administrador del sistema** | Gestión de usuarios, catálogos, tasas, parámetros. | ABM usuarios, roles, tablas maestras, integraciones. |
| **Auditor** (solo lectura) | Auditoría y control. | Lectura total + logs. |
| **Público / Ciudadano** (anónimo) | Verifica una credencial por QR. | Consulta de validez de credencial. |

### 6.2 Máquina de estados del legajo (empresa)
```
BORRADOR
   │ (empresa completa datos y sube documentación)
   ▼
PRESENTADA ──► EN_REVISION_DOCUMENTAL
                    │            │
                    │            ▼
                    │        OBSERVADA ──(subsanación)──► EN_REVISION_DOCUMENTAL
                    ▼
             VERIFICACION_EXTERNA  (llamadas a APIs de organismos)
                    │
                    ▼
             INSPECCION  (si corresponde: sede/objetivos)
                    │
                    ▼
             EN_APROBACION  (Director DI.SE.P.)
                 │        │
        (rechazo)│        │(aprobación → resolución + credenciales)
                 ▼        ▼
             RECHAZADA   HABILITADA
                            │
      ┌──────────┬──────────┼───────────────┬────────────────┐
      ▼          ▼          ▼               ▼                ▼
  RENOVACION  SUSPENDIDA  INHAB_TEMPORAL  INHAB_DEFINITIVA   BAJA
 (ene–10 mar) (medida)   (≤60 días)      (Ministro)       (voluntaria)
```

### 6.3 Ciclo del personal (vigilador / DT)
`ALTA_SOLICITADA → EN_VERIFICACION → OBSERVADO → APROBADO → CREDENCIAL_EMITIDA → (VIGENTE / POR_VENCER / VENCIDA / SUSPENDIDA / BAJA)`. Restitución de credencial al cesar (Art. 32).

---

## 7. Reglas de negocio destacadas (validaciones automatizables)

1. **Renovación anual:** ventana **1 de enero al 10 de marzo** (Art. 17). El sistema debe abrir la campaña, notificar y bloquear operación fuera de vigencia.
2. **Vigencia de credencial:** 2 años; capacitación válida 5 años. Alertas de vencimiento (60/30/7 días).
3. **Director Técnico:** máximo **3 empresas** simultáneas (Art. 11 inc. m Decreto). Validar al asignar.
4. **Seguridad Interna:** máximo **30 vigiladores**; DT obligatorio si **> 5** simultáneos; **no** puede prestar a terceros.
5. **Aptitud psico-física:** mayores de 55 años, revalidación **cada 4 años**.
6. **Comunicación de cambios:** 5 días hábiles para informar modificaciones administrativas / cambio de local (Art. 18 a / Art. 12 c).
7. **Reemplazo de DT:** informar en 5 días hábiles, efectivizar en 10 (Art. 18 d).
8. **Libro de novedades digital** (Art. 18 inc. l Ley + Decreto): registro cronológico con fecha/hora, turnos, entradas/salidas, tareas, incidentes, supervisores, rondas. Conservación 5 años.
9. **Régimen de sanciones** (Art. 36-41):
   - Infracciones **leves / graves / gravísimas**.
   - Sanciones: apercibimiento, multa, **inhabilitación temporaria (≤60 días)**, inhabilitación definitiva (solo Ministro).
   - Reincidencia dentro de **2 años**; multa x2 (1ª) y x3 (2ª reincidencia).
   - **Pago voluntario** en 5 días: reducción de hasta **40%**.
10. **Notificaciones electrónicas** al domicilio procesal electrónico constituido (Art. 42 Ley + Decreto): valen como notificación fehaciente.
11. **Procedimientos administrativos** (Art. 44 Decreto): plazos de 5 y 15 días hábiles según etapa (multas, inhabilitación temporal/definitiva, servicios sin habilitación) con derecho de defensa.
12. **Armas de fuego / disuasivas** (Art. 6 inc. L y Art. 11 inc. i Decreto): flujo de solicitud/autorización, registro de personal habilitado (vigencia 2 años), ADN balístico, sala de armas.

---

## 8. Requerimientos no funcionales

- **Seguridad y datos sensibles:** se procesan antecedentes penales, datos biométricos (huellas/genética), datos personales. Cumplir **Ley 25.326 (Protección de Datos Personales)** y confidencialidad (Art. 18 g, Art. 26 e Ley). Cifrado en tránsito y reposo, control de acceso mínimo necesario, y **log de auditoría inmutable**.
- **Trazabilidad:** todo cambio de estado, verificación y decisión debe quedar registrado (quién, cuándo, qué, resultado de API).
- **Interoperabilidad:** arquitectura de adaptadores para organismos; tolerancia a fallos (reintentos, circuit breaker, colas), caché de respuestas y fallback manual.
- **Disponibilidad y campañas:** picos en la ventana de renovación (ene–mar). Escalable.
- **Firma digital / documentos oficiales:** resoluciones y credenciales con validez legal, verificables por QR.
- **Expediente electrónico:** compatibilidad conceptual con GDE/GEM (gestión documental estatal).
- **Accesibilidad:** portal público accesible (WCAG AA), responsive.
- **Idioma:** español (Argentina).

---

## 9. Mapa Ley/Decreto → módulo del sistema

| Módulo | Artículos principales |
|--------|-----------------------|
| Registro de prestadores | 4, 5, 6, 11, 14, 15 |
| Gestión documental y validación | 11, 14, 15, 17, 24 |
| Personal y credenciales | 19-32; Art. 6 inc. N Decreto |
| Verificación externa (APIs) | 6 inc. e, 49 |
| Objetivos y libro de novedades | 18 inc. k y l |
| Armas / disuasivos | 6 inc. L, 11 inc. i (Decreto) |
| Inspecciones y sanciones | 36-45; Art. 44 Decreto |
| Notificaciones electrónicas | 42 |
| Renovaciones | 17 |
| Gestión de usuarios/roles | (transversal, requisito del cliente) |

---

*Documento base para el diseño del sistema. Ver `02-prompt-sistema.md` (prompt maestro + arquitectura) y `03-guia-presentacion.md` (guía para empresas).*
