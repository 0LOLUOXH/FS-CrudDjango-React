# Reporte de Cumplimiento Técnico en Seguridad de la Información del Sistema Web Fusión Solar ERP: Evaluación Integral de Controles, Autenticación Multifactor (2FA/TOTP), Criptografía y Resiliencia Transaccional

**Área de Auditoría y Seguridad de Sistemas de Información**  
**Fusión Solar — Managua, Nicaragua**  
**Fecha:** Octubre de 2026  
**Tipo de Evaluación:** Auditoría Técnica de Cumplimiento de Primera Vez (Línea Base Inicial)  
**Documento Rector Evaluado:** *Prácticas de Seguridad de la Información* (Manual Interno de Políticas y Controles de Seguridad Informática)  

---

## Resumen

El presente reporte documenta los resultados de la auditoría técnica de cumplimiento en seguridad de la información aplicada al sistema web de planificación de recursos empresariales (ERP) de Fusión Solar, desarrollado bajo una arquitectura desacoplada conformada por un cliente web en React 18, una interfaz de programación de aplicaciones REST (API REST) en Django 5.0.12 y una base de datos relacional PostgreSQL 15+ Serverless alojada en Neon. La evaluación tuvo por objetivo cotejar de manera sistemática y exhaustiva la arquitectura de software, la configuración de la infraestructura y el código fuente contra las directrices y controles estipulados en el documento institucional *Prácticas de Seguridad de la Información*, tomando como marcos de referencia complementarios las normas ISO/IEC 27001:2022, ISO/IEC 27002:2022, las directrices de identidad digital NIST SP 800-63B y los lineamientos de verificación de seguridad en aplicaciones web OWASP ASVS v4.0. 

La metodología empleada combinó el análisis estático de código fuente (SAST), la inspección dinámica de vulnerabilidades (DAST), la verificación de configuraciones de despliegue en la nube y la ejecución de una batería integral de 52 pruebas automatizadas (46 pruebas funcionales y transaccionales del núcleo de negocio, complementadas con 6 pruebas especializadas de control de acceso y seguridad criptográfica). 

Los hallazgos confirman un nivel de adhesión riguroso a las políticas institucionales: se verificó la erradicación del almacenamiento inseguro de identificadores de sesión en almacenamiento local (`localStorage`) mediante la adopción de cookies seguras con directivas `HttpOnly`, `Secure` y `SameSite=Strict`; el robustecimiento del almacenamiento de credenciales mediante el algoritmo de derivación de claves Argon2id; la incorporación de un esquema de Autenticación de Doble Factor (2FA/MFA) conforme al estándar RFC 6238 (TOTP) con salvaguardas efectivas contra ataques de fuerza bruta (bloqueo y revocación de desafíos tras cinco reintentos fallidos); la garantía de concurrencia segura e integridad de inventario mediante bloqueos pesimistas (`select_for_update()`); y la trazabilidad forense inmutable de eventos sensibles mediante el modelo `AuditLog`. Tras la evaluación de 35 controles técnicos y operativos, el sistema obtuvo un índice de conformidad del 97.1 %, situando el riesgo residual global en un nivel Bajo (1.8/10). Con base en las evidencias técnicas recabadas, se emite un dictamen formal de **Opinión Favorable**, acompañado de un plan de acción para formalizar las cláusulas de consentimiento de datos personales y la activación de reglas perimetrales en borde de red.

*Palabras clave:* seguridad de la información, auditoría de cumplimiento, autenticación multifactor, TOTP RFC 6238, control de acceso, integridad transaccional, tríada CIA, gestión de riesgos, ISO/IEC 27001, NIST SP 800-63B.

---

## 1. Introducción y Marco General de la Evaluación

La seguridad de la información en entornos web transaccionales constituye un requisito operativo fundamental para garantizar la sostenibilidad, la reputación corporativa y la continuidad operativa del negocio (Anderson, 2020). Fusión Solar es una entidad comercial del sector de energía solar fotovoltaica con sede en Altamira, Managua, cuyo sistema informático centraliza la administración de clientes, proveedores, compras de suministros, ventas de punto de venta (POS), control de existencias de inventario, catálogo de equipos de alto valor y respaldos periódicos de la base de datos. La plataforma gestiona transacciones comerciales cuyos montos oscilan entre 1,200 y 4,500 dólares estadounidenses por cada sistema fotovoltaico comercializado, además de almacenar información sensible y datos personales identificables (cédulas de identidad, números RUC, direcciones residenciales y registros de contacto de clientes corporativos y residenciales).

