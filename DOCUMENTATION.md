# Documentación Técnica: Migración a PostgreSQL (Neon) y Módulo de Backups

## 1. Justificación de Dependencias Elegidas

Para la integración de Django con PostgreSQL en Neon (Serverless), se seleccionaron las siguientes librerías:

1. **`psycopg[binary]>=3.1.18`**:
   - **Razón**: Es el driver oficial de nueva generación (Psycopg 3) recomendado para Django 4.2+ y Django 5.x.
   - **Beneficios**: A diferencia de `psycopg2-binary` (que está en modo mantenimiento), Psycopg 3 ofrece soporte nativo para conexiones asíncronas, cursores del lado del servidor configurables, mejor manejo de transacciones, tipos nativos de PostgreSQL y distribución binaria optimizada con `libpq` embebida sin necesidad de compilar paquetes en el sistema host.
2. **`dj-database-url>=2.1.0`**:
   - **Razón**: Estándar de la industria (estilo 12-Factor App) para parsear URLs de conexión tipo `postgresql://user:pass@host:port/dbname` directamente al diccionario `DATABASES['default']` de Django.
   - **Beneficios**: Permite desacoplar credenciales del código fuente y facilita transiciones fluidas entre entornos locales, staging y producción.
3. **`python-dotenv>=1.0.0`**:
   - **Razón**: Carga automática de variables de entorno desde archivos `.env` locales sin contaminar el entorno global del sistema.

---

## 2. Configuración de Conexión Aplicada para Neon (Serverless)

Neon es un servicio gestionado de PostgreSQL serverless con separación de cómputo y almacenamiento y capacidad de auto-suspensión (scale-to-zero). Para optimizar el rendimiento y la resiliencia, se implementaron las siguientes directrices técnicas en `django_crud/settings.py`:

- **Doble Endpoint (Pooler vs Directo)**:
  - **`DATABASE_URL` (Pooler con PgBouncer)**: Se utiliza para las operaciones HTTP estándar de la aplicación web. PgBouncer gestiona eficientemente cientos de conexiones cliente sin saturar el compute de Neon.
  - **`DIRECT_DATABASE_URL` (Conexión directa sin `-pooler`)**: Las operaciones DDL (`migrate`, `makemigrations`, `inspectdb`) y las utilidades lógicas de backup (`pg_dump`, `pg_restore`) requieren conexión directa sin intermediación de PgBouncer en transaction pooling, evitando incompatibilidades con sentencias preparadas y bloqueos a nivel de sesión. La configuración detecta automáticamente si se están ejecutando comandos DDL para conmutar al endpoint directo.
- **`CONN_MAX_AGE = 0`**:
  - Al utilizar el connection pooler de Neon, Django no debe mantener conexiones persistentes inactivas abiertas que puedan ser cerradas abruptamente cuando Neon suspende el cómputo.
- **`CONN_HEALTH_CHECKS = True`**:
  - Django valida la salud de la conexión antes de ejecutar consultas, garantizando reconexión transparente tras reactivaciones de Neon después de un periodo de inactividad.
- **`sslmode = require` & `connect_timeout = 10`**:
  - Conexión cifrada obligatoria por SSL/TLS según las directivas de seguridad de Neon, con timeout de conexión prudente para evitar bloqueos indefinidos.

---

## 3. Estrategia del Módulo de Backups y Restauración

El módulo de backups anterior (basado en copiado de archivos SQLite) fue retirado y reemplazado por un servicio desacoplado y resiliente en `fs/backup_service.py`, acompañado de management commands y endpoints REST.

### 3.1. Tipos de Respaldo Soportados

1. **Backup Completo (`full`)**:
   - Genera un volcado lógico binario mediante `pg_dump -Fc` (formato Custom de PostgreSQL).
   - Genera archivos nombrados: `full_YYYYMMDD_HHMMSS.dump`.
   - Incluye esquema, constraints, secuencias y todos los datos en un formato comprimido, autocontenido y restaurable con `pg_restore`.
2. **Backup Incremental (`incremental`) - Opción A**:
   - Exporta únicamente los registros creados o modificados desde el **último backup registrado** (sea full, incremental o diferencial).
   - Genera archivos SQL comprimidos: `incremental_YYYYMMDD_HHMMSS.sql.gz`.
   - Utiliza columnas de auditoría y temporalidad (`updated_at`, `timestamp`, `date`, `date_joined`, etc.) en las tablas del sistema.
3. **Backup Diferencial (`differential`) - Opción A**:
   - Exporta únicamente los registros creados o modificados desde el **último backup completo (full)**.
   - Genera archivos SQL comprimidos: `differential_YYYYMMDD_HHMMSS.sql.gz`.

