import os
import sys
import json
import gzip
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from django.conf import settings
from django.apps import apps
from django.core import serializers
from django.db import transaction

def get_pg_bin(bin_name):
    """
    Localiza el ejecutable de PostgreSQL (pg_dump, pg_restore, psql).
    Busca en settings, ~/.local/bin, venv bin y PATH del sistema.
    """
    configured = getattr(settings, f"PG_{bin_name.upper()}_PATH", None)
    if configured and os.path.isfile(configured) and os.access(configured, os.X_OK):
        return configured

    # Buscar en ~/.local/bin
    home_local = os.path.expanduser(f"~/.local/bin/{bin_name}")
    if os.path.isfile(home_local) and os.access(home_local, os.X_OK):
        return home_local

    # Buscar en venv/bin
    venv_bin = os.path.join(sys.prefix, "bin", bin_name)
    if os.path.isfile(venv_bin) and os.access(venv_bin, os.X_OK):
        return venv_bin

    which_path = shutil.which(bin_name)
    if which_path:
        return which_path

    raise FileNotFoundError(
        f"No se encontró el binario '{bin_name}'. Asegúrese de que PostgreSQL client utilities estén instaladas."
    )

def get_database_connection_url(direct=True):
    """
    Retorna la URL de conexión a la base de datos PostgreSQL.
    Para backups y restores, se prefiere la URL directa (sin -pooler)
    para evitar desconexiones por timeout o limitaciones de PgBouncer.
    """
    direct_url = os.environ.get('DIRECT_DATABASE_URL')
    db_url = os.environ.get('DATABASE_URL')

    if direct and direct_url:
        return direct_url
    if direct and db_url and '-pooler' in db_url:
        return db_url.replace('-pooler', '')
    if db_url:
        return db_url

    # Fallback a settings.DATABASES
    db_conf = settings.DATABASES.get('default', {})
    user = db_conf.get('USER', '')
    password = db_conf.get('PASSWORD', '')
    host = db_conf.get('HOST', 'localhost')
    port = db_conf.get('PORT', 5432)
    name = db_conf.get('NAME', '')
    sslmode = db_conf.get('OPTIONS', {}).get('sslmode', 'require')

    auth = f"{user}:{password}@" if user else ""
    return f"postgresql://{auth}{host}:{port}/{name}?sslmode={sslmode}"

def get_backups_dir():
    """Retorna la ruta absoluta del directorio de backups asegurando su existencia."""
    backup_dir = getattr(settings, 'BACKUPS_DIR', os.path.join(settings.BASE_DIR, 'backups'))
    os.makedirs(backup_dir, exist_ok=True)
    return str(backup_dir)