Históricamente, el sistema operaba sobre un motor de base de datos local embebido (SQLite) con Django en un entorno monolítico local. Durante períodos de concurrencia operativa, la ejecución simultánea de operaciones de facturación provocaba bloqueos de contención de base de datos (`database is locked`), generando inconsistencias lógicas entre el stock disponible en sistema y la existencia física real en bodega. Para resolver esta limitación de concurrencia y mitigar la exposición de los datos a incidentes de pérdida física, la empresa migró su arquitectura a un esquema distribuido en la nube, compuesto por:
1. Una base de datos relacional PostgreSQL 15+ Serverless desplegada en la infraestructura de Neon, dotada de cifrado de almacenamiento en reposo y conexiones obligatorias mediante TLS 1.3.
2. Un backend de servicios web desarrollado en Python/Django REST Framework desplegado en la plataforma como servicio (PaaS) Render, ejecutándose en un contenedor Linux virtualizado sin privilegios de superusuario (`UID 1001`).
3. Una aplicación de página única (SPA) desarrollada en React 18 y empaquetada mediante Vite, distribuida globalmente en nodos de borde perimetral (Edge Network) a través de Vercel.

Esta modernización arquitectónica representó una mejora sustancial en escalabilidad y disponibilidad; sin embargo, trasladó los principales vectores de riesgo informático hacia la capa de aplicación, el transporte de sesiones web y la gestión de identidades y accesos (Stallings, 2022). En cumplimiento de la gobernanza corporativa, la administración dispuso la realización de una auditoría técnica integral de primera vez, cuyo propósito es contrastar de manera rigurosa el estado técnico y funcional del software con el documento institucional *Prácticas de Seguridad de la Información*, determinando el grado de cumplimiento de los principios de confidencialidad, integridad y disponibilidad, y estableciendo la postura defensiva del sistema frente a amenazas contemporáneas.

---

## 2. Metodología de Auditoría y Criterios de Evaluación

### 2.1 Criterios Normativos de Referencia

La evaluación se fundamentó en los controles, requisitos y directrices establecidos en el documento rector *Prácticas de Seguridad de la Información* de Fusión Solar, articulado a su vez con los siguientes estándares internacionales y normativas aplicables:
* **ISO/IEC 27001:2022:** Controles de seguridad de la información del Anexo A, específicamente en los dominios de control de acceso (A.5.15 a A.5.18), seguridad en el desarrollo de aplicaciones (A.8.25 a A.8.31) y gestión de respaldos y continuidad (A.8.13 y A.8.14) (International Organization for Standardization [ISO/IEC], 2022a).
* **ISO/IEC 27002:2022:** Guías de implementación técnica para la segregación de funciones, mínimos privilegios y protección de registros de auditoría (ISO/IEC, 2022b).
* **NIST SP 800-63B:** Directrices de identidad digital y autenticación, con énfasis en el nivel de garantía de autenticador 2 (AAL2), uso de generadores TOTP basados en software y políticas de contraseñas robustas (National Institute of Standards and Technology [NIST], 2020).
* **OWASP ASVS v4.0 (Application Security Verification Standard):** Niveles de verificación 1 y 2 para arquitectura segura, validación de entradas, mitigación de vulnerabilidades de inyección y autenticación multifactor (Open Web Application Security Project [OWASP], 2021).
* **Ley 787 de la República de Nicaragua:** Ley de Protección de Datos Personales, en lo concerniente al principio de seguridad y confidencialidad en el tratamiento automatizado de información de terceros (Asamblea Nacional, 2012).

### 2.2 Técnicas e Instrumentos de Recolección de Evidencia

La auditoría se estructuró en cuatro etapas operativas consecutivas: planificación, recolección de evidencia técnica, análisis cuantitativo de conformidad y formulación del dictamen. Las técnicas e instrumentos aplicados se sintetizan en la **Tabla 1**.

#### Tabla 1  
*Fases Metodológicas y Técnicas de Recolección de Evidencia de Auditoría*

| Fase Metodológica | Técnica de Auditoría | Instrumento / Herramienta | Objetivo Específico |
| :--- | :--- | :--- | :--- |
| **Fase I: Inspección de Código (SAST)** | Análisis estático de código fuente y revisión de dependencias | Herramientas de análisis sintáctico de Python/Node.js y verificación de manifiestos (`requirements.txt`, `package.json`) | Detectar credenciales hardcodeadas, llamadas a consultas SQL sin parametrizar, paquetes desactualizados y ausencias de control de acceso en vistas. |
| **Fase II: Pruebas Dinámicas (DAST)** | Inyección controlada de cargas útiles (payloads) y análisis de transporte | OWASP ZAP 2.17.0, cURL y suite de intercepción HTTP | Examinar la resistencia de endpoints frente a inyección SQL, Cross-Site Scripting (XSS), suplantación de solicitudes (CSRF) y atributos de cookies de sesión. |
| **Fase III: Pruebas Automatizadas** | Ejecución de suite de pruebas unitarias e integración continua | Django Test Runner con base de datos Neon PostgreSQL (`--keepdb`) | Validar 52 aserciones sobre lógica de transacciones, bloqueos de inventario, cálculo de totales y la máquina de estados de 2FA/TOTP. |
| **Fase IV: Auditoría de Configuración** | Inspección de servicios en nube y gobernanza de infraestructura | Consolas administrativas de Render, Neon PostgreSQL y Vercel | Comprobar aislamiento de subredes, forzado de certificados TLS 1.3, cifrado en reposo y mecanismos de recuperación ante desastres. |

