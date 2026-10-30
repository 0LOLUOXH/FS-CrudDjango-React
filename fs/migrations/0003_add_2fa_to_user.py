# Generated for Two-Factor Authentication (2FA TOTP RFC 6238)
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('fs', '0002_create_admin_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='otp_secret',
            field=models.CharField(blank=True, help_text='Clave secreta Base32 para TOTP (Google Authenticator)', max_length=64, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='is_2fa_enabled',
            field=models.BooleanField(default=False, help_text='Indica si la cuenta exige código 2FA para el inicio de sesión'),
        ),
    ]