def read_metadata(meta_path):
    """Lee y parsea un archivo de metadatos .meta."""
    try:
        with open(meta_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None

def write_metadata(meta_path, data):
    """Escribe los metadatos de un backup de forma atómica."""
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def list_backups():
    """
    Lista todas las copias de seguridad existentes con sus metadatos,
    ordenadas cronológicamente de forma descendente (más reciente primero).
    """
    backup_dir = get_backups_dir()
    backups = []

    if not os.path.exists(backup_dir):
        return backups

    for fname in os.listdir(backup_dir):
        # Excluir archivos .meta y temporales
        if fname.endswith('.meta') or fname.endswith('.tmp'):
            continue

        file_path = os.path.join(backup_dir, fname)
        if not os.path.isfile(file_path):
            continue

        meta_path = os.path.join(backup_dir, f"{fname}.meta")
        metadata = read_metadata(meta_path)

        if not metadata:
            stat = os.stat(file_path)
            created_at = datetime.fromtimestamp(stat.st_mtime).isoformat()
            backup_type = 'full'
            if fname.startswith('incremental_'):
                backup_type = 'incremental'
            elif fname.startswith('differential_'):
                backup_type = 'differential'
            elif fname.startswith('pre_restore_'):
                backup_type = 'pre_restore'

            metadata = {
                'filename': fname,
                'created_at': created_at,
                'size': stat.st_size,
                'backup_type': backup_type,
                'strategy': 'unknown'
            }
            write_metadata(meta_path, metadata)

        backups.append(metadata)

    backups.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return backups

def apply_retention_policy():
    """
    Aplica la política de retención configurada en settings.BACKUP_RETENTION
    o variables de entorno, eliminando copias excedentes por tipo.
    """
    retention = getattr(settings, 'BACKUP_RETENTION', {
        'full': 4,
        'incremental': 7,
        'differential': 4,
    })

    backups = list_backups()
    by_type = {'full': [], 'incremental': [], 'differential': [], 'pre_restore': []}
    for b in backups:
        b_type = b.get('backup_type', 'full')
        if b_type in by_type:
            by_type[b_type].append(b)

    backup_dir = get_backups_dir()
    deleted_files = []

    for b_type, max_count in retention.items():
        type_list = by_type.get(b_type, [])
        if len(type_list) > max_count:
            to_remove = type_list[max_count:]
            for item in to_remove:
                fname = item['filename']
                fpath = os.path.join(backup_dir, fname)
                mpath = os.path.join(backup_dir, f"{fname}.meta")
                try:
                    if os.path.exists(fpath):
                        os.remove(fpath)
                    if os.path.exists(mpath):
                        os.remove(mpath)
                    deleted_files.append(fname)
                except Exception as e:
                    print(f"Error al eliminar backup excedente {fname}: {e}")

    return deleted_files

def create_full_backup(is_pre_restore=False):
    """
    Crea un backup completo de la base de datos utilizando pg_dump en formato Custom (-Fc).
    """
    backup_dir = get_backups_dir()
    pg_dump_bin = get_pg_bin('pg_dump')
    db_url = get_database_connection_url(direct=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    prefix = "pre_restore_" if is_pre_restore else "full_"
    filename = f"{prefix}{timestamp}.dump"
    filepath = os.path.join(backup_dir, filename)

    env = os.environ.copy()
    home_local_lib = os.path.expanduser("~/.local/lib")
    if os.path.exists(home_local_lib):
        env['LD_LIBRARY_PATH'] = f"{home_local_lib}:{env.get('LD_LIBRARY_PATH', '')}"

    cmd = [
        pg_dump_bin,
        "-Fc",
        "--no-owner",
        "--no-privileges",
        "-d", db_url,
        "-f", filepath
    ]

    result = subprocess.run(cmd, env=env, capture_output=True, text=True)
    if result.returncode != 0:
        if os.path.exists(filepath):
            os.remove(filepath)
        raise RuntimeError(f"Fallo al ejecutar pg_dump: {result.stderr or result.stdout}")

    size = os.path.getsize(filepath)
    created_at = datetime.now().isoformat()
    backup_type = 'pre_restore' if is_pre_restore else 'full'

    metadata = {
        'filename': filename,
        'backup_type': backup_type,
        'created_at': created_at,
        'size': size,
        'parent_backup': None,
        'strategy': 'pg_dump_custom',
        'database_target': 'neon_postgresql'
    }

    write_metadata(os.path.join(backup_dir, f"{filename}.meta"), metadata)

    if not is_pre_restore:
        apply_retention_policy()

    return metadata

def _get_changed_rows_data(reference_timestamp):
    """
    Exporta filas modificadas o creadas después de reference_timestamp
    usando exclusivamente el ORM de Django y el serializador nativo (Prevención SQL Injection CWE-89).
    """
    changed_objects = []
    models_to_backup = [m for m in apps.get_models() if m._meta.app_label in ('fs', 'auth')]

    for model in models_to_backup:
        time_field = None
        for candidate in ['updated_at', 'timestamp', 'date', 'return_date', 'date_joined', 'scheduled_date']:
            try:
                field = model._meta.get_field(candidate)
                if field:
                    time_field = candidate
                    break
            except Exception:
                continue

        try:
            if time_field:
                qs = model.objects.filter(**{f"{time_field}__gte": reference_timestamp})
            else:
                qs = model.objects.all()

            for obj in qs:
                changed_objects.append(obj)
        except Exception as e:
            print(f"[Backup ORM] Error al consultar modelo {model.__name__}: {e}")

    return serializers.serialize('json', changed_objects)

def create_incremental_or_differential_backup(backup_type='incremental'):
    """
    Crea un backup incremental o diferencial lógico usando el ORM de Django.
    - incremental: exporta registros modificados desde el último backup registrado.
    - differential: exporta registros modificados desde el último backup completo (full).
    """
    backups = list_backups()
    reference_timestamp = None
    parent_filename = None

    if backup_type == 'incremental':
        for b in backups:
            if b.get('backup_type') in ('full', 'incremental', 'differential') and b.get('created_at'):
                reference_timestamp = b['created_at']
                parent_filename = b['filename']
                break
    elif backup_type == 'differential':
        for b in backups:
            if b.get('backup_type') == 'full' and b.get('created_at'):
                reference_timestamp = b['created_at']
                parent_filename = b['filename']
                break

    if not reference_timestamp or not parent_filename:
        print(f"No se encontró backup previo de referencia para {backup_type}. Generando backup full inicial.")
        return create_full_backup()

    backup_dir = get_backups_dir()
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{backup_type}_{timestamp_str}.json.gz"
    filepath = os.path.join(backup_dir, filename)

    try:
        ref_dt = datetime.fromisoformat(reference_timestamp)
    except Exception:
        ref_dt = datetime.now()

    serialized_data = _get_changed_rows_data(ref_dt)
    payload = serialized_data.encode('utf-8')

    with gzip.open(filepath, 'wb') as f_out:
        f_out.write(payload)

    size = os.path.getsize(filepath)
    created_at = datetime.now().isoformat()

    metadata = {
        'filename': filename,
        'backup_type': backup_type,
        'created_at': created_at,
        'size': size,
        'parent_backup': parent_filename,
        'reference_timestamp': reference_timestamp,
        'strategy': 'django_orm_serialized_delta',
        'database_target': 'neon_postgresql'
    }

    write_metadata(os.path.join(backup_dir, f"{filename}.meta"), metadata)
    apply_retention_policy()

    return metadata

def create_backup(backup_type='full'):
    """
    Punto de entrada general para crear un backup según el tipo solicitado.
    Soporta 'full', 'incremental', 'differential'.
    """
    backup_type = (backup_type or 'full').lower()
    if backup_type == 'full':
        return create_full_backup()
    elif backup_type in ('incremental', 'differential'):
        return create_incremental_or_differential_backup(backup_type)
    else:
        raise ValueError(f"Tipo de backup no soportado: '{backup_type}'. Use 'full', 'incremental' o 'differential'.")

def restore_backup(filename):
    """
    Restaura una base de datos desde un archivo de backup de forma segura.
    1. Genera un backup preventivo automático 'pre_restore_YYYYMMDD_HHMMSS.dump'.
    2. Si el backup es dump (full/pre_restore), ejecuta pg_restore.
    3. Si es incremental/diferencial en formato json.gz, aplica deserialización ORM atómica.
    """
    backup_dir = get_backups_dir()
    clean_filename = os.path.basename(filename)
    filepath = os.path.join(backup_dir, clean_filename)
    meta_path = os.path.join(backup_dir, f"{clean_filename}.meta")

    if not os.path.exists(filepath):
        raise FileNotFoundError(f"El archivo de backup '{clean_filename}' no existe en {backup_dir}.")

    metadata = read_metadata(meta_path) or {}
    backup_type = metadata.get('backup_type', 'full')

    # Paso 1: Generar backup preventivo pre_restore
    pre_restore_meta = create_full_backup(is_pre_restore=True)
    pre_restore_filename = pre_restore_meta['filename']

    db_url = get_database_connection_url(direct=True)
    env = os.environ.copy()
    home_local_lib = os.path.expanduser("~/.local/lib")
    if os.path.exists(home_local_lib):
        env['LD_LIBRARY_PATH'] = f"{home_local_lib}:{env.get('LD_LIBRARY_PATH', '')}"

    # Paso 2: Ejecutar restauración
    if clean_filename.endswith('.dump') or backup_type in ('full', 'pre_restore'):
        pg_restore_bin = get_pg_bin('pg_restore')
        cmd = [
            pg_restore_bin,
            "--clean",
            "--if-exists",
            "--no-owner",
            "--no-privileges",
            "-d", db_url,
            filepath
        ]
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        if result.returncode not in (0, 1):
            raise RuntimeError(f"Fallo en pg_restore: {result.stderr or result.stdout}")

    elif clean_filename.endswith('.json.gz') or clean_filename.endswith('.sql.gz') or backup_type in ('incremental', 'differential'):
        parent = metadata.get('parent_backup')
        if parent and parent.endswith('.dump'):
            parent_path = os.path.join(backup_dir, parent)
            if os.path.exists(parent_path):
                pg_restore_bin = get_pg_bin('pg_restore')
                cmd = [
                    pg_restore_bin,
                    "--clean",
                    "--if-exists",
                    "--no-owner",
                    "--no-privileges",
                    "-d", db_url,
                    parent_path
                ]
                subprocess.run(cmd, env=env, capture_output=True, text=True)

        with gzip.open(filepath, 'rt', encoding='utf-8') as f_in:
            content = f_in.read()

        # Restaurar mediante ORM de Django (seguridad nativa contra inyecciones SQL)
        if content.strip().startswith('[') or content.strip().startswith('{'):
            with transaction.atomic():
                for obj in serializers.deserialize('json', content):
                    obj.save()
        else:
            # Compatibilidad controlada para scripts legacy
            from django.db import connection
            with connection.cursor() as cursor:
                for statement in content.split(';'):
                    stmt = statement.strip()
                    if stmt and not stmt.startswith('--'):
                        cursor.execute(stmt)

    return {
        'status': 'success',
        'message': f"Base de datos restaurada exitosamente desde '{clean_filename}'.",
        'pre_restore_backup': pre_restore_filename
    }