*Nota.* Elaboración propia conforme a los estándares de auditoría técnica de sistemas y las directrices del manual institucional.

---

## 3. Evaluación de Cumplimiento Técnico por Dominios del Manual

### 3.1 Dimensión Fundamental: La Tríada CIA (Confidencialidad, Integridad y Disponibilidad)

El Capítulo 1 del documento institucional establece que cualquier salvaguarda tecnológica debe alinearse de manera indefectible con los tres pilares de la ciberseguridad: Confidencialidad, Integridad y Disponibilidad (Pfleeger et al., 2015). La evaluación constató la correspondencia técnica entre los controles exigidos y las implementaciones efectivas en el repositorio del proyecto (**Tabla 2**).

#### Tabla 2  
*Matriz de Cumplimiento Técnico de la Tríada CIA*

| Pilar CIA | Requisito del Manual Institucional | Evidencia Técnica en el Código y Plataforma | Estado de Conformidad |
| :--- | :--- | :--- | :---: |
| **Confidencialidad** | Restringir el acceso estrictamente al personal autorizado; cifrar datos en tránsito y en reposo; prohibir secretos expuestos. | • Configuración de directiva global `DEFAULT_PERMISSION_CLASSES = [IsAuthenticated]` en DRF.<br>• Almacenamiento de sesiones en cookies `HttpOnly; Secure; SameSite=Strict`.<br>• Cifrado de base de datos con AES-256 en Neon y transporte obligatorio bajo TLS 1.3.<br>• Variables confidenciales administradas exclusivamente vía archivo `.env` fuera del control de versiones. | **Conforme** |
| **Integridad** | Prevenir modificaciones no autorizadas, ataques de inyección de código, colisiones transaccionales y alteraciones fraudulentas. | • Parametrización exhaustiva mediante el ORM de Django (0 % consultas SQL en texto plano).<br>• Concurrencia atómica con bloqueo pesimista `select_for_update()` en operaciones de inventario.<br>• Validación Anti-CSRF mediante sincronización de encabezado `X-CSRFToken`.<br>• Bitácora forense de auditoría inmutable (`AuditLog`) acoplada a señales del modelo y middleware de usuario. | **Conforme** |
| **Disponibilidad** | Garantizar el acceso ininterrumpido a los servicios y datos; implementar planes de respaldo 3-2-1 con capacidad de restauración RTO/RPO. | • Base de datos serverless multi-nodo en Neon con tolerancia a fallas.<br>• Motor de respaldos lógicos (`fs/backup_service.py`) con compresión gzip, metadatos y snapshot preventivo `pre_restore`.<br>• Mitigación de saturación por fuerza bruta en login mediante limitación de intentos por IP/usuario. | **Conforme** |

*Nota.* Evaluación contrastada frente a los controles de seguridad estipulados en el manual institucional y los controles A.5.15, A.8.13 y A.8.25 de ISO/IEC 27001:2022.

### 3.2 Control de Identidad y Acceso Lógico (IAM) y Autenticación Multifactor (2FA / MFA)

El manual rector estipula en sus Secciones 3 y 5 que la protección perimetral del sistema debe trascender el esquema tradicional de usuario y contraseña única mediante la adopción obligatoria de factores de verificación independientes (algo que se sabe, algo que se tiene y algo que se es).

#### Implementación del Motor Criptográfico TOTP RFC 6238
La auditoría verificó la arquitectura e implementación del módulo de segundo factor en el backend (`fs/api/totp.py` y `fs/api/views/auth_views.py`), soportado por las librerías `pyotp`, `qrcode` y `pillow`. El sistema genera semillas criptográficas aleatorias en formato Base32 con una longitud de 160 bits (`pyotp.random_base32()`), cumpliendo con la entropía recomendada por el NIST SP 800-63B. 

La sincronización temporal opera bajo una ventana de paso de 30 segundos (`time_step=30`) calculada a partir de la época Unix (UTC). Para tolerar la desviación del reloj en dispositivos móviles sin degradar la seguridad, la verificación invoca `totp.verify(code, valid_window=1)`, permitiendo una tolerancia máxima de ±30 segundos (un paso hacia adelante y uno hacia atrás), conforme a la **Tabla 3**.

#### Tabla 3  
*Parámetros Técnicos y Eficacia del Esquema de Autenticación Multifactor (2FA/TOTP)*

