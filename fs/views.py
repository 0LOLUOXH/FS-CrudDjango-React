from rest_framework import viewsets
from .models import *
from .serializer import *

# Create your views here.
class marcaViewSet(viewsets.ModelViewSet):
    queryset = Marca.objects.all()
    serializer_class = marcaSerializer

class modeloViewSet(viewsets.ModelViewSet):
    queryset = Modelo.objects.all()
    serializer_class = modeloSerializer
    
class clienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = clienteSerializer

class clientejuridicoViewSet(viewsets.ModelViewSet):
    queryset = ClienteJuridico.objects.all()
    serializer_class = clienteJuridicoSerializer
    
class clienteNaturalViewSet(viewsets.ModelViewSet):
    queryset = ClienteNatural.objects.all()
    serializer_class = ClienteNaturalSerializer
    
class empleadoViewSet(viewsets.ModelViewSet):
    queryset = Empleado.objects.all()
    serializer_class = empleadoSerializer
    
class bodegaViewSet(viewsets.ModelViewSet):
    queryset = Bodega.objects.all()
    serializer_class = bodegaSerializer
    
class productoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = productoSerializer
    
class stockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = stockSerializer

class precioproveedorproductoViewSet(viewsets.ModelViewSet):
    queryset = PrecioProveedorProducto.objects.all()
    serializer_class = PrecioProveedorProductoSerializer
    
class ventaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    serializer_class = ventaSerializer
    
class detalleventaViewSet(viewsets.ModelViewSet):
    queryset = DetalleVenta.objects.all()
    serializer_class = detalleventaSerializer
    
class proveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = proveedorSerializer
    
class detalleproveedorViewSet(viewsets.ModelViewSet):
    queryset = DetalleProveedor.objects.all()
    serializer_class = detalleproveedorSerializer
    
# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from .serializer import LoginSerializer, userSerializer
from django.core.cache import cache
from django.contrib.auth.tokens import default_token_generator
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
import re
User = get_user_model()

class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')

        if not username:
            raise AuthenticationFailed('Se requiere nombre de usuario.')

        # Claves de cache por usuario
        attempts_cache_key = f'login_attempts_{username}'
        blocked_cache_key = f'login_blocked_{username}'

        # Verificar si está bloqueado
        if cache.get(blocked_cache_key):
            raise AuthenticationFailed('Demasiados intentos fallidos. Inténtalo de nuevo en 1 minuto.')

        serializer = LoginSerializer(data=request.data, context={'request': request})

        try:
            serializer.is_valid(raise_exception=True)
        except AuthenticationFailed as e:
            # Manejo de intento fallido
            attempts = cache.get(attempts_cache_key, 0) + 1
            cache.set(attempts_cache_key, attempts, timeout=60)  # Guarda por 60 segundos

            if attempts >= 3:
                cache.set(blocked_cache_key, True, timeout=60)  # Bloquea por 60 segundos
                cache.delete(attempts_cache_key)  # Reinicia intentos
                raise AuthenticationFailed('Demasiados intentos fallidos. Usuario bloqueado por 1 minuto.')

            raise AuthenticationFailed(f'Credenciales inválidas. Intentos restantes: {3 - attempts}')

        # Si el login fue exitoso, limpiamos los intentos
        cache.delete(attempts_cache_key)
        cache.delete(blocked_cache_key)

        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
        })
        
        
class PasswordResetView(APIView):
    def post(self, request):
        email = request.data.get('email')

        if not email:
            raise ValidationError({"detail": "El correo electrónico es obligatorio."})

        if not self.validate_email(email):
            raise ValidationError({"detail": "Formato de correo inválido."})

        user = User.objects.filter(email=email).first()

        if user:
            token = get_random_string(48)  # Token más largo y seguro
            cache.set(f"password_reset_token_{token}", user.username, timeout=15*60)  # 15 minutos

            reset_url = f"http://localhost:5173/reset-password/{token}"

            try:
                send_mail(
                    'Restablecer contraseña',
                    f'Hola {user.username},\n\nHaz clic en el siguiente enlace para restablecer tu contraseña:\n{reset_url}\n\nEste enlace es válido por 15 minutos.',
                    'fsolar2025@gmail.com',
                    [email],
                    fail_silently=False
                )
            except Exception as e:
                # Log or notify error
                print(f"Error enviando correo: {e}")

        # Siempre responder igual, para proteger privacidad del usuario
        return Response({'detail': 'Si el correo está registrado, se ha enviado un enlace para restablecer la contraseña.'}, status=status.HTTP_200_OK)

    def validate_email(self, email):
        """Validar formato de correo."""
        pattern = r"[^@]+@[^@]+\.[^@]+"
        return re.match(pattern, email)
    
