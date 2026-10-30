
# Seguridad Informática

**Guía Fundamental de Seguridad Informática: Desde Cero hasta las Bases Profesionales**

La seguridad informática (o ciberseguridad) es la disciplina encargada de proteger la información, los sistemas, las redes y los dispositivos frente a accesos no autorizados, daños, interrupciones o robos.

Para entenderla sin conocimientos previos, imagina que tu información digital es una casa: la seguridad informática abarca desde poner cerraduras firmes en las puertas hasta instalar alarmas, verificar quién llama al timbre y saber qué hacer si un intruso logra entrar.

## 1. La Cíclica Triada CIA: Los Tres Pilares de la Ciberseguridad

Cualquier medida, norma o herramienta de ciberseguridad busca proteger al menos uno de los tres pilares del modelo CIA:

> *[Imagen: Los tres pilares de la ciberseguridad - Confidencialidad, Integridad y Disponibilidad]*

### 1. Confidencialidad
Garantiza que la información solo sea accesible por las personas o sistemas autorizados.
* **Ejemplo práctico:** Cuando entras a tu cuenta bancaria desde el móvil, tus saldos y movimientos solo los puedes ver tú y el sistema del banco. Si un tercero pudiera interceptar y leer esa pantalla sin permiso, se rompería la confidencialidad.

### 2. Integridad
Asegura que los datos no hayan sido alterados, modificados o destruidos de forma fraudulenta o por error desde su creación.
* **Ejemplo práctico:** Envías una transferencia bancaria de $100. Si un atacante intercepta la red y altera el valor para que la cuenta de destino reciba $10,000, la información ha perdido su integridad.

### 3. Disponibilidad
Garantiza que la información y los servicios estén accesibles para los usuarios autorizados en el momento en que los necesiten.
* **Ejemplo práctico:** Si un hospital necesita consultar el expediente médico de un paciente en urgencias y el servidor colapsa por un ataque informático, el sistema pierde disponibilidad, poniendo en riesgo la atención.

---

## 2. Los Principales Vectores de Ataque y Amenazas Realistas

Para defender un entorno, primero debemos comprender cómo atacan los ciberdelincuentes. Los métodos se dividen principalmente en ingeniería social (explotar el factor humano) y vulnerabilidades técnicas (explotar fallos en el código o configuración).

### A. Ingeniería Social: Explotando la Mente Humana

**1. Phishing (Suplantación de Identidad)**
Es un método mediante el cual el atacante envía correos, mensajes de texto (SMS) o chats simulando ser una entidad de confianza (un banco, Google, Recursos Humanos) para engañarte y lograr que entregues credenciales o datos confidenciales.
* **Escenario de ejemplo:** Recibes un correo de `soporte@ban-co.com` (nota la errata sutil) informando que tu cuenta será suspendida en 2 horas si no actualizas tu clave. Haces clic en el enlace, el cual te lleva a una copia exacta de la web de tu banco. Introduces tu usuario y contraseña, y sin saberlo, se los has entregado al atacante.

**2. Ransomware (Secuestro de Datos)**
Es un tipo de programa malicioso (malware) que encripta (cifra) los archivos de tu ordenador o servidor, volviéndolos inaccesibles, y exige el pago de un rescate (habitualmente en criptomonedas) para darte la clave de desencriptación.
* **Escenario de ejemplo:** Un empleado descarga un archivo PDF adjunto titulado `Factura_Pendiente.pdf.exe`. Al ejecutarlo, el malware se extiende en segundo plano por toda la red corporativa, cifrando hojas de cálculo, bases de datos y documentos de la empresa. Aparece una nota en pantalla: "Sus archivos han sido cifrados. Pague 2 BTC antes de 48 horas o perderá todo".

### B. Vulnerabilidades Técnicas y de Red

**3. Ataques Man-in-the-Middle (MitM / Hombre en el Medio)**
Ocurre cuando un atacante se sitúa secretamente entre la comunicación de dos partes (por ejemplo, tu portátil y un sitio web) para escuchar o alterar el tráfico de datos.
* **Escenario de ejemplo:** Te conectas al Wi-Fi público y gratuito de una cafetería llamado `Cafeteria_Free_WiFi`. En realidad, esa red fue creada por un atacante sentado a dos mesas de distancia usando un dispositivo portátil. Todo lo que escribas mientras navegas por sitios no cifrados pasa a través de su dispositivo en texto plano.

**4. Ataques de Denegación de Servicio Distribuida (DDoS)**
Consiste en saturar un servidor, aplicación o red con un volumen masivo de tráfico generado por miles de ordenadores infectados (botnet), provocando que el servicio colapse y deje de funcionar para los usuarios legítimos.
* **Escenario de ejemplo:** Una tienda de comercio electrónico prepara un evento de rebajas. Un competidor malintencionado contrata una botnet que envía 500,000 peticiones por segundo a la web. El servidor se queda sin memoria ni procesamiento y cae por completo, dejando de vender durante todo el día.

---

## 3. Principios Fundamentales de Defensa y Buenas Prácticas

Proteger un entorno digital no requiere software costoso de inmediato; comienza aplicando principios sólidos de seguridad:

### 1. Autenticación de Doble Factor (2FA / MFA)
No confíes únicamente en una contraseña. La autenticación multifactor requiere al menos dos de tres elementos para validar tu identidad:
* **Algo que sabes:** Tu contraseña o PIN.
* **Algo que tienes:** Tu teléfono móvil (para recibir una clave en una app autenticadora como Google Authenticator) o una llave física USB de seguridad.
* **Algo que eres:** Tu huella dactilar o reconocimiento facial.
> *Regla de oro: Si un atacante roba tu contraseña pero tienes activado el 2FA en tu app de autenticación, no podrá acceder a tu cuenta.*

### 2. Principio del Menor Privilegio (Least Privilege)
A cada usuario, aplicación o proceso se le debe otorgar únicamente el nivel de acceso estrictamente necesario para realizar sus tareas diarias, nada más.
* **Ejemplo práctico:** El diseñador gráfico de una empresa no necesita acceso de escritura a la base de datos de contabilidad, ni el recepcionista necesita permisos de administrador en el sistema operativo. Si la cuenta del recepcionista es comprometida, el atacante no obtendrá privilegios de administrador.

### 3. Gestión de Parches y Actualizaciones
El software que utilizamos contiene errores de programación (bugs). Cuando un fabricante descubre un fallo de seguridad, publica una actualización o parche.
* Si no actualizas tu sistema operativo o tus programas, dejas "puertas abiertas" conocidas por los ciberdelincuentes, quienes usan herramientas automatizadas para escanear la red e invadir dispositivos desactualizados.

---

## 4. Plan de Acción Inicial para Proteger tu Entorno

Si deseas empezar a aplicar ciberseguridad hoy mismo, sigue esta secuencia estructurada:

| Paso | Acción Recomendada | Propósito |
| :--- | :--- | :--- |
| 1 | Usar un Gestor de Contraseñas (ej. Bitwarden, 1Password) | Generar y almacenar claves únicas, complejas y aleatorias para cada servicio sin tener que memorizarlas. |
| 2 | Activar 2FA/MFA en todas las cuentas críticas | Proteger correos, banca digital y redes sociales en caso de filtración de claves. |
| 3 | Configurar Copias de Seguridad (Backup 3-2-1) | Mantener 3 copias de datos importantes, en 2 medios distintos, con 1 copia fuera de la ubicación física (nube). |
| 4 | Mantener actualizaciones automáticas activas | Corregir vulnerabilidades de software antes de que puedan ser explotadas. |
| 5 | Fomentar el pensamiento crítico frente a enlaces y adjuntos | Evitar la ejecución de archivos no solicitados o el ingreso a webs dudosas. |

---

## El cifrado de datos y el protocolo HTTPS

El **cifrado de datos** es el proceso de transformar información legible (texto plano) en un código ininteligible (texto cifrado) mediante un algoritmo y una clave. Su objetivo es garantizar que, si alguien intercepta los datos en el camino, solo vea un conjunto de caracteres sin sentido.

### 1. Los Dos Tipos Principales de Cifrado
Para entender HTTPS, primero debemos distinguir cómo funcionan las dos formas de cifrado:

**A. Cifrado Simétrico (Una sola clave)**
Utiliza **la misma clave** tanto para cifrar como para descifrar la información.
* **Ejemplo práctico:** Imagina una caja fuerte con una única llave física. Cierras la caja con la llave y se la envías a un amigo. Para que tu amigo abra la caja, necesita **esa misma llave**.
* **Ventaja:** Es ultra rápido y eficiente para procesar grandes volúmenes de datos.
* **Desventaja:** ¿Cómo le entregas la llave a tu amigo de forma segura por Internet sin que nadie la intercepte?

**B. Cifrado Asimétrico (Clave Pública y Privada)**
Utiliza un par de claves matemáticamente vinculadas entre sí:
* **Clave Pública:** Se comparte abiertamente con todo el mundo. Sirve para cifrar.
* **Clave Privada:** Se guarda en secreto absoluto. Sirve para descifrar.
* **Ejemplo práctico:** Imagina que tu amigo deja un buzón con un candado abierto en la calle (Clave Pública). Cualquiera puede meter una carta, cerrar el candado y tirar la carta dentro. Sin embargo, solo tu amigo tiene la llave física (Clave Privada) para abrir el candado y leer el contenido.
* **Ventaja:** Resuelve el problema de compartir claves a distancia.
* **Desventaja:** Requiere mayor procesamiento matemático, por lo que es más lento.

### 2. ¿Qué es HTTPS y por qué combina ambos cifrados?
HTTP es el protocolo estándar para navegar por la web, pero envía la información en texto plano.
HTTPS (HyperText Transfer Protocol Secure) añade una capa de seguridad denominada TLS/SSL.
HTTPS no elige entre cifrado simétrico o asimétrico: **usa ambos en equipo**. Utiliza la velocidad del cifrado simétrico para transferir datos y la seguridad del cifrado asimétrico para intercambiar la clave secreta.

### 3. El Saludo TLS/SSL (Handshake): Paso a Paso
Cuando escribes `https://www.tubanco.com` en el navegador, ocurre un "saludo" digital en milisegundos antes de cargar la página:

1. **Solicitud inicial (Client Hello):** Navegador → Servidor.
   Tu navegador le dice al servidor del sitio web: "Hola, quiero conectarme de forma segura. Estas son las versiones de cifrado que soporto."