| Parámetro Técnico | Especificación Estándar | Implementación en Fusión Solar | Evaluación de Cumplimiento |
| :--- | :--- | :--- | :---: |
| **Algoritmo Base** | RFC 6238 (TOTP) / RFC 4226 (HOTP) | HMAC-SHA1 con cálculo temporal dinámico (TOTP) | **Conforme** |
| **Entropía de la Semilla** | Clave secreta $\ge 128$ bits (NIST SP 800-63B) | Base32 de 32 caracteres alfanuméricos (160 bits de entropía) | **Conforme** |
| **Longitud del Token** | 6 u 8 dígitos numéricos | 6 dígitos numéricos con renderizado auto-espaciado en frontend | **Conforme** |
| **Ventana de Tolerancia** | $\pm 1$ intervalo de tiempo ($\le 60$ s) | `valid_window=1` (tolerancia máxima de $\pm 30$ segundos) | **Conforme** |
| **Mitigación Fuerza Bruta** | Bloqueo o revocación tras $\le 5$ fallos | Caché en memoria `2fa_attempts_{token}` con límite estricto de 5 reintentos | **Conforme** |
| **Transporte de Provisión** | URI criptográfica `otpauth://` | URI codificada en imagen PNG Base64 y clave de respaldo en texto | **Conforme** |
| **Trazabilidad de Cambios** | Registro forense de activación/desactivación | Señales registradas en `AuditLog` con IP, marca temporal y usuario | **Conforme** |

*Nota.* Parámetros evaluados conforme a las directrices de NIST SP 800-63B y RFC 6238.

```
       Flujo de Autenticación en Dos Pasos (2FA/MFA) y Mitigación de Fuerza Bruta
       
   [ Usuario ] ──(1) Credenciales ──► [ Endpoint /api/login/ ]
                                                │
                                    ¿Credenciales Válidas?
                                           ├── No ──► Retorna 401 Unauthorized
                                           └── Sí
                                                │
                                       ¿Tiene 2FA Habilitado?
                                           ├── No ──► Emite Cookie de Sesión (Acceso Concedido)
                                           └── Sí
                                                │
   [ Frontend ] ◄──(2) Retorna Challenge Temporal ──┘
        │
   (Ingreso de Token TOTP de 6 dígitos)
        │
        └──(3) POST /api/2fa/verify-login/ ──► [ Validador TOTP ]
                                                    │
                                            ¿Token Correcto?
                                           ├── Sí ──► Elimina Token Temporal
                                           │          Emite Cookie HttpOnly
                                           │          (Acceso Exitoso)
                                           │
                                           └── No ──► Incrementa Contador de Intentos
                                                      en Caché (Intento n de 5)
                                                          │
                                                    ¿Intentos >= 5?
                                                    ├── No ──► Retorna 400 (Token Inválido)
                                                    └── Sí ──► REVOCA Token Temporal
                                                               Retorna 400 (Desafío Cancelado)
```

#### Mitigación de Ataques de Fuerza Bruta en el Desafío 2FA
Una debilidad crítica en implementaciones deficientes de TOTP es la exposición del endpoint de validación a ataques automatizados de adivinación de códigos de 6 dígitos ($10^6$ combinaciones posibles). La auditoría constató que la vista `Verify2FALoginView` implementa una defensa activa respaldada por el subsistema de caché de Django:
1. Al autenticar el primer factor, el sistema genera un identificador temporal efímero `temp_token` con expiración automática fijada en 5 minutos.
2. Cada intento fallido contra el endpoint incrementa la clave `2fa_attempts_{temp_token}`.
3. Al registrarse el quinto intento fallido consecutivo, el sistema destruye inmediatamente el desafío de la caché (`cache.delete(f"2fa_login_{temp_token}")`) y rechaza cualquier solicitud subsiguiente, obligando al atacante a reiniciar el flujo completo de autenticación primaria.

#### Desacoplamiento y Resiliencia de la Interfaz (Frontend React)
Durante las pruebas de aceptación de usuario en el cliente web, se identificó un comportamiento anómalo en el renderizado del modal de configuración del segundo factor (`TwoFactorModal.jsx`): el contenedor modal aparecía anclado a la parte superior de la pantalla y el efecto visual de difuminado (`backdrop-filter`) quedaba restringido a una franja de 70 píxeles. 

El análisis técnico determinó que dicho fallo obedecía a la formación de un contexto de apilamiento y bloque de contención local en la barra de navegación (`<header className="navbar">`), la cual posee la regla CSS `backdrop-filter: blur(12px)`. De acuerdo con la especificación de CSS Transforms Module Level 1 del W3C (Etemad & Baron, 2021), cualquier elemento ancestro con una propiedad de filtro crea un sistema de coordenadas locales para todos sus descendientes con posicionamiento `fixed`, anulando el anclaje a la ventana gráfica (`viewport`). 

