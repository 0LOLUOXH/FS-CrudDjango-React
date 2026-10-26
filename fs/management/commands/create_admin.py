import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

class Command(BaseCommand):
    help = 'Crea o actualiza el usuario administrador con privilegios totales de forma idempotente.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default=os.environ.get('ADMIN_USERNAME', 'admin'),
            help='Nombre de usuario (default: admin)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default=os.environ.get('ADMIN_PASSWORD', 'admin'),
            help='Contraseña para el usuario (default: admin)'
        )
        parser.add_argument(
            '--email',
            type=str,
            default=os.environ.get('ADMIN_EMAIL', 'admin@example.com'),
            help='Correo electrónico (default: admin@example.com)'
        )
        parser.add_argument(
            '--force-password',
            action='store_true',
            help='Fuerza la actualización de la contraseña si el usuario ya existía.'
        )

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']
        email = options['email']
        force_password = options['force_password']

        User = get_user_model()

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': 'Admin',
                'last_name': 'System',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )

        if created:
            user.set_password(password)
            user.save()
            action_msg = f"✅ Superusuario '{username}' creado exitosamente con contraseña '{password}'."
        else:
            # Asegurar siempre que tenga privilegios completos
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            if force_password:
                user.set_password(password)
                action_msg = f"ℹ️  Superusuario '{username}' actualizado (privilegios y contraseña restablecida a '{password}')."
            else:
                action_msg = f"ℹ️  Superusuario '{username}' ya existía. Privilegios administrativos confirmados (contraseña preservada)."
            user.save()

        token, token_created = Token.objects.get_or_create(user=user)

        self.stdout.write(self.style.SUCCESS(action_msg))
        self.stdout.write(self.style.SUCCESS(
            f"   - is_staff: {user.is_staff}\n"
            f"   - is_superuser: {user.is_superuser}\n"
            f"   - is_active: {user.is_active}\n"
            f"   - Email: {user.email}\n"
            f"   - Token API: {token.key}"
        ))