### 3.2. Metadatos y Manifiestos
Cada archivo de respaldo genera un archivo homónimo `.meta` en formato JSON con la siguiente estructura:
```json
{
  "filename": "full_20261025_225604.dump",
  "backup_type": "full",
  "created_at": "2026-10-25T22:56:17.656682",
  "size": 123302,
  "parent_backup": null,
  "strategy": "pg_dump_custom",
  "database_target": "neon_postgresql"
}
```

### 3.3. Política de Retención
El servicio evalúa automáticamente las cuotas configuradas (`BACKUP_RETENTION` en `settings.py`):
- `full`: 4 copias
- `incremental`: 7 copias
- `differential`: 4 copias
Las copias más antiguas por tipo son depuradas físicamente del disco junto con sus archivos `.meta`.

### 3.4. Protocolo de Restauración y Seguridad
- **Snapshot Preventivo Automático (`pre_restore`)**: Antes de ejecutar cualquier restauración que modifique o sobrescriba datos, el sistema genera de manera obligatoria e inmediata un respaldo preventivo completo: `pre_restore_YYYYMMDD_HHMMSS.dump`.
- **Restauración Full**: Ejecuta `pg_restore --clean --if-exists --no-owner --no-privileges -d <DIRECT_DATABASE_URL> <archivo.dump>`.
- **Restauración Incremental / Diferencial**: Restaura el backup base Full y随后 aplica los deltas secuencialmente mediante transacciones SQL con cláusulas idempotentes `ON CONFLICT (...) DO UPDATE`.

### 3.5. Comandos de Gestión (CLI)
```bash
# Crear backup completo:
python manage.py backup_db --type=full

# Crear backup incremental:
python manage.py backup_db --type=incremental

# Crear backup diferencial:
python manage.py backup_db --type=differential

# Forzar depuración por política de retención:
python manage.py backup_db --type=full --clean-retention

# Restaurar un backup:
python manage.py restore_backup --filename=full_20261025_225604.dump
```

### 3.6. Integración con Neon API (Opción B - Branches y PITR)
Como mecanismo complementario disponible en la arquitectura serverless de Neon:
- **Instant Branching**: Permite crear una rama aislada de respaldo en milisegundos (`neon branch create --name backup-point`) sin transferencia de datos sobre la red.
- **PITR (Point-in-Time Restore)**: Permite restaurar el estado de los datos a cualquier segundo dentro de la ventana de retención de Neon a través de la API/CLI de Neon.

---

## 4. Gestión del Usuario Administrador (`admin` / `admin`)

Para garantizar acceso y control total del sistema administrativo:

1. **Credenciales**:
   - **Usuario**: `admin`
   - **Contraseña**: `admin`
   - **Email**: `admin@fusionsolar.com` (o `admin@example.com`)
2. **Privilegios**:
   - `is_staff = True`
   - `is_superuser = True`
   - `is_active = True`
   - 120 permisos globales sobre todos los modelos, grupos y operaciones del sistema.
   - Token de API generado para acceso directo vía REST.
3. **Mantenimiento Idempotente**:
   - Se puede invocar en cualquier momento el comando:
     ```bash
     python manage.py create_admin [--force-password]
     ```
   - Si el usuario existe, asegura que sus banderas de superusuario y staff estén activadas. Si se especifica `--force-password`, restablece la contraseña a la clave predeterminada.
4. **Panel de Administración Django (`/admin/`)**:
   - `fs/admin.py` fue actualizado para extender de `django.contrib.auth.admin.UserAdmin`, lo que habilita la interfaz completa para gestionar contraseñas encriptadas, grupos, permisos y usuarios desde el panel web.

---

## 5. Endpoints de la API y Frontend React

Los endpoints en `/fs/backups/` fueron adaptados para operar con PostgreSQL manteniendo retrocompatibilidad con la interfaz de React:
- `GET /fs/backups/list/`: Retorna la lista de respaldos con metadatos y tipos.
- `POST /fs/backups/create/`: Acepta opcionalmente `{ "type": "full" | "incremental" | "differential" }`.
- `GET /fs/backups/download/?filename=<nombre>`: Descarga el volcado binario o SQL comprimido.
- `POST /fs/backups/restore/`: Ejecuta restauración segura y retorna el nombre del archivo `pre_restore`.
- `DELETE /fs/backups/delete/?filename=<nombre>`: Elimina el archivo y su metadata.

En el frontend React (`fs-front/src/features/config/pages/BackupsPage.jsx`), se integró un selector para escoger el tipo de backup a generar y etiquetas visuales (badges) para diferenciar backups Completos, Incrementales, Diferenciales y Pre-restauración en el historial.
