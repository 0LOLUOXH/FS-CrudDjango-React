# Informe Final Consolidado de Auditoría de Software — Fusión Solar
**Universidad Nacional de Ingeniería (UNI) · Área de TIC · Ingeniería de Software III**  
**Autores:** Br. Russell Ali Pavon Solis (2020-0333U) · Br. Brayan Josue Portocarrero Vega (2022-0428U)  
**Docente Supervisor:** Ing. Jorge Prado  
**Período:** Octubre – Noviembre de 2026 · Managua, Nicaragua  

> 📄 **Versión Web / PDF Maquetada:** El informe completo con diseño editorial, capturas incrustadas, tablas de estilo formal y diapositivas ejecutivas se encuentra disponible en:  
> [`Evidencias_SQA_FusionSolar/Informe_Final_Auditoria_FusionSolar.html`](file:///home/loluoxh/Documentos/ISO/Repo/FS-CrudDjango-React/Evidencias_SQA_FusionSolar/Informe_Final_Auditoria_FusionSolar.html)

---

## 1. Resumen Ejecutivo y Dictamen de Auditoría (Entregable 2)

### 1.1 Dictamen Formal
* **Opinión del Equipo Auditor:** **Opinión Favorable con Salvedades Técnicas**.
* **Fundamento:** El núcleo de negocio, la integridad matemática de las ventas en el POS y la continuidad operativa son sólidos, respaldados por la **migración a Neon Serverless PostgreSQL 15+** y la infraestructura en la nube (**Render** para la API de Django y **Vercel** para la SPA en React). Sin embargo, existen salvedades críticas en la capa de seguridad de la API (acceso anónimo, falta de autorización en usuarios y aceptación de contraseñas débiles).
* **Nivel de Riesgo Global:** **Medio-Alto (6.8 / 10)** con tendencia a mitigación.

### 1.2 Métricas Clave de Pruebas Automatizadas
* **Total de Pruebas Ejecutadas:** 46 casos de prueba (Django TestCase + rest_framework.test).
* **Pruebas Aprobadas:** 36 (78.3%).
* **Defectos / Fallos Detectados:** 10 (21.7%).
* **Rendimiento Dashboard (k6):** Percentil 90 de respuesta = 420 ms (50 VUs concurrentes), muy inferior al límite de 1,500 ms.
* **Seguridad Web (OWASP ZAP):** 0 alertas críticas (sin inyección SQL ni XSS almacenado); alertas medias concentradas en cabeceras HTTP de respuesta (CSP, HSTS).

---

## 2. Evidencias de Entrevistas Semiestructuradas

### 2.1 Minuta 01 — Administrador 1 (Socio Fundador / Operaciones y Finanzas)
* **Entrevistado:** Lic. Roberto Somarriba.
* **Hallazgos:**
  1. **Compras Duplicadas:** Se confirmó que ante interrupciones de red o doble clic, el sistema permite registrar dos órdenes de compra con el mismo número de factura y proveedor (`DEF-008`), desfasando el valor contable del inventario.
  2. **Protección de Datos (Ley 787):** Se recopila información sensible de clientes (cédula RUC, teléfonos, direcciones de fincas o residencias para instalación solar), pero no existe una política formal redactada ni cláusula de consentimiento explícito en el sistema.
  3. **Tolerancia a Caídas:** Una caída operativa de más de 4 horas ocasiona pérdidas estimadas en más de \$2,000 USD en cotizaciones no formalizadas.

### 2.2 Minuta 02 — Administrador 2 (Socio / Ventas y Gestión Técnica del Sistema)
* **Entrevistado:** Ing. Carlos Mendoza.
* **Hallazgos:**
  1. **Seguridad en Front vs. Back:** Se constató que el control de permisos se delegó al frontend en React (ocultar botones de empleados y respaldos a vendedores), descuidando la validación de roles en la API REST de Django (`DEF-005`).
  2. **Migración a Neon Cloud:** Explicó que la migración desde SQLite a Neon PostgreSQL 15+ resolvió definitivamente los bloqueos transaccionales (`database is locked`) y la falta de concurrencia real durante las ventas del POS (`HAL-001`).
  3. **Contraseñas Débiles:** Reconoció que para facilitar el restablecimiento de credenciales a los empleados, el backend no fuerza complejidad, aceptando claves simples (`DEF-004`).

### 2.3 Minuta 03 — Vendedor (Punto de Venta Altamira)
* **Entrevistado:** Kevin Alvarado (Cajero / Ejecutivo de Mostrador).
* **Hallazgos:**
  1. **Venta con Carrito Vacío:** Indicó que en momentos de alta afluencia o apuro, ha confirmado ventas sin ítems en la tabla, generando tickets con total de \$0.00 (`DEF-001`).
  2. **Conectividad:** Ante caídas de la conexión de internet por fibra en Altamira, recurren al uso de datos móviles compartidos para mantener el acceso al sistema en la nube.
  3. **Proformas:** El generador de proformas en PDF funciona de forma ágil para los clientes que cotizan sistemas solares.

---

## 3. Evidencias Técnicas por Módulo de Trabajo (Módulos 1 al 6)

1. **Módulo 1 — IAM y Control de Acceso Lógico:**
   * `CriticalEndpointsSmokeTest`: `test_all_endpoints_reject_without_token` falló (endpoint `/fs/apibd/v1/product/` responde HTTP 200 anónimo).
   * `RoleBasedAccessControlTest`: `test_regular_user_cannot_create_new_user` y `test_regular_user_cannot_list_all_users` fallaron (vendedores pueden crear administradores y listar nómina completa).
2. **Módulo 2 — Integridad Transaccional y POS:**
   * `ProcessSaleSerializerValidationTest`: `test_rejects_empty_items_list` falló (acepta carritos vacíos).
   * `DuplicatePurchaseRegressionTest`: `test_duplicate_purchase_invoice_is_prevented` falló (permite doble factura de compra con mismo proveedor).
   * `SaleIntegrityRegressionTest`: Aprobó (suma matemática de detalles de venta coincide con el total acumulado).
3. **Módulo 3 — Protección de Datos Sensibles y Respaldos:**
   * `PasswordStrengthValidationTest`: `test_backend_accepts_weak_password` falló (acepta clave `'a'`).
   * `BackupLifecycleTest`: Aprobó (ciclo completo de backup en caliente y snapshot `pre_restore`).
   * Cifrado en reposo verificado en Neon (AES-256) y TLS 1.3 en tránsito.
4. **Módulo 4 — Continuidad Operativa e Infraestructura Cloud:**
   * Concurrencia evaluada con `ConcurrencySaleTest`: Aprobó con Neon PostgreSQL; `select_for_update()` previene eficazmente la sobreventa de paneles solares.
   * Render y Vercel proporcionan alta disponibilidad (SLA &gt; 99.9%) y desacoplan el servidor de fallas eléctricas locales.
5. **Módulo 5 — Trazabilidad y Registro de Auditoría:**
   * `AuditLogSignalTest`: Aprobó (Django Signals interceptan eventos y `CurrentUserMiddleware` asocia el usuario ejecutor).
   * Registros protegidos contra borrado o edición no autorizada en la base de datos.
6. **Módulo 6 — Seguridad Web y Carga:**
   * Escaneo OWASP ZAP confirmó ausencia de inyecciones SQL y fallos críticos de autenticación de tokens.
   * Alertas por cabeceras ausentes (`Content-Security-Policy`, `X-Frame-Options`).
   * Pruebas k6: 50 VUs concurrentes con tiempo de respuesta medio de 210 ms y percentil 90 de 420 ms.

---

## 4. Informe de Hallazgos Preliminares (Entregable 1 - Fase 3)

| Cód. | Módulo | Vulnerabilidad Técnica | Severidad | Estado |
|---|---|---|---|---|
| **DEF-001** | POS | Permite ventas con lista de artículos vacía | Alta | Por Subsanar |
| **DEF-002** | API CRUD | Acceso anónimo a endpoints de productos y bodegas | Crítica | Por Subsanar |
| **DEF-004** | Autenticación | Aceptación de contraseñas de 1 carácter en reset | Alta | Por Subsanar |
| **DEF-005** | IAM | Vendedor puede crear usuarios administradores | Crítica | Por Subsanar |
| **DEF-006** | Respaldos | Serialización de rutas en metadatos `.meta` | Media | Por Subsanar |
| **DEF-008** | Compras | Duplicidad de órdenes de compra con mismo proveedor | Alta | Por Subsanar |
| **HAL-001** | Base de Datos | Falta de soporte de concurrencia en SQLite | Alta | **Mitigado (Neon)** |
| **HAL-002** | Stack | Incompatibilidad de Django 5.0.7 con Python 3.14 | Media | En Planificación |
| **HAL-003** | Web Server | Cabeceras de seguridad CSP y HSTS ausentes | Media | Por Subsanar |

---

## 5. Matriz de Recomendaciones y Plan de Acción (Entregable 4)

1. **Plazo 7 días (Inmediato - Crítico):**
   * Configurar `DEFAULT_PERMISSION_CLASSES` con `IsAuthenticated` en `settings.py`.
   * Restringir el ViewSet de usuarios aplicando `IsAdminUser` y bloqueando asignación de `is_staff=True`.
2. **Plazo 15 días (Alta Prioridad):**
   * Integrar `AUTH_PASSWORD_VALIDATORS` y validación en serializer de reseteo.
   * Añadir `allow_empty=False` en items de venta y `UniqueConstraint` en `PurchaseOrder`.
3. **Plazo 30 días (Media Prioridad):**
   * Incorporar cabeceras de seguridad HTTP con `django-csp` y configuración de headers en Vercel/Render.
   * Formalizar la Política de Protección de Datos Personales (Ley 787).
4. **Plazo 45 a 60 días:**
   * Actualizar Django a la versión 5.2 LTS y estandarizar runtime a Python 3.12 LTS.

---

## 6. Acta Formal de Cierre de Auditoría (Entregable 5)
Celebrada y firmada en Managua, Nicaragua, el 6 de noviembre de 2026, entre:
* **Lic. Roberto Somarriba** — Socio Administrador 1 (Operaciones y Finanzas)
* **Ing. Carlos Mendoza** — Socio Administrador 2 (Ventas y Sistemas)
* **Br. Russell Ali Pavon Solis** — Auditor Líder (UNI)
* **Br. Brayan Josue Portocarrero Vega** — Auditor de Seguridad (UNI)
* **Ing. Jorge Prado** — Docente Supervisor (UNI)

---

## 7. Presentación Ejecutiva en Diapositivas (Entregable 6)
Las 10 láminas de resumen directivo se encuentran maquetadas en la Sección 8 del archivo HTML [`Informe_Final_Auditoria_FusionSolar.html`](file:///home/loluoxh/Documentos/ISO/Repo/FS-CrudDjango-React/Evidencias_SQA_FusionSolar/Informe_Final_Auditoria_FusionSolar.html), abarcando desde la justificación metodológica hasta los compromisos y el dictamen final.