token_store = {}
    
# views.py
class PasswordResetConfirmView(APIView):
    def post(self, request, token):
        username = cache.get(f"password_reset_token_{token}")
        if not username:
            return Response({'error': 'Invalid or expired token'}, status=400)
        
        user = User.objects.filter(username=username).first()
        if not user:
            return Response({'error': 'User not found'}, status=404)
        
        password = request.data.get('password')
        user.set_password(password)
        user.save()

        cache.delete(f"password_reset_token_{token}")

        return Response({'message': 'Password reset successful'})

class userViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = userSerializer
    
    def get_queryset(self):
        # Puedes añadir filtros adicionales aquí si es necesario
        return super().get_queryset()
    
# api/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from django.http import JsonResponse, HttpResponse
from django.conf import settings
from datetime import datetime
import os
import shutil
import json

# Crear Backup
class CreateBackupView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            db_path = settings.DATABASES['default']['NAME']
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"backup_{timestamp}.db"
            backup_path = os.path.join(settings.BACKUPS_DIR, backup_filename)

            shutil.copy2(db_path, backup_path)

            metadata = {
                'filename': backup_filename,
                'created_at': datetime.now().isoformat(),
                'size': os.path.getsize(backup_path),
                'db_path': str(db_path)  # ✅ Convertido a string
            }

            with open(os.path.join(settings.BACKUPS_DIR, f"{backup_filename}.meta"), 'w') as f:
                json.dump(metadata, f)

            return JsonResponse({
                'status': 'success',
                'message': 'Backup creado correctamente',
                'backup': metadata
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# Restaurar Backup
class RestoreBackupView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = request.data
            backup_filename = data.get('filename')

            if not backup_filename:
                return JsonResponse({'status': 'error', 'message': 'Nombre de backup no proporcionado'}, status=400)

            backup_path = os.path.join(settings.BACKUPS_DIR, backup_filename)
            db_path = settings.DATABASES['default']['NAME']

            if not os.path.exists(backup_path):
                return JsonResponse({'status': 'error', 'message': 'Backup no encontrado'}, status=404)

            # Guardar respaldo actual antes de restaurar
            current_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pre_restore_backup = f"pre_restore_{current_timestamp}.db"
            shutil.copy2(db_path, os.path.join(settings.BACKUPS_DIR, pre_restore_backup))

            shutil.copy2(backup_path, db_path)

            return JsonResponse({
                'status': 'success',
                'message': f'Base de datos restaurada desde {backup_filename}',
                'pre_restore_backup': pre_restore_backup
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# Listar Backups
class ListBackupsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            backups = []
            files = os.listdir(settings.BACKUPS_DIR)

            for file in files:
                if file.startswith('backup_') and file.endswith('.db'):
                    meta_file = os.path.join(settings.BACKUPS_DIR, f"{file}.meta")
                    if os.path.exists(meta_file):
                        try:
                            with open(meta_file, 'r') as f:
                                metadata = json.load(f)
                                backups.append(metadata)
                        except Exception as e:
                            print(f"Error leyendo {meta_file}: {str(e)}")

            backups.sort(key=lambda x: x['created_at'], reverse=True)

            return JsonResponse({
                'status': 'success',
                'backups': backups
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e), 'backups': []}, status=500)

# Descargar Backup
class DownloadBackupView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            backup_filename = request.GET.get('filename')
            if not backup_filename:
                return JsonResponse({'status': 'error', 'message': 'Nombre de backup no proporcionado'}, status=400)

            backup_path = os.path.join(settings.BACKUPS_DIR, backup_filename)

            if not os.path.exists(backup_path):
                return JsonResponse({'status': 'error', 'message': 'Backup no encontrado'}, status=404)

            with open(backup_path, 'rb') as fh:
                response = HttpResponse(fh.read(), content_type='application/octet-stream')
                response['Content-Disposition'] = f'attachment; filename={os.path.basename(backup_path)}'
                return response
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# Eliminar Backup
class DeleteBackupView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        try:
            backup_filename = request.GET.get('filename')
            if not backup_filename:
                return JsonResponse({'status': 'error', 'message': 'Nombre de backup no proporcionado'}, status=400)

            backup_path = os.path.join(settings.BACKUPS_DIR, backup_filename)
            meta_path = os.path.join(settings.BACKUPS_DIR, f"{backup_filename}.meta")

            if not os.path.exists(backup_path):
                return JsonResponse({'status': 'error', 'message': 'Backup no encontrado'}, status=404)

            os.remove(backup_path)
            if os.path.exists(meta_path):
                os.remove(meta_path)

            return JsonResponse({'status': 'success', 'message': 'Backup eliminado correctamente'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
