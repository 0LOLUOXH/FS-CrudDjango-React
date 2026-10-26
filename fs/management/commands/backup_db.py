from django.core.management.base import BaseCommand
from fs.backup_service import create_backup, apply_retention_policy

class Command(BaseCommand):
    help = 'Genera un respaldo de la base de datos PostgreSQL en Neon (Full, Incremental o Diferencial).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            choices=['full', 'incremental', 'differential'],
            default='full',
            help='Tipo de respaldo a realizar: full, incremental o differential (default: full)'
        )
        parser.add_argument(
            '--clean-retention',
            action='store_true',
            help='Aplica inmediatamente la política de retención para depurar respaldos antiguos.'
        )

    def handle(self, *args, **options):
        backup_type = options['type']
        clean_retention = options['clean_retention']

        self.stdout.write(f"Iniciando backup de tipo: {backup_type.upper()}...")
        try:
            metadata = create_backup(backup_type=backup_type)
            self.stdout.write(self.style.SUCCESS(
                f"✅ Backup creado exitosamente:\n"
                f"   - Archivo: {metadata['filename']}\n"
                f"   - Tipo: {metadata['backup_type']}\n"
                f"   - Tamaño: {metadata['size']} bytes\n"
                f"   - Timestamp: {metadata['created_at']}\n"
                f"   - Estrategia: {metadata.get('strategy')}"
            ))

            if clean_retention:
                deleted = apply_retention_policy()
                if deleted:
                    self.stdout.write(self.style.WARNING(f"   - Archivos depurados por retención: {', '.join(deleted)}"))
                else:
                    self.stdout.write("   - No hay respaldos que excedan la cuota de retención.")

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"❌ Error al crear backup: {str(e)}"))
            raise e
