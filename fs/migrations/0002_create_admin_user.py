import os
from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_admin_user(apps, schema_editor):
    User = apps.get_model('fs', 'User')
    username = os.environ.get('ADMIN_USERNAME', 'admin')
    email = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
    password = os.environ.get('ADMIN_PASSWORD', 'admin')

    user = User.objects.filter(username=username).first()
    if not user:
        User.objects.create(
            username=username,
            email=email,
            first_name='Admin',
            last_name='System',
            password=make_password(password),
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
    else:
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()

def reverse_admin_user(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('fs', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_admin_user, reverse_admin_user),
    ]
