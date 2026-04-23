from django.apps import AppConfig


class FsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'fs'

    def ready(self):
        import fs.signals  # noqa: F401 — conecta todos los @receiver