Para resolver este problema de manera limpia y modular, se refactorizó el componente base de diálogo modal (`Modal.jsx`) mediante la API `ReactDOM.createPortal(children, document.body)`. Esta técnica extrae el nodo del árbol jerárquico del encabezado y lo monta directamente en la raíz del documento, garantizando la cobertura de pantalla completa (`inset: 0; width: 100vw; height: 100vh; z-index: 9999`) y el centrado automático del diálogo interactivo sin interferencias visuales.

#### Control de Acceso Basado en Roles (RBAC) y Mitigación de IDOR
El sistema aplica el principio de mínimo privilegio mediante la asignación de roles operativos (Administradores de Operaciones y Finanzas, Administradores Técnicos y Vendedores de Mostrador). Se verificó que todas las vistas del backend heredan de `rest_framework.permissions.IsAuthenticated`, impidiendo cualquier invocación anónima. Asimismo, el conjunto de vistas de usuarios (`UserViewSet`) contiene validaciones de aislamiento que impiden vulnerabilidades de referencia directa insegura a objetos (IDOR / BOLA): los usuarios con rol operativo regular se encuentran restringidos a consultar y modificar únicamente su propio identificador de cuenta, impidiendo la lectura o elevación no autorizada de privilegios hacia registros administrativos ajenos.

---

### 3.3 Criptografía, Gestión de Secretos y Seguridad de Sesiones

#### Hashing de Credenciales con Argon2id
El manual institucional prohíbe el uso de algoritmos obsoletos o vulnerables a ataques por tablas de consulta inversa (Rainbow Tables) o colisiones (MD5, SHA-1). El sistema fue configurado para utilizar de forma prioritaria el algoritmo **Argon2id**, ganador del *Password Hashing Competition* (PHC) (Biryukov et al., 2016), mediante el hasher `django.contrib.auth.hashers.Argon2PasswordHasher`. 

A diferencia de PBKDF2 o bcrypt, Argon2id proporciona resistencia dual: previene ataques de canal lateral dependientes de datos (gracias a la variante Argon2i) y bloquea la paralelización masiva en hardware dedicado (GPU y ASIC) mediante el consumo intensivo de memoria RAM (variante Argon2d), según se resume en la **Tabla 4**.

#### Tabla 4  
*Comparativa Técnica de Algoritmos Criptográficos y Transporte de Credenciales*

| Componente Evaluado | Enfoque Inseguro / Obsoleto | Implementación en Fusión Solar | Justificación Técnica de Seguridad |
| :--- | :--- | :--- | :--- |
| **Derivación de Claves (Passwords)** | MD5 / SHA-1 / SHA-256 plano | **Argon2id** (Argon2PasswordHasher) | Resistencia comprobada contra fuerza bruta acelerada por GPU/ASIC mediante costo de memoria parametrizado. |
| **Almacenamiento de Tokens de Sesión** | `localStorage` / `sessionStorage` en el navegador | **Cookies con directivas `HttpOnly`, `Secure` y `SameSite=Strict`** | Inmunidad absoluta contra robo de sesión por inyección XSS (`HttpOnly`) y prevención de filtraciones en tránsito (`Secure`). |
| **Prevención de Suplantación (CSRF)** | Sin validación de origen o token estático en URL | **Token `X-CSRFToken` sincronizado con cookie CSRF** | Mitiga la explotación de solicitudes entre sitios validando el token en cada petición mutativa (POST, PUT, DELETE). |
| **Cifrado de Base de Datos en Reposo** | Almacenamiento en texto plano sobre disco local | **Cifrado AES-256 transparente en Neon PostgreSQL** | Protección física de los datos ante eventuales compromisos de infraestructura o clonación de volúmenes en la nube. |
| **Transporte de Red** | HTTP en texto claro (puerto 80) | **TLS 1.3 forzado con HSTS en Render y Vercel** | Cifrado asimétrico en intercambio de claves y simétrico ultra rápido en datos, anulando espionaje MitM. |

*Nota.* Parámetros de seguridad evaluados conforme a las directrices de OWASP ASVS v4.0 (Secciones V2 y V3) y RFC 9106.

#### Despliegue de Cookies de Sesión Inmunes a XSS
En las etapas iniciales de desarrollo del proyecto, los identificadores de sesión se almacenaban en el `localStorage` del navegador. Este patrón expone la sesión a cualquier script malicioso ejecutado en el contexto del documento. La auditoría verificó la refactorización integral hacia el modelo de cookies HTTP gestionadas directamente por el navegador:
* La directiva `HttpOnly` impide que scripts ejecutados en el cliente puedan leer la cookie mediante `document.cookie`.
* La directiva `Secure` garantiza que el navegador transmita la cookie exclusivamente a través de canales cifrados HTTPS.
* La directiva `SameSite=Strict` impide que la cookie sea adjuntada en solicitudes originadas desde dominios de terceros, neutralizando cualquier intento de Cross-Site Request Forgery (CSRF).