2. **Respuesta y Certificado (Server Hello):** Servidor → Navegador.
   El servidor responde enviando su Certificado Digital SSL/TLS, el cual contiene su Clave Pública y la identidad del sitio validada por una entidad emisora de confianza (como Let's Encrypt o DigiCert).
3. **Verificación del Certificado:** Validación en el cliente.
   Tu navegador verifica que el certificado sea auténtico, no haya expirado y pertenezca realmente a ese sitio web. (Si falla, ves la típica pantalla roja de advertencia).
4. **Creación e intercambio de la Clave de Sesión: Cifrado Asimétrico.**
   El navegador genera una Clave Simétrica Secreta (clave de sesión) temporal. Cifra esta clave usando la Clave Pública del servidor y se la envía. Como solo el servidor tiene la Clave Privada, únicamente él puede descifrarla.
5. **Inicio de la comunicación privada: Cifrado Simétrico.**
   Ahora, tanto el navegador como el servidor tienen la misma Clave Simétrica Secreta. A partir de este momento, todas las contraseñas, búsquedas y datos transferidos se cifran con esta clave ultra rápida.

### Comparativa de Tráfico: HTTP vs. HTTPS

| Atributo | HTTP (No seguro) | HTTPS (Seguro) |
| :--- | :--- | :--- |
| Tránsito de datos | Texto plano (Legible por cualquiera) | Texto cifrado (8f3a9b...) |
| Puerto por defecto | Puerto 80 | Puerto 443 |
| Protección contra MitM | Ninguna (Vulnerable a espionaje) | Alta (Resistente a manipulación o lectura) |
| Identidad verificada | No verifica la identidad del sitio | Verifica el sitio mediante Certificados Digitales |

---

## Cómo funcionan las Autoridades de Certificación (CA) y cómo validan la identidad de los sitios web.

Una Autoridad de Certificación (CA) es una entidad de confianza de terceros encargada de emitir y gestionar Certificados Digitales SSL/TLS. Su función en Internet es equivalente a la de un registro civil o una oficina de pasaportes: verificar la identidad de una entidad (un sitio web) y emitir un documento oficial e infalsificable que lo demuestre.

Sin las CAs, cualquiera podría crear una Clave Pública para `ban-co.com` y afirmar que es el banco real. La CA confirma que la Clave Pública pertenece efectivamente al dueño legítimo del dominio.

### 1. ¿Cómo Confía tu Navegador en una CA? (La Cadena de Confianza)
Cuando instalas un sistema operativo (Windows, macOS, Linux) o un navegador (Chrome, Firefox), este ya viene con una lista preinstalada de Certificados Raíz (Root Certificates) de las CAs más prestigiosas del mundo (como DigiCert, Sectigo, Let's Encrypt).

> *[Imagen: Certificados Raíz (Root Certificates) de las CAs más prestigiosas del mundo]*

1. La CA Raíz guarda su clave privada en instalaciones con extrema seguridad física y nunca se usa directamente para firmar webs.
2. La CA Raíz firma a una CA Intermedia, delegándole la autoridad.
3. La CA Intermedia firma el certificado del sitio web final.
4. Tu navegador verifica la cadena: Si el certificado del sitio web fue firmado por una CA Intermedia legítima, y esa CA Intermedia fue firmada por una CA Raíz en la que tu navegador confía, la conexión se marca como segura (el candado verde/gris).

### 2. Niveles de Validación: ¿Cómo Verifica la CA a un Sitio Web?
Para obtener un certificado, el administrador del sitio web genera una Solicitud de Firma de Certificado (CSR) y la envía a la CA. Dependiendo de la sensibilidad del sitio, la CA aplica uno de tres niveles de validación:

**A. Validación de Dominio (DV - Domain Validation)**
Es el nivel más básico, automatizado y rápido. La CA solo comprueba que quien solicita el certificado realmente controla el dominio web.
* **Proceso de validación:** La CA le pide al administrador que realice una de estas acciones:
  * Subir un archivo de texto específico al servidor web (`http://tusitio.com/.well-known/acme-challenge/`).
  * Añadir un registro TXT específico en los DNS del dominio.
  * Responder a un correo enviado a `admin@tusitio.com`.
* **Uso típico:** Blogs, webs personales, proyectos pequeños. Ejemplo: Let's Encrypt emite estos certificados gratis en segundos mediante un proceso totalmente automatizado.

**B. Validación de Organización (OV - Organización Validación)**
Además de comprobar el control del dominio, la CA realiza una verificación humana ligera de la empresa solicitante.
* **Proceso de validación:** La CA consulta registros mercantiles oficiales para confirmar que la empresa existe legalmente, verifica su dirección física y realiza una llamada telefónica de comprobación a la sede corporativa.
* **Uso típico:** Empresas, comercios electrónicos medianos, portales corporativos.

**C. Validación Extendida (EV - Extended Validation)**
Es el nivel más estricto de auditoría legal y operativa.
* **Proceso de validación:** La CA somete a la organización a una investigación exhaustiva: verifica la existencia legal y física de la entidad, los derechos exclusivos del nombre, el estado financiero activo y valida que la persona que solicita el certificado esté autorizada legalmente por la directiva de la empresa.

### 3. Resumen del Flujo de Emisión y Verificación

> *[Imagen: Resumen del flujo de emisión y verificación de certificados]*

1. **Solicitud:** El sitio web genera un par de claves (Pública/Privada) y envía la pública a la CA junto con los datos de su dominio/empresa.
2. **Validación y Firma:** La CA valida los datos según el nivel (DV, OV o EV), firma digitalmente el certificado con su propia clave privada y se lo entrega al servidor.
3. **Presentación:** Cuando un usuario entra al sitio, el servidor le envía ese certificado.
4. **Verificación local:** El navegador del usuario descifra la firma del certificado usando la clave pública de la CA que ya tiene almacenada. Si la firma matemática coincide, el sitio es auténtico.

---

# MARCO Y GOBIERNO DE POLÍTICAS DE SEGURIDAD INFORMÁTICA

Este documento establece los lineamientos estratégicos, operativos y técnicos para la protección de los activos de información de la organización. Su cumplimiento es de carácter obligatorio para todo el personal, contratistas y terceros que accedan a la infraestructura tecnológica.

## Políticas de Seguridad Informática (PSI)

### Definición y Alcance
Las Políticas de Seguridad Informática (PSI) constituyen el conjunto de directivas, reglas y prácticas institucionales que regulan la gestión y protección de la infraestructura tecnológica y los activos de datos. Su propósito fundamental es mitigar el riesgo operacional y garantizar la sostenibilidad operativa articulada en torno a la Tríada CID:
* **Confidencialidad:** Garantía de que la información sea accesible únicamente por personas, entidades o procesos debidamente autorizados, previniendo la divulgación no permitida mediante controles de acceso y cifrado.
* **Integridad:** Salvaguarda de la exactitud y la totalidad de la información y los métodos de procesamiento. Protege los datos contra modificaciones, inserciones o eliminaciones no autorizadas o accidentales.
* **Disponibilidad:** Aseguramiento de que los usuarios autorizados tengan acceso oportuno y confiable a los datos y recursos tecnológicos cuando lo requieran, minimizando los tiempos de parada mediante redundancia y planes de contingencia.

### Tipos de Políticas

**Políticas del Sistema (Issue-Specific Policies)**
Dirigidas a regular el uso correcto y seguro de recursos tecnológicos específicos dentro de la organización:
* **Control de Acceso:** Define los criterios de identificación, autenticación y autorización. Establece el modelo de control de acceso basado en roles (RBAC) y la validación de identidades.
* **Uso Aceptable de Activos (AUP):** Delimita las responsabilidades y conductas permitidas de los empleados al utilizar equipos, redes, correo electrónico y sistemas informáticos provistos por la institución.
* **Trabajo Remoto y BYOD (Bring Your Own Device):** Dicta los requisitos técnicos de seguridad (uso de VPN corporativa, cifrado de disco completo, postura del dispositivo) para el acceso a la red interna desde ubicaciones externas o dispositivos personales.

**Políticas Temáticas (Program Policies)**
Marcos globales que guían la estrategia institucional en dominios transversales de la ciberseguridad:
* **Gestión de Incidentes:** Protocolos para la detección, triaje, contención, erradicación y recuperación ante eventos desfavorables de seguridad, estableciendo los roles del Equipo de Respuesta a Incidentes (CSIRT).
* **Continuidad del Negocio (BCP) y Recuperación ante Desastres (DRP):** Estrategias organizacionales y técnicas para mantener la operatividad crítica durante una crisis y restaurar la infraestructura tecnológica tras una interrupción severa.
* **Clasificación de la Información:** Taxonomía obligatoria para categorizar los datos (Pública, Interna, Confidencial, Restringida) según su nivel de sensibilidad y el impacto potencial de su divulgación.

### Ciclo de Vida de las Políticas
El desarrollo y mantenimiento de las PSI debe ejecutarse bajo un enfoque iterativo estructurado en seis fases:
1. **Formulación:** Identificación de necesidades operativas, evaluación de riesgos y redacción del cuerpo normativo adaptado a la realidad organizacional.
2. **Aprobación:** Validación técnica y legal por parte del Comité de Ciberseguridad, la Dirección Jurídica y la Alta Dirección.
3. **Difusión:** Publicación formal, campañas de concienciación y recopilación del acuse de recibo de todos los colaboradores.
4. **Cumplimiento:** Implementación de controles técnicos y administrativos para la aplicación efectiva de la normativa en la operativa diaria.
5. **Auditoría:** Evaluación periódica e independiente del grado de adhesión a las políticas e identificación de brechas operativas.
6. **Revisión Continua:** Actualización anual o reactiva frente a cambios tecnológicos, nuevas amenazas emergentes o modificaciones en el marco regulatorio.

## Parámetros para la Elaboración e Implementación de Políticas Informáticas

### Criterios de Diseño
La formulación de las políticas debe estar alineada con los marcos normativos e industriales reconocidos internacionalmente para garantizar su solidez y auditabilidad:
* **ISO/IEC 27001:** Marco para el establecimiento, implementación, mantenimiento y mejora continua de un Sistema de Gestión de Seguridad de la Información (SGSI).
* **NIST SP 800-53:** Catálogo estructurado de controles de seguridad y privacidad para sistemas e instituciones, orientado a la gestión de riesgos en infraestructuras complejas.
* **COBIT (Control Objectives for Information and Related Technologies):** Marco de gobierno corporativo de TI que alinea la estrategia de ciberseguridad con las metas globales del negocio.

### Parámetros Técnicos y Operativos

**Control de Identidad y Acceso (IAM)**
* **Principio de Mínimo Privilegio (PoLP):** Asignación estricta de las autorizaciones mínimas necesarias para que un usuario o servicio ejecute sus funciones laborales.
* **Autenticación Multifactor (MFA):** Requisito obligatorio de al menos dos factores independientes de autenticación (algo que sabe, algo que tiene o algo que es) para cualquier acceso a sistemas corporativos.

**Gestión de Contraseñas y Credenciales**
* **Complejidad y Longitud:** Longitud mínima de 14 caracteres, combinando mayúsculas, minúsculas, números y caracteres especiales.
* **Rotación Basada en Riesgo:** Abandono del cambio periódico forzado sin causa justificada (siguiendo directrices NIST SP 800-63B), priorizando la rotación inmediata ante sospecha de compromiso o credenciales expuestas.
* **Gestión de Secretos:** Prohibición absoluta de credenciales incrustadas en código fuente (hardcoded). Uso obligatorio de bóvedas digitales de claves (Secrets Vaults) para aplicaciones y servicios.

**Gestión de Parches y Actualizaciones**
* **Ventanas de Mantenimiento:** Programación regular de parches de infraestructura sin interrupción del servicio crítico.
* **Priorización CVSS (Common Vulnerability Scoring System):**
  * Vulnerabilidades Críticas (CVSS >= 9.0): Aplicación de parches o mitigación obligatoria en un plazo máximo de 72 horas.
  * Vulnerabilidades Altas (CVSS 7.0 - 8.9): Aplicación en un plazo no mayor a 14 días calendario.
  * Vulnerabilidades Medias/Bajas: Aplicación dentro del ciclo mensual regular.

### Métricas e Indicadores (KPIs / KRIs)

| Categoría | Métrica / Indicador | Descripción |
| :--- | :--- | :--- |
| Cumplimiento | Cobertura de Agentes EDR | Porcentaje de endpoints con agente de seguridad activo y actualizado. |
| Cumplimiento | Parcheo de Vulnerabilidades Críticas | Porcentaje de sistemas críticos parcheados dentro de las 72h del boletín. |
| Operación | Tiempo Medio de Detección (MTTD) | Tiempo promedio transcurrido desde el compromiso hasta su identificación. |
| Operación | Tiempo Medio de Respuesta (MTTR) | Tiempo promedio desde la detección de una amenaza hasta su contención total. |
| Cultura | Tasa de Fallo en Phishing | Porcentaje de empleados que interactúan con enlaces simulados de prueba. |

---

## Privacidad en la Red y Control de Intrusos

### Privacidad y Protección de Datos

**Cifrado Tecnológico**
* **Cifrado en Tránsito:** Implementación obligatoria del protocolo TLS 1.3 para todas las comunicaciones en red interna y externa. Queda deshabilitado el uso de SSL, TLS 1.0 y TLS 1.1 por considerarse obsoletos e inseguros.
* **Cifrado en Reposo:** Aplicación del estándar AES-256 para bases de datos, almacenamiento en la nube, servidores de archivos y almacenamiento local de endpoints (BitLocker / FileVault).

**Arquitectura de Red**
* **Segmentación de Red:** División de la red corporativa en redes virtuales de área local (VLANs) aisladas por función, criticidad y nivel de acceso.
* **Arquitectura Zero Trust (ZTA):** Implementación del principio "Nunca confiar, siempre verificar". Ningún dispositivo o usuario dentro o fuera del perímetro lógico posee confianza implícita; cada solicitud de acceso debe autenticarse, autorizarse y cifrarse explícitamente antes de concederse.

### Sistemas de Detección y Prevención de Intrusos (IDS/IPS)

> *[Imagen: Sistemas de Detección y Prevención de Intrusos (IDS/IPS) - NIDS/NIPS vs HIDS/HIPS]*

**Modalidades de Despliegue**
* **NIDS / NIPS (Basados en Red):** Dispositivos desplegados en puntos estratégicos de la red que inspeccionan el tráfico en tiempo real para identificar o bloquear actividades maliciosas.
* **HIDS / HIPS (Basados en Host):** Módulos instalados directamente en los servidores y endpoints para monitorear las llamadas al sistema, la modificación de archivos críticos y los registros de la máquina local.

**Métodos de Detección**
* **Basado en Firmas:** Comparación de cadenas de bytes o patrones de tráfico con una base de datos de amenazas conocidas. Altamente eficiente pero ineficaz contra ataques de día cero (Zero-Day).
* **Basado en Anomalías / Comportamiento:** Uso de modelos de Machine Learning (ML) y algoritmos heurísticos para crear una línea base de comportamiento normal. Permite identificar desviaciones sospechosas y amenazas desconocidas en tiempo real.

### Caza Proactiva de Amenazas (Threat Hunting)
Proceso iterativo no basado en alertas previas, donde analistas especializados buscan proactivamente vectores de ataque o persistencia de amenazas dentro de la red que hayan evadido los controles de seguridad automatizados, utilizando inteligencia de amenazas (Threat Intelligence) y marcos conceptuales como MITRE ATT&CK.

### Software Malicioso (Virus) y Soluciones Antivirus/EDR

> *[Imagen: Categorización del Malware - Viral/Gusanos, Troyanos, Ransomware, Spyware/Rootkits, Amenazas Sin Archivo]*

* **Virus:** Código malicioso que se adjunta a archivos ejecutables legítimos y requiere la intervención del usuario para propagarse.
* **Gusanos:** Malware ejecutable autónomo que aprovecha vulnerabilidades de red para autorreplicarse e infectar otros sistemas sin interacción humana.
* **Troyanos:** Programas que aparentan ser software legítimo pero contienen cargas útiles (payloads) dañinas diseñadas para crear puertas traseras (backdoors).
* **Ransomware:** Software extorsivo que cifra la información del sistema host y exige un pago por la clave de descifrado, incluyendo en variantes modernas la doble o triple extorsión (filtración de datos).
* **Spyware y Rootkits:** Herramientas diseñadas para ocultar la presencia de procesos maliciosos en el sistema operativo y espiar la actividad del usuario de forma sigilosa.
* **Amenazas Sin Archivo (Fileless Malware):** Malware avanzado que opera directamente en la memoria RAM del sistema utilizando herramientas legítimas del sistema operativo (p. ej., PowerShell, WMI) para evitar la detección basada en disco.

**Vectores de Infección**
1. **Ingeniería Social (Phishing / Spear Phishing):** Uso de correos y mensajes engañosos dirigidos para inducir a la ejecución de adjuntos o revelación de credenciales.
2. **Vulnerabilidades no Corregidas:** Explotación de fallos de software conocidos o desconocidos (Zero-Day) en servicios expuestos a Internet.
3. **Dispositivos Extraíbles:** Infección mediante unidades USB u otros medios físicos no autorizados que ejecutan comandos de manera automática.
4. **Descargas No Autorizadas (Drive-by Downloads):** Compromiso del sistema al navegar en sitios web infectados que aprovechan fallos en el navegador del usuario.

### Evolución del Antivirus al EDR/XDR

**Antivirus Tradicional (Legacy)**
Herramientas reactivas basadas en la inspección de archivos en disco utilizando firmas estáticas. Presentan una incapacidad estructural para detectar variantes no registradas previamente, código polimórfico o ataques que no depositan archivos en el sistema (fileless).

**Endpoint Detection and Response (EDR)**
Solución avanzada instalada en el endpoint que registra continuamente la actividad del sistema, procesos y conexiones.
* **Análisis Comportamental:** Identificación de patrones de ataque mediante algoritmos heurísticos en lugar de firmas estáticas.
* **Respuesta Automatizada:** Capacidad de aislar el endpoint de la red, finalizar procesos maliciosos y revertir cambios en el registro inmediatamente tras la confirmación de la amenaza.
* **XDR (Extended Detection and Response):** Evolución del EDR que integra telemetría no solo del host, sino también de la nube, la red, el correo electrónico y la gestión de identidades para una visibilidad unificada.

### Estrategia de Protección en Capas (Defense in Depth)
La seguridad del sistema informático no debe depender de un único control. Se adopta una arquitectura defensiva multicapa interdependiente:
1. **Filtrado de Correo Electrónico:** Pasarelas seguras (SEG) para análisis de enlaces, sandboxing de adjuntos y protección contra suplantación de identidad (SPF, DKIM, DMARC).
2. **Hardening de Endpoints:** Deshabilitación de servicios no esenciales, restricción de derechos de administración, bloqueo de macros en archivos ofimáticos y uso de AppLocker/WDAC.
3. **Tecnología EDR/XDR:** Despliegue masivo con políticas de prevención en modo de bloqueo automático para análisis conductual continuo.
4. **Concientización Continua:** Programa de capacitación periódica en ciberseguridad, evaluación de cultura de riesgo y simulaciones continuas de phishing para el personal.

---

# PLANEACIÓN, IMPLANTACIÓN Y TENDENCIAS EN SEGURIDAD INFORMÁTICA

**Documento Marco Operativo y Estratégico para la Gestión de Ciberseguridad Institucional**

## Planeación de Seguridad Informática

### Estrategia y Alineación Organizacional
La ciberseguridad debe estructurarse como un habilitador estratégico del negocio y no como un centro de costo aislado. La alineación requiere traducir las métricas de riesgo:

> *[Imagen: Objetivos del Negocio / Visión -> Gobernanza de Ciberseguridad -> Sistema de Gestión (SGSI - ISO 27001) -> Controles Técnicos / Operaciones & Auditoría]*

* **Misión del SGSI:** Proteger la confidencialidad, integridad y disponibilidad (CIA) de los activos de información críticos, garantizando la resiliencia operativa y la continuidad del negocio ante incidentes adversos.
* **Visión del SGSI:** Consolidar una postura defensiva adaptativa e integrada en la cultura organizacional, operando bajo el principio de verificación continua e interoperabilidad segura.
* **Gobernanza:** Establecimiento del Consejo de Seguridad de la Información, encargado de definir las políticas rectoras, supervisar la gestión de riesgos y asignar recursos alineados con las prioridades de la organización.

### Análisis y Gestión de Riesgos
La gestión de riesgos constituye la piedra angular de la planeación defensiva. Permite identificar debilidades antes de su explotación y justificar formalmente la selección de controles.

**Metodologías Comparadas**
* **MAGERIT (v3):** Metodología formal de origen español focalizada en el análisis estructurado del impacto en la Administración Pública y entorno empresarial.
* **ISO/IEC 27005:** Proporciona directrices generales para la gestión de riesgos en seguridad de la información, sirviendo como soporte directo para el cumplimiento de ISO/IEC 27001.
* **NIST SP 800-30:** Marco estadounidense orientado a la evaluación sistemática de riesgos en sistemas de tecnología de la información de alto nivel técnico.

**Modelo de Cálculo del Riesgo**
El cálculo cuantifica la probabilidad de amenaza y su impacto operacional:
* `Riesgo Inherente (RI) = Valor del Activo x Amenaza x Vulnerabilidad`
* `Riesgo Residual (RR) = RI x (1 - Eficacia del Control)`

| Componente | Descripción / Criterio de Evaluación |
| :--- | :--- |
| **Activo** | Datos, software, hardware, personal o procesos operativos críticos. |
| **Amenaza** | Evento potencial (interno o externo) capaz de causar un daño al activo. |
| **Vulnerabilidad** | Flujo, brecha o debilidad que facilita la materialización de la amenaza. |
| **Impacto** | Pérdida financiera, operativa, reputacional o legal estimada (Escala 1 a 5). |
| **Probabilidad** | Frecuencia esperada de ocurrencia en un horizonte temporal (Escala 1 a 5). |

| Función / Actividad | CISOCIO |
| :--- | :--- |
| Definición de Políticas de Seguridad | A / RC |
| Gestión y Mitigación de Vulnerabilidades | AC |
| Monitoreo de Eventos e Incidentes (SIEM) | AI |
| Ejecución de Auditorías Internas | II |
| Aplicación de Parches de Servidores | CA |

### Asignación de Recursos y Presupuesto

**Inversiones Capex/Opex**
* **Capex (Capital Expenditure):** Inversión inicial en infraestructura crítica, tales como HSM (Hardware Security Modules), licencias perpetuas, appliances de firewall o proyectos de arquitectura base.
* **Opex (Operational Expenditure):** Gastos recurrentes como suscripciones SaaS (CASB, EDR/MDR), servicios administrados de SOC, evaluaciones de vulnerabilidad externas y auditorías periódicas.

**Matriz RACI para Gobernanza de TI**
Garantiza la clara distribución de responsabilidades en las operaciones críticas de ciberseguridad:
*Leyenda: R = Responsible (Responsable de la ejecución), A = Accountable (Aprobador/Contable final), C = Consulted (Consultado), I = Informed (Informado).*

* **BCP (Business Continuity Plan):** Estrategia integral para mantener las operaciones críticas.
* **DRP (Disaster Recovery Plan):** Plan técnico orientado a la restauración acelerada de la infraestructura, datos y aplicaciones del centro de cómputo tras un desastre.
* **Métricas Clave:**
  * **RTO (Recovery Time Objective):** Tiempo máximo admisible de interrupción del servicio.
  * **RPO (Recovery Point Objective):** Pérdida máxima de datos tolerada medida en tiempo.

### Etapas para Implantar un Sistema de Gestión (SGSI)
El despliegue ordenado de un SGSI bajo la norma ISO/IEC 27001 asegura la cobertura holística de la seguridad en la organización.

> *[Imagen: Etapas para Implantar un Sistema de Gestión (SGSI) - Fase 1 a Fase 5]*

**Fase 1: Diagnóstico e Iniciación (Gap Analysis)**
* **Evaluación de Madurez (CMMI):** Determinación del estado inicial en una escala de 0 a 5 (Inexistente, Ad-hoc, Repetible, Definido, Gestionado, Optimizado).
* **Definición del Alcance:** Limitación precisa de las unidades de negocio, ubicaciones físicas, activos y tecnologías que conformarán las fronteras del SGSI.

**Fase 2: Diseño y Planificación**
* **Política Global de Seguridad:** Elaboración del documento marco aprobado por la alta dirección.
* **Declaración de Aplicabilidad (SoA - Statement of Applicability):** Justificación detallada de la inclusión o exclusión de los controles normativos detallados en el Anexo A de ISO/IEC 27001:2022.
* **Diseño de Controles:** Especificación formal de salvaguardas técnicas, operativas y administrativas.

**Fase 3: Implementación y Operación**
* **Despliegue Tecnológico:** Integración de herramientas defensivas (EDR, PAM, WAF, SIEM).
* **Hardening de Infraestructura:** Aplicación de guías de bastionado (CIS Benchmarks, DISA STIGs) en sistemas operativos, bases de datos y redes.
* **Programa de Concientización:** Capacitación sistemática del personal contra vectores de ingeniería social mediante pruebas periódicas de phishing simulado.

**Fase 4: Monitoreo, Auditoría y Revisión (Ciclo PDCA / PHVA)**
El ciclo Plan-Do-Check-Act (Planificar-Hacer-Verificar-Actuar) sostiene la operatividad del SGSI:
* **Métricas e Indicadores:**
  * **MTTD (Mean Time to Detect):** Tiempo promedio transcurrido entre la intrusión y la detección efectiva.
  * **MTTR (Mean Time to Respond):** Tiempo promedio requerido para contener y remediar un incidente de seguridad.
* **Auditorías Internas:** Revisiones sistemáticas diseñadas para validar que los controles cumplan los criterios normativos e identifican brechas preexistentes.
* **Tratamiento de No Conformidades:** Ejecución de Análisis de Causa Raíz (RCA) e implementación de acciones correctivas obligatorias.
* **Auditoría Externa de Certificación:** Fase 1 (Revisión Documental) y Fase 2 (Auditoría en Sitio) ejecutada por un Organismo Certificador Acreditado para la emisión del certificado ISO/IEC 27001.

### Vulnerabilidades respecto a la Seguridad de la Información

> *[Imagen: Taxonomía de Vulnerabilidades - Software/Código, Configuración/Bad Practices, Humanas/Social]*

**Software y Código**
* **OWASP Top 10:** Catálogo de los principales riesgos en aplicaciones web, incluyendo Inyecciones (SQLi, Command Injection), Autenticación Rota, Exposición de Datos Sensibles y Deserialización Insegura.
* **Flujos de Memoria:** Vulnerabilidades como Buffer Overflow y Use-After-Free en aplicaciones compiladas.

**Configuración e Infraestructura**
* **Credenciales por Defecto:** Despliegue de servicios con usuarios y contraseñas de fábrica (p. ej., admin/admin).
* **Malas Prácticas en la Nube:** Buckets de almacenamiento expuestos públicamente, puertos de administración (3389/RDP, 22/SSH) abiertos a Internet sin filtrado contextual.

**Factor Humano**
* **Ingeniería Social:** Explotación de rasgos psicológicos humanos (urgencia, autoridad, confianza) a través de ataques de Phishing, Vishing, Smishing y Baiting.

### Ciclo de Vida de la Gestión de Vulnerabilidades

> *[Imagen: Ciclo de Vida de la Gestión de Vulnerabilidades - Detección, Triaje/Priorización, Remediación, Verificación]*

1. **Detección y Escaneo:**
   * **SAST (Static Application Security Testing):** Análisis estático de código fuente sin ejecución.
   * **DAST (Dynamic Application Security Testing):** Análisis dinámico en tiempo de ejecución de la aplicación.
   * **IAST (Interactive Application Security Testing):** Enfoque híbrido mediante agentes integrados en el runtime.
2. **Triaje y Priorización:**
   * **CVSS (Common Vulnerability Scoring System v3.1 / v4.0):** Evaluación del impacto técnico basado en severidad de base, temporal y ambiental.
   * **EPSS (Exploit Prediction Scoring System):** Estimación estadística de la probabilidad de que una vulnerabilidad sea explotada en producción en los siguientes 30 días.
3. **Remediación / Mitigación:** Aplicación de parches del fabricante, refactorización de código o despliegue de reglas en WAF/IPS como control compensatorio.
4. **Verificación:** Re-escaneo y pruebas de penetración focalizadas para confirmar el cierre definitivo de la brecha.

### Vectores de Explotación y Exposición de Datos
* **Exposición de APIs:** Mala implementación de controles BOLA (Broken Object Level Authorization) y BFLA (Broken Function Level Authorization) en interfaces REST/GraphQL.
* **Prevención de Fugas de Datos (DLP):** Inspección de contenido en endpoint, red y almacenamiento en nube para prevenir la exfiltración no autorizada de PII (Personally Identifiable Information) o IP (Propiedad Intelectual).
* **Gestión de Parches de Día Cero (Zero-Day):** Procedimientos acelerados de contención ante vulnerabilidades no respaldadas por un parche oficial pero con código de explotación público (Exploit PoC).

---

## Tendencias en Auditoría y Seguridad Informática

> *[Imagen: Seguridad en la Era de la Inteligencia Artificial - Defensiva vs Ofensiva]*

### Seguridad en la Era de la Inteligencia Artificial
* **Detección Basada en Machine Learning:** Monitoreo del comportamiento de usuarios y entidades (UEBA) para detectar desvíos anómalos respecto al patrón base en tiempo real.
* **IA Generativa Defensiva vs. Ofensiva:**
  * **Defensiva:** Automatización del triaje en SOC mediante LLMs especializados y síntesis automatizada de reglas YARA/Sigma.
  * **Ofensiva / Adversarial AI:** Generación automatizada de phishing hiperpersonalizado, ataques de envenenamiento de datos de entrenamiento (Data Poisoning) e inversión de modelos para extracción de datos.

### Enfoque de Confianza Cero (Zero Trust Architecture - ZTA)
La arquitectura Zero Trust descarta la confianza implícita basada en el perímetro de red, estableciendo que cada petición debe ser expresamente autenticada, autorizada y cifrada antes de conceder acceso.

> *[Imagen: Enfoque de Confianza Cero (Zero Trust Architecture - ZTA) - Solicitante, PDP, PAP, Recursos]*

* **Microsegmentación:** Aislamiento de cargas de trabajo en redes lógicas reducidas para prevenir el movimiento lateral del atacante.
* **Componentes de Borde:**
  * **IDP (Identity Provider):** Control centralizado de identidades con soporte para Autenticación Multi-Factor Adaptativa (MFA).
  * **CASB (Cloud Access Security Broker):** Punto de control de seguridad entre los usuarios e infraestructuras SaaS/PaaS.
  * **SASE (Secure Access Service Edge):** Convergencia de capacidades de red (SD-WAN) y seguridad (SWG, ZTNA, CASB) prestadas desde la nube.

### Auditoría Continua y Automatizada
Evolución desde revisiones puntuales hacia la validación constante de posturas de seguridad:
* **DevSecOps & Continuous Compliance:** Integración de pruebas de seguridad automáticas (SAST, SCA, Linters) en los pipelines de CI/CD, bloqueando despliegues con fallas críticas.
* **CSPM (Cloud Security Posture Management):** Monitoreo automatizado e ininterrumpido de la configuración de entornos multicloud para detectar desvíos frente a marcos de cumplimiento (CIS, PCI-DSS, HIPAA).

### Seguridad en la Cadena de Suministro (Supply Chain Security)
Protección integral contra vectores indirectos de compromiso en componentes de software y hardware de terceros:
* **Software Bill of Materials (SBOM):** Inventario formal y estandarizado (formato SPDX o CycloneDX) de todos los componentes de código abierto, dependencias y librerías utilizados en la construcción de software.
* **Auditorías de Proveedores:** Evaluaciones técnicas continuas del perfil de riesgo de seguridad de proveedores externos con acceso a la red corporativa.

### Normas ISO en Ciberseguridad
**Familia ISO/IEC 27000**
> *[Imagen: Familia ISO/IEC 27000 - 27001, 27002, 27005, 27017/27018, 27701]*

> *[Imagen: ISO/IEC 27001:2022 - Controles Anexo A (88 total) - Organizacionales (37), Personas (8), Físicos (14), Tecnológicos (34)]*

* **ISO/IEC 27002:2022:** Código de prácticas estructurado que provee guías detalladas de implementación para cada uno de los controles enumerados en ISO/IEC 27001, introduciendo atributos de clasificación (Tipo de control, propiedades CIA, conceptos de ciberseguridad, capacidades operativas).
* **ISO/IEC 27005:2022:** Guía de soporte focalizada en la gestión del riesgo de seguridad de la información. Modela el proceso de identificación de activos, estimación del riesgo, evaluación de impacto y selección sistemática del plan de tratamiento de riesgo.

| Norma / Marco | Enfoque Principal | Tipo de Control |
| :--- | :--- | :--- |
| **ISO/IEC 27001** | Requisitos formales del SGSI | Organizacional / Técnico |
| **ISO/IEC 27002** | Guía y código de prácticas de controles | Directivo / Preventivo / Correctivo |
| **ISO/IEC 27005** | Evaluación y tratamiento de riesgos | Metodológico / Analítico |
| **NIST SP 800-53** | Catalogación de controles de seguridad | Técnico / Operativo / Directivo |

* **ISO/IEC 27017:** Estándar complementario de controles de seguridad diseñado específicamente para la provisión y uso de servicios en la nube.
* **ISO/IEC 27018:** Código de prácticas enfocado en la protección de Datos Personales Identificables (PII) en entornos de computación en la nube pública operando como procesadores de datos.
* **ISO/IEC 27701:2019:** Extensión directa de ISO/IEC 27001 e ISO/IEC 27002 para la gestión de la privacidad de la información (PIMS / SGIP). Define requisitos adicionales para garantizar el cumplimiento de regulaciones globales sobre protección de datos personales (como el GDPR).

> *[Imagen: Matriz Síntesis de Marcos Normativos y Estándares - ISO 9001, 14001, 45001, 27001, 26000, 31000, 37001, etc.]*

---

## Ejemplo de plan de riesgos para un sistema de ventas web

Un plan de seguridad integral para un sistema de ventas web debe abordar la protección de datos transaccionales, datos de tarjetas de crédito/pago (cumplimiento PCI-DSS), autenticación de usuarios y la resiliencia de la infraestructura.

### 1. Governance, Riesgo y Cumplimiento (GRC)

**Marcos de Referencia y Normativas**
* **PCI-DSS v4.0:** Obligatorio para el procesamiento y almacenamiento seguro de datos de pago.
* **OWASP Top 10 / OWASP ASVS:** Estándar de verificación de seguridad en aplicaciones web.
* **ISO/IEC 27001 / NIST CSF:** Arquitectura general del sistema de gestión de seguridad de la información.

**Clasificación de Datos**
* **Críticos:** Tokens de pago, datos de tarjetas (PAN, CVV — nunca almacenar CVV), contraseñas (hashes).
* **Confidenciales:** Datos PII de clientes (Nombres, emails, direcciones, teléfonos, historial de compras).
* **Internos:** Inventario, métricas de ventas no públicas.
* **Públicos:** Catálogo de productos, precios públicos.

### 2. Arquitectura de Red y Hardening de Infraestructura

> *[Imagen: Arquitectura de Red y Hardening de Infraestructura - Cliente/Browser, Cloudflare/WAF, NGINX, Backend Express.js, Redis, MySQL]*

**Controles de Infraestructura**
* **WAF (Web Application Firewall):** Filtrado de reglas OWASP Top 10, mitigación DDoS volumétrica y limitación de tasa (Rate Limiting).
* **Aislamiento de Red:** Aplicación hospedada en subredes privadas. La base de datos no debe tener IP pública asignada.
* **Seguridad en Contenedores (Docker):**
  * Ejecución de procesos con usuario sin privilegios (`USER node`).
  * Imágenes base mínimas (distroless o Alpine).
  * Análisis de vulnerabilidades en imágenes antes del despliegue (Trivy / Grype).

### 3. Seguridad en la Capa de Aplicación (Software Security)

**Autenticación y Control de Acceso**
* **Autenticación Fuerte:**
  * Uso de Argon2id o bcrypt (factor de costo ≥ 12) para el hashing de contraseñas.
  * MFA (Autenticación de Múltiples Factores) obligatorio para administradores y opcional/recomendado para clientes.
  * Manejo seguro de sesiones mediante cookies `HttpOnly`, `Secure`, `SameSite=Strict`.
* **Autorización:** Implementación de RBAC (Control de acceso basado en roles: Cliente, Vendedor, Contador, Administrador).

**Protección contra Vulnerabilidades OWASP**
* **Inyección SQL:** Uso exclusivo de consultas preparadas (Prepared Statements) o un ORM con parámetros parametrizados.
* **XSS (Cross-Site Scripting):**
  * Sanitización estricta de entradas de usuario.
  * Configuración de cabeceras de seguridad HTTP:
    ```http
    Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com;
    X-Frame-Options: DENY
    X-Content-Type-Options: nosniff
    Strict-Transport-Security: max-age=31536000; includeSubDomains
    ```
* **CSRF (Cross-Site Request Forgery):** Uso de tokens Anti-CSRF o cookies con flag `SameSite=Strict`.

### 4. Seguridad de Datos y Criptografía
**Datos en Tránsito**
* Cifrado obligatorio con TLS 1.3 (o TLS 1.2 estricto con suites de cifrado seguras).
* Redirección automática de HTTP a HTTPS.
* HSTS (HTTP Strict Transport Security) activado.

**Datos en Reposo**
* **Base de Datos:** Cifrado a nivel de disco/columna (AES-256) para campos sensibles (PII).
* **Gestión de Llaves:** Utilizar un gestor de secretos (HashiCorp Vault, AWS Secrets Manager o variables de entorno protegidas en Docker). Nunca incluir llaves o credenciales en el repositorio de código.

### 5. Integración de Pagos y Cumplimiento PCI-DSS
* **Delegación de Pagos:** Utilizar pasarelas de pago externas vía SDK/Iframe (Stripe, PayPal, MercadoPago) para que los datos de tarjetas no toquen los servidores propios (reducir el alcance de PCI-DSS a SAQ A/SAQ A-EP).
* **Validación de Webhooks:** Verificar las firmas criptográficas de las notificaciones que envía la pasarela de pago para evitar la falsificación de transacciones exitosas.

### 6. Monitoreo, Logging y Respuesta a Incidentes
**Registros de Auditoría (Audit Logs)**
* Registrar eventos críticos: inicios de sesión fallidos, cambio de roles, modificaciones en el inventario o precios, transacciones y cambios de contraseñas.
* **Formato Estructurado:** Logs en JSON enviando a un sistema centralizado (ELK Stack, Grafana Loki o SIEM).
* **Protección de Logs:** Asegurar que los logs no contengan datos sensibles (contraseñas, tokens, PAN de tarjetas).

**Detección y Alertas**
* Alertas automáticas ante múltiples intentos fallidos de login (posible ataque de fuerza bruta).

### 7. Matriz de Implementación y Plan de Acción

| Fase | Tareas Principales | Herramientas / Controles |
| :--- | :--- | :--- |
| **Fase 1: Infraestructura y Red** | Configuración de WAF, TLS, aislamiento de subredes y hardening de servidores/Docker. | Cloudflare, NGINX, Docker Security Bench |
| **Fase 2: Código Seguro** | Parametrización de consultas, autenticación con hash seguro, cabeceras HTTP, sanitización de inputs. | Helmet.js, ORM/Prepared Statements |
| **Fase 3: Pasarela de Pagos** | Integración segura con pasarela externa, verificación de firmas en webhooks. | Stripe SDK / PayPal API |
| **Fase 4: Monitoreo y Pruebas** | Configuración de logs centralizados, análisis SAST/DAST y pruebas de penetración (Pentesting). | SonarQube, OWASP ZAP, ELK/Loki |

---

## Matriz de riesgos de ciberseguridad y un plan de respuesta a incidentes

### Matriz de Riesgos de Ciberseguridad
Para calcular el Nivel de Riesgo, se utiliza la fórmula: `Riesgo = Probabilidad (1-5) × Impacto (1-5)`.
* **Muy Alto:** 20 - 25
* **Alto:** 12 - 19
* **Medio:** 6 - 11
* **Bajo:** 1 - 5

| ID | Amenaza / Escenario | Prob. | Imp. | Nivel | Estrategia de Mitigación |
| :--- | :--- | :--- | :--- | :--- | :--- |
| R-01 | **Falsificación de Webhook de Pagos:** Inyección de falsas confirmaciones de pago exitoso. | 3 | 5 | 15 (Alto) | Validación obligatoria de la firma criptográfica HMAC en cada webhook enviado por la pasarela de pago. |
| R-02 | **Ataque Credential Stuffing / Fuerza Bruta:** Compromiso de cuentas de clientes mediante bots. | 4 | 4 | 16 (Alto) | Implementación de Rate Limiting por IP/cuenta, Captcha invisible (reCAPTCHA v3) y hashing con Argon2id. |
| R-03 | **Inyección SQL / Compromiso de BD:** Extracción no autorizada de la base de datos de usuarios o pedidos. | 2 | 5 | 10 (Medio) | Consultas parametrizadas (Prepared Statements), ORM, principio de mínimo privilegio en BD y cifrado de datos sensibles. |
| R-04 | **Inyección XSS (Stored / Reflected):** Robo de tokens de sesión o redirección de pasarelas de pago. | 3 | 4 | 12 (Alto) | Sanitización de entradas, escape de salidas, cookies con flags HttpOnly; Secure; SameSite=Strict y cabecera CSP estricta. |
| R-05 | **Denegación de Servicio (DDoS):** Caída del e-commerce durante temporadas de alto tráfico. | 4 | 4 | 16 (Alto) | Uso de WAF/CDN con mitigación Anti-DDoS activa (ej. Cloudflare/AWS Shield) y autoscaling en infraestructura. |
| R-06 | **Fuga / Alteración de API Keys o Credenciales:** Exposición de claves privadas en repositorios de código. | 2 | 5 | 10 (Medio) | Uso de gestores de secretos (Secrets Manager / Vault), escaneo automatizado de código (TruffleHog/GitGuardian) y variables de entorno. |
| R-07 | **Ataque a la Cadena de Suministro (Dependencias):** Vulnerabilidades críticas en paquetes de terceros (npm). | 4 | 3 | 12 (Alto) | Ejecución periódica de npm audit, integración de herramientas SCA (Snyk/Dependabot) en el pipeline CI/CD. |

---

### Plan de Respuesta a Incidentes (IRP)
Este plan define el protocolo estructurado para detectar, contener, erradicar y recuperarse de un incidente de seguridad en la plataforma de e-commerce.

**1. Preparación:** Medidas preventivas antes de que ocurra un incidente.
* **Equipo de Respuesta (CSIRT):** Definición de roles (Líder de Seguridad, Administrador SysAdmin/DevOps, Desarrollador Lead, Asesor Legal/Compliance).
* **Infraestructura de Logging:** Centralización de logs de NGINX, Express, MySQL y WAF en formato JSON (SIEM/Grafana Loki).
* **Copias de Seguridad:** Backups automatizados diarios cifrados de la base de datos con pruebas trimestrales de restauración.

**2. Identificación y Detección:** Reconocimiento oportuno de anomalías.
* **Alertas Automatizadas:** Disparo de alarmas por picos anómalos de errores 5xx, transacciones fallidas masivas o accesos inusuales a la base de datos.
* **Análisis Inicial:** Validación del incidente (diferenciar entre un pico legítimo de tráfico por ventas/promociones y un ataque real).
* **Clasificación del Incidente:** Asignación de severidad (Crítica: Afecta procesamiento de pagos o fuga de PII; Alta: Interrupción parcial del servicio).

**3. Contención:** Limitar el alcance y daño del ataque.
* **Contención Aislada (Inmediata):** Bloqueo de direcciones IP o rangos maliciosos directamente en el WAF/Firewall.
* **Contención Sistémica:** Si hay un compromiso crítico de la aplicación, activar el modo de mantenimiento temporal o aislar los contenedores Docker afectados de la red interna.
* **Invalidación de Sesiones:** Revocación inmediata de tokens JWT, cookies de sesión y rotación de claves comprometidas (API keys, llaves de BD).

**4. Erradicación:** Eliminar la causa raíz de la amenaza.
* **Análisis Forense:** Inspección de logs centralizados para identificar el punto de entrada (IP, endpoint invocado, payload).
* **Parcheo de Código / Vulnerabilidad:** Corrección urgente del fallo en la aplicación o actualización de la dependencia comprometida.
* **Reconstrucción Limpia:** Despliegue de nuevas instancias/imágenes de Docker desde el repositorio oficial verificado sin residuos del atacante.

**5. Recuperación:** Restablecimiento seguro de las operaciones.
* **Restauración Gradual:** Levantamiento progresivo de los servicios monitoreando la carga y los logs en tiempo real.
* **Validación de Integridad:** Comprobación de integridad de datos en las bases de datos y confirmación del correcto flujo de pagos en entorno de producción.
* **Notificación a Usuarios:** Si se confirmó exfiltración de PII, ejecución del protocolo de notificación transparente a usuarios afectados y entidades reguladoras según leyes locales.

**6. Lecciones Aprendidas (Post-Mortem):** Mejora continua del sistema.
* **Reunión Post-Incidente:** Análisis del tiempo de respuesta (MTTD/MTTR) dentro de las 72 horas posteriores al evento.
* **Actualización del Plan:** Modificación de reglas del WAF, controles en CI/CD o políticas de código para prevenir la reincidencia.
* **Documentación del Reporte:** Elaboración del informe oficial del incidente detallando cronología, impacto, causa raíz y acciones correctivas aplicadas.