from django.core.management.base import BaseCommand
from fs.backup_service import restore_backup

class Command(BaseCommand):
    help = 'Restaura la base de datos PostgreSQL desde un archivo de backup previamente generado.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--filename',
            type=str,
            required=True,
            help='Nombre del archivo de backup a restaurar (ej. full_20261025_120000.dump)'
        )

    def handle(self, *args, **options):
        filename = options['filename']

        self.stdout.write(f"Iniciando restauración desde: {filename}...")
        try:
            result = restore_backup(filename)
            self.stdout.write(self.style.SUCCESS(
                f"✅ {result['message']}\n"
                f"   - Respaldo de seguridad preventivo creado: {result.get('pre_restore_backup')}"
            ))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"❌ Error al restaurar backup: {str(e)}"))
            raise e