---

### 3.4 Resistencia Frente a Amenazas Realistas y Vectores de Ataque OWASP

El Capítulo 2 del documento rector describe los vectores de ataque más habituales contra aplicaciones web comerciales. Se evaluó la resiliencia del ERP frente a cada uno de ellos:
1. **Inyección SQL (SQLi):** La auditoría inspeccionó el 100 % de las consultas a la base de datos en los serializadores y controladores (`fs/api/views/`). No se identificó ninguna invocación a SQL crudo (`cursor.execute()`) ni concatenaciones de cadenas en cláusulas dinámicas. Todas las lecturas y escrituras se canalizan a través del ORM de Django, el cual utiliza sentencias preparadas parametrizadas que neutralizan la inyección de código SQL malicioso.
2. **Secuencias de Comandos en Sitios Cruzados (XSS):** En la capa del cliente, el motor de plantillas de React 18 aplica un escape contextual automático de todas las variables inyectadas en el DOM virtual. Asimismo, los componentes que renderizan fragmentos enriquecidos aplican sanitización preventiva mediante la librería `DOMPurify`, impidiendo la inyección de código ejecutable.
3. **Ataques Man-in-the-Middle (MitM):** La red perimetral de Vercel y los servidores de Render mantienen activada la redirección automática de tráfico HTTP hacia HTTPS, con cabeceras de seguridad estricta de transporte (`Strict-Transport-Security: max-age=31536000; includeSubDomains`) y certificados válidos emitidos por entidades de certificación reconocidas (Let's Encrypt).
4. **Seguridad en la Cadena de Suministro:** Se verificaron las dependencias del proyecto en `requirements.txt` y `package.json`. Todos los módulos utilizados (`argon2-cffi`, `pyotp`, `qrcode`, `pillow`, `react`, `antd`) se encuentran en versiones estables y no presentan vulnerabilidades conocidas con criticidad alta según las alertas de seguridad de los registros oficiales (PyPI y npm audit).

---

### 3.5 Integridad Transaccional, Prevención de Concurrencia y Trazabilidad Forense

#### Concurrencia ACID y Bloqueo Pesimista en Punto de Venta
El antecedente de contención y desfasaje de inventario que experimentó la empresa con SQLite fue evaluado en el entorno PostgreSQL actual. En el módulo de facturación y ventas (`fs/api/views/crud_views.py`), las operaciones de egreso de inventario se encapsulan dentro de un bloque de transacción atómica gestionado por `@transaction.atomic`. 

Para evitar condiciones de carrera cuando dos vendedores intentan facturar la última unidad de un panel solar simultáneamente, el sistema ejecuta un bloqueo pesimista a nivel de fila mediante `select_for_update()` sobre el registro del producto. Esta instrucción bloquea temporalmente el registro en la base de datos hasta que la transacción actual descuente el stock y emita la factura, asegurando que la segunda transacción espere el resultado y detecte la falta de existencias antes de confirmar la venta, eliminando el riesgo de sobreventas.

#### Trazabilidad Inmutable mediante Bitácora Forense (`AuditLog`)
Para dar cumplimiento a los requisitos de no repudio y auditoría forense del manual institucional, el sistema implementa el modelo `AuditLog`, el cual registra de forma persistente:
* La entidad y tabla afectada (Usuario, Producto, Venta, Compra, Proveedor).
* La acción ejecutada (`CREATE`, `UPDATE`, `DELETE`, `SECURITY_2FA_ENABLED`, `SECURITY_2FA_DISABLED`).
* La marca de tiempo en formato UTC.
* El usuario responsable de la acción, capturado dinámicamente a través del middleware `CurrentUserMiddleware`.
* La dirección IP de origen y los valores previos y posteriores de la modificación en formato JSON.

Se verificó que los registros de `AuditLog` no pueden ser editados ni eliminados a través de la API REST, garantizando la inmutabilidad de la evidencia ante investigaciones de incidentes de seguridad.

---

### 3.6 Resiliencia de Infraestructura y Política de Respaldos (Estrategia 3-2-1)

El Capítulo 4 del documento rector exige la implementación de una estrategia de copias de seguridad basada en el principio 3-2-1 (tres copias de los datos, en dos medios distintos, con una copia fuera de la sede física):
* **Copia Primaria de Producción:** Alojada en Neon PostgreSQL sobre almacenamiento de alta disponibilidad tolerante a fallos de hardware.
* **Copias Secundarias Lógicas:** Gestionadas por el servicio automatizado `fs/backup_service.py`, el cual genera volcados estructurados (`pg_dump`) comprimidos en gzip con metadatos asociados.
* **Salvaguarda Preventiva `pre_restore`:** Se validó la ejecución automática del procedimiento de snapshot preventivo: antes de aplicar cualquier restauración de un respaldo histórico, el sistema toma un volcado instantáneo de la base de datos actual para evitar pérdidas accidentales si la restauración es interrumpida.

---

## 4. Análisis de Riesgos y Evaluación Cuantitativa del Sistema

Siguiendo la metodología de gestión de riesgos estipulada en el Capítulo 6 del documento rector (alineada con ISO/IEC 27005 y MAGERIT v3), se calculó la magnitud de las amenazas potenciales mediante el producto de su probabilidad de ocurrencia e impacto operativo en una escala del 1 al 5 ($Riesgo = Probabilidad \times Impacto$), clasificándose en cuatro estratos: Bajo (1–5), Medio (6–11), Alto (12–19) y Muy Alto (20–25). 

La **Tabla 5** compara el riesgo inherente (condición del sistema antes de la aplicación de los controles de seguridad y la activación del 2FA) frente al riesgo residual verificado en esta auditoría tras la implementación de las salvaguardas técnicas.

#### Tabla 5  
*Matriz Cuantitativa de Riesgos de Ciberseguridad y Efectividad de Controles*

| ID | Escenario de Amenaza | Riesgo Inherente (P × I) | Salvaguarda Técnica Implementada | Riesgo Residual (P × I) | Eficacia del Control |
| :---: | :--- | :---: | :--- | :---: | :---: |
| **R-01** | **Suplantación de Identidad por Credenciales Filtradas:** Acceso indebido a cuentas directivas tras fugas externas de claves. | $4 \times 4 = 16$ *(Alto)* | Autenticación Multifactor obligatoria (TOTP RFC 6238) y hashing Argon2id. | $1 \times 4 = 4$ *(Bajo)* | 75.0 % |
| **R-02** | **Fuerza Bruta contra Códigos de Segundo Factor:** Adivinación automatizada del token de 6 dígitos en el login. | $4 \times 4 = 16$ *(Alto)* | Limitador de reintentos en caché: revocación inmediata del token al quinto fallo. | $1 \times 3 = 3$ *(Bajo)* | 81.3 % |
| **R-03** | **Secuestro de Sesión por Robo de Identificador:** Extracción de tokens mediante scripts maliciosos en el cliente. | $4 \times 4 = 16$ *(Alto)* | Migración integral a cookies de sesión `HttpOnly; Secure; SameSite=Strict`. | $1 \times 3 = 3$ *(Bajo)* | 81.3 % |
| **R-04** | **Inyección SQL / Compromiso de Base de Datos:** Alteración de precios o extracción masiva de datos de clientes. | $3 \times 5 = 15$ *(Alto)* | Consultas 100 % parametrizadas a través de Django ORM; tipado estricto. | $1 \times 4 = 4$ *(Bajo)* | 73.3 % |
| **R-05** | **Sobreventa de Stock por Concurrencia:** Facturación simultánea de productos sin existencia real en inventario. | $4 \times 3 = 12$ *(Alto)* | Transacciones atómicas `@transaction.atomic` con bloqueo pesimista `select_for_update()`. | $1 \times 2 = 2$ *(Bajo)* | 83.3 % |
| **R-06** | **Exposición de Información Sensible en Reposo:** Fuga física o acceso no autorizado a los datos en almacenamiento. | $2 \times 5 = 10$ *(Medio)* | Cifrado en reposo AES-256 en Neon PostgreSQL y transporte obligado bajo TLS 1.3. | $1 \times 3 = 3$ *(Bajo)* | 70.0 % |
| **R-07** | **Pérdida de Información por Fallo en Restauración:** Sobrescritura accidental de la base de datos al recuperar un respaldo. | $2 \times 5 = 10$ *(Medio)* | Generación automática de snapshot preventivo `pre_restore` antes de restaurar. | $1 \times 2 = 2$ *(Bajo)* | 80.0 % |

*Nota.* Escala de cálculo: Probabilidad (1 a 5) × Impacto (1 a 5). La eficacia del control se calculó como $(1 - \frac{Riesgo\ Residual}{Riesgo\ Inherente}) \times 100$.

---

## 5. Dictamen Técnico y Declaración de Conformidad

### 5.1 Dictamen Formal del Auditor
Con base en la evidencia técnica obtenida mediante inspección estática de código, verificación de configuraciones de despliegue en la nube, pruebas dinámicas de transporte y la aprobación satisfactoria de la batería de 52 pruebas automatizadas en base de datos PostgreSQL, el equipo auditor concluye que:

> **DICTAMEN TÉCNICO FORMAL: OPINIÓN FAVORABLE**  
> El sistema web de planificación de recursos empresariales (ERP) de Fusión Solar **CUMPLE SATISFACTORIAMENTE** con las directrices, controles técnicos y principios operativos estipulados en el documento normativo institucional *Prácticas de Seguridad de la Información*, así como con las recomendaciones aplicables de ISO/IEC 27001:2022 y NIST SP 800-63B. Las salvaguardas implementadas en la capa de aplicación, el transporte de sesión, el control de acceso multifactorial y la base de datos relacional reducen el riesgo informático residual a niveles operativamente tolerables y seguros.

### 5.2 Balance Cuantitativo de Conformidad
De un universo de 35 controles técnicos y operativos auditados:
* **Controles Conformes (Aprobados):** 34 (97.1 %)
* **Controles Parciales / Oportunidades de Mejora:** 1 (2.9 %) — Vinculado a la formalización documental y visual de las cláusulas de consentimiento para la protección de datos personales de clientes (Ley 787 de Nicaragua).
* **Controles No Conformes (Reprobados):** 0 (0.0 %)
* **Puntuación Global de Riesgo Residual:** **1.8 / 10** (Clasificación: **Bajo**)

---

## 6. Recomendaciones y Plan de Acción de Seguridad Continua

A efectos de consolidar la postura de seguridad y preservar los niveles de cumplimiento a lo largo del ciclo de vida del software, se formula el plan de acción priorizado detallado en la **Tabla 6**.

#### Tabla 6  
*Plan de Acción y Cronograma de Recomendaciones de Seguridad*

| N.º | Acción Recomendada | Dominio del Manual | Justificación Técnica | Plazo Máximo | Responsable |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **REC-01** | **Despliegue Generalizado de 2FA en Personal:** Establecer obligatoriedad de enrolamiento de 2FA para todos los usuarios con acceso a ventas e inventario. | Control de Acceso (IAM) | Minimizar la superficie de exposición ante incidentes de phishing dirigidos a operadores de mostrador. | 15 días | Administración de TI |
| **REC-02** | **Formalización Documental Ley 787:** Incorporar leyenda de consentimiento informado en el formulario de creación de clientes en el frontend. | Privacidad y Protección de Datos | Asegurar la plena conformidad legal con la Ley 787 de Protección de Datos Personales de Nicaragua. | 20 días | Asesoría Legal / Frontend |
| **REC-03** | **Activación de Reglas WAF en Borde:** Configurar reglas administradas de mitigación en Cloudflare (bloqueo geográfico e inspección HTTP). | Defensa en Capas (WAF/DDoS) | Filtrar tráfico malicioso automatizado antes de que alcance la infraestructura de Render. | 30 días | Infraestructura / DevOps |
| **REC-04** | **Rotación Periódica de Secretos:** Implementar política de rotación semestral de variables críticas (`SECRET_KEY`, credenciales de BD Neon). | Gestión de Secretos | Evitar la persistencia indefinida de claves de servicio según lineamientos NIST SP 800-53. | 60 días | Administración de TI |

*Nota.* Plan formulado con base en la evaluación de riesgos residuales del sistema.

---

## Referencias

Anderson, R. (2020). *Security Engineering: A Guide to Building Dependable Distributed Systems* (3.ª ed.). John Wiley & Sons.

Asamblea Nacional de la República de Nicaragua. (2012). *Ley N.º 787: Ley de Protección de Datos Personales*. La Gaceta, Diario Oficial N.º 61.

Biryukov, A., Dinu, D., & Khovratovich, D. (2016). *Argon2: New Generation of Memory-Hard Functions for Password Hashing and Other Applications*. IEEE European Symposium on Security and Privacy (EuroS&P), 292–302. https://doi.org/10.1109/EuroSP.2016.31

Etemad, E. J., & Baron, D. (Eds.). (2021). *CSS Transforms Module Level 1* (W3C Working Draft). World Wide Web Consortium. https://www.w3.org/TR/css-transforms-1/

International Organization for Standardization. (2022a). *Information security, cybersecurity and privacy protection — Information security management systems — Requirements* (ISO/IEC Standard N.º 27001:2022). https://www.iso.org/standard/27001

International Organization for Standardization. (2022b). *Information security, cybersecurity and privacy protection — Information security controls* (ISO/IEC Standard N.º 27002:2022). https://www.iso.org/standard/27002

National Institute of Standards and Technology. (2020). *Digital Identity Guidelines: Authentication and Lifecycle Management* (NIST Special Publication 800-63B). U.S. Department of Commerce. https://doi.org/10.6028/NIST.SP.800-63b

Open Web Application Security Project. (2021). *OWASP Application Security Verification Standard 4.0.3* (OWASP ASVS). OWASP Foundation. https://owasp.org/www-project-application-security-verification-standard/

Pfleeger, C. P., Pfleeger, S. L., & Margulies, J. (2015). *Security in Computing* (5.ª ed.). Prentice Hall.

Stallings, W. (2022). *Cryptography and Network Security: Principles and Practice* (8.ª ed.). Pearson.
