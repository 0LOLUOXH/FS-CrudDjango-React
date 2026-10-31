from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed, ValidationError, PermissionDenied
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.middleware.csrf import get_token
from django.core.cache import cache
from django.conf import settings
from fs.api.serializers import LoginSerializer, userSerializer
from fs.api.totp import (
    generate_totp_secret,
    get_totp_uri,
    verify_totp_code,
    generate_qr_code_base64
)
import re

User = get_user_model()

class LoginView(APIView):
    """
    Inicio de sesión seguro con soporte para Doble Factor de Autenticación (2FA / TOTP):
    1. Mitigación de fuerza bruta con bloqueo temporal por IP/usuario.
    2. Si el usuario tiene 2FA activo, genera un desafío provisional y solicita el código TOTP.
    3. Si no requiere 2FA, emite la Cookie HttpOnly, Secure y SameSite=Strict directamente.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')

        if not username:
            raise AuthenticationFailed('Se requiere nombre de usuario.')

        attempts_cache_key = f'login_attempts_{username}'
        blocked_cache_key = f'login_blocked_{username}'

        if cache.get(blocked_cache_key):
            raise AuthenticationFailed('Demasiados intentos fallidos. Inténtalo de nuevo en 1 minuto.')

        serializer = LoginSerializer(data=request.data, context={'request': request})

        try:
            serializer.is_valid(raise_exception=True)
        except AuthenticationFailed:
            attempts = cache.get(attempts_cache_key, 0) + 1
            cache.set(attempts_cache_key, attempts, timeout=60)

            if attempts >= 3:
                cache.set(blocked_cache_key, True, timeout=60)
                cache.delete(attempts_cache_key)
                raise AuthenticationFailed('Demasiados intentos fallidos. Usuario bloqueado por 1 minuto.')

            raise AuthenticationFailed(f'Credenciales inválidas. Intentos restantes: {3 - attempts}')

        cache.delete(attempts_cache_key)
        cache.delete(blocked_cache_key)

        user = serializer.validated_data['user']

        # Verificar si el usuario tiene activo el Doble Factor de Autenticación (2FA)
        if user.is_2fa_enabled and user.otp_secret:
            # Generar token temporal de desafío (5 minutos de validez)
            temp_token = get_random_string(64)
            cache.set(f"2fa_pending_{temp_token}", user.pk, timeout=300)

            return Response({
                'requires_2fa': True,
                'temp_token': temp_token,
                'username': user.username,
                'message': 'Autenticación de dos factores requerida. Ingrese el código de 6 dígitos de su app autenticadora.',
            }, status=status.HTTP_200_OK)

        # Si no requiere 2FA, completar autenticación y emitir cookie HttpOnly
        return self._issue_authenticated_response(request, user)

    @staticmethod
    def _issue_authenticated_response(request, user):
        token, _ = Token.objects.get_or_create(user=user)
        csrf_token = get_token(request)

        response = Response({
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_2fa_enabled': user.is_2fa_enabled,
            'token': token.key,
            'message': 'Autenticación exitosa',
        }, status=status.HTTP_200_OK)

        is_secure = not settings.DEBUG or getattr(settings, 'SESSION_COOKIE_SECURE', True)
        response.set_cookie(
            key='auth_token',
            value=token.key,
            max_age=7 * 24 * 60 * 60,  # 7 días
            httponly=True,
            secure=is_secure,
            samesite='Strict',
            path='/'
        )
        return response


class Verify2FALoginView(APIView):
    """
    Segundo paso del inicio de sesión con 2FA (RFC 6238 TOTP):
    Valida el código de 6 dígitos y el desafío temporal para emitir la cookie definitiva.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        temp_token = request.data.get('temp_token')
        otp_code = request.data.get('otp_code')

        if not temp_token or not otp_code:
            raise ValidationError({'error': 'El token temporal y el código de verificación son obligatorios.'})

        user_id = cache.get(f"2fa_pending_{temp_token}")
        if not user_id:
            raise AuthenticationFailed('El desafío de verificación ha expirado o no es válido. Inicie sesión nuevamente.')

        attempts_key = f"2fa_attempts_{temp_token}"
        attempts = cache.get(attempts_key, 0) + 1
        cache.set(attempts_key, attempts, timeout=300)

        if attempts > 5:
            cache.delete(f"2fa_pending_{temp_token}")
            cache.delete(attempts_key)
            raise AuthenticationFailed('Demasiados intentos fallidos. Desafío 2FA cancelado por seguridad.')

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed('Usuario no encontrado.')

        if not user.otp_secret:
            raise AuthenticationFailed('No hay configuración de 2FA activa para este usuario.')

        if not verify_totp_code(user.otp_secret, otp_code):
            remaining = 5 - attempts
            if remaining <= 0:
                cache.delete(f"2fa_pending_{temp_token}")
                cache.delete(attempts_key)
                raise AuthenticationFailed('Demasiados intentos fallidos. Desafío 2FA cancelado por seguridad.')
            raise AuthenticationFailed(f'Código de autenticación incorrecto. Intentos restantes: {remaining}')

        # Código válido: consumir el desafío temporal y emitir la cookie HttpOnly
        cache.delete(f"2fa_pending_{temp_token}")
        cache.delete(attempts_key)
        return LoginView._issue_authenticated_response(request, user)


class Setup2FAView(APIView):
    """
    Generación de secreto y código QR para vincular Google Authenticator / Authy.
    Requiere que el usuario esté autenticado.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        secret = generate_totp_secret()
        otpauth_uri = get_totp_uri(secret, user.username)
        qr_code_base64 = generate_qr_code_base64(otpauth_uri)

        # Guardar temporalmente en caché para confirmación en los próximos 10 minutos
        cache.set(f"2fa_setup_{user.pk}", secret, timeout=600)

        return Response({
            'secret': secret,
            'otpauth_uri': otpauth_uri,
            'qr_code': qr_code_base64,
            'message': 'Escanee el código QR o introduzca la clave en su app autenticadora para completar la activación.'
        }, status=status.HTTP_200_OK)


class Confirm2FAView(APIView):
    """
    Confirma el primer código emitido por la app y activa permanentemente el 2FA en la cuenta.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        otp_code = request.data.get('otp_code')

        if not otp_code:
            raise ValidationError({'error': 'Debe proporcionar el código de 6 dígitos emitido por su app.'})

        pending_secret = cache.get(f"2fa_setup_{user.pk}")
        if not pending_secret:
            return Response(
                {'error': 'No hay un proceso de configuración de 2FA activo o la sesión expiró. Inicie el proceso nuevamente.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not verify_totp_code(pending_secret, otp_code):
            return Response(
                {'error': 'Código inválido. Asegúrese de que la hora de su teléfono esté sincronizada e intente de nuevo.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Confirmación exitosa: persistir secreto y activar 2FA
        user.otp_secret = pending_secret
        user.is_2fa_enabled = True
        user.save(update_fields=['otp_secret', 'is_2fa_enabled'])
        cache.delete(f"2fa_setup_{user.pk}")

        try:
            from fs.models.user import AuditLog
            AuditLog.objects.create(
                user=user,
                action="SECURITY_2FA_ENABLED",
                table_name="custom_user",
                record_id=user.pk,
                description=f"El usuario '{user.username}' activó la Autenticación de Doble Factor (2FA / TOTP)."
            )
        except Exception as e:
            print(f"[Seguridad] Error registrando AuditLog para activación 2FA: {e}")

        return Response({
            'success': True,
            'is_2fa_enabled': True,
            'message': '¡Autenticación de Doble Factor (2FA) activada exitosamente! Su cuenta ahora está protegida.'
        }, status=status.HTTP_200_OK)


class Disable2FAView(APIView):
    """
    Desactiva el 2FA en la cuenta tras validar la contraseña actual del usuario y un código OTP.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        password = request.data.get('password')
        otp_code = request.data.get('otp_code')

        if not password:
            raise ValidationError({'error': 'Debe ingresar su contraseña actual para deshabilitar 2FA.'})

        if not user.check_password(password):
            raise AuthenticationFailed('Contraseña incorrecta.')

        if user.is_2fa_enabled and user.otp_secret:
            if not otp_code or not verify_totp_code(user.otp_secret, otp_code):
                raise AuthenticationFailed('Código de autenticación 2FA requerido o incorrecto.')

        user.is_2fa_enabled = False
        user.otp_secret = None
        user.save(update_fields=['is_2fa_enabled', 'otp_secret'])

        try:
            from fs.models.user import AuditLog
            AuditLog.objects.create(
                user=user,
                action="SECURITY_2FA_DISABLED",
                table_name="custom_user",
                record_id=user.pk,
                description=f"El usuario '{user.username}' desactivó la Autenticación de Doble Factor (2FA / TOTP)."
            )
        except Exception as e:
            print(f"[Seguridad] Error registrando AuditLog para desactivación 2FA: {e}")

        return Response({
            'success': True,
            'is_2fa_enabled': False,
            'message': 'El Doble Factor de Autenticación ha sido desactivado de su cuenta.'
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Cierre de sesión seguro:
    1. Invalida el token en el backend.
    2. Elimina la cookie HttpOnly 'auth_token'.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        if request.user.is_authenticated:
            Token.objects.filter(user=request.user).delete()
        
        response = Response({'detail': 'Sesión cerrada correctamente.'}, status=status.HTTP_200_OK)
        response.delete_cookie('auth_token', path='/', samesite='Strict')
        return response


class SessionMeView(APIView):
    """
    Verificación de sesión activa:
    Permite al frontend React conocer el estado de autenticación
    sin almacenar tokens sensibles en localStorage ni sessionStorage.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'isAuthenticated': True,
            'user': {
                'user_id': user.pk,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_2fa_enabled': user.is_2fa_enabled,
            }
        }, status=status.HTTP_200_OK)


class CsrfTokenView(APIView):
    """
    Endpoint para obtener o renovar el token CSRF.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        token = get_token(request)
        return Response({'csrfToken': token}, status=status.HTTP_200_OK)


class PasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            raise ValidationError({"detail": "El correo electrónico es obligatorio."})

        if not self.validate_email(email):
            raise ValidationError({"detail": "Formato de correo inválido."})

        user = User.objects.filter(email=email).first()

        if user:
            token = get_random_string(48)
            cache.set(f"password_reset_token_{token}", user.username, timeout=15 * 60)

            frontend_origin = request.headers.get('Origin') or 'http://localhost:5173'
            reset_url = f"{frontend_origin}/reset-password/{token}"

            try:
                send_mail(
                    subject='Restablecer contraseña',
                    message=f'Hola {user.username},\n\nHaz clic en el siguiente enlace para restablecer tu contraseña:\n{reset_url}\n\nEste enlace es válido por 15 minutos.',
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@fusionsolar.local'),
                    recipient_list=[email],
                    fail_silently=False
                )
            except Exception as e:
                print(f"[Seguridad] Error enviando correo de restablecimiento: {e}")

        return Response(
            {'detail': 'Si el correo está registrado, se ha enviado un enlace para restablecer la contraseña.'},
            status=status.HTTP_200_OK
        )

    def validate_email(self, email):
        pattern = r"[^@]+@[^@]+\.[^@]+"
        return re.match(pattern, email)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, token):
        username = cache.get(f"password_reset_token_{token}")
        if not username:
            return Response({'error': 'Enlace inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username=username).first()
        if not user:
            return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        password = request.data.get('password')
        if not password:
            return Response({'error': 'La contraseña es obligatoria.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(password, user=user)
        except ValidationError as e:
            return Response({'error': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()

        cache.delete(f"password_reset_token_{token}")
        Token.objects.filter(user=user).delete()

        return Response({'message': 'Contraseña restablecida exitosamente.'}, status=status.HTTP_200_OK)


class userViewSet(viewsets.ModelViewSet):
    """
    Gestión de usuarios con control de acceso RBAC y prevención estricta de IDOR:
    - Administradores/Staff: Acceso al conjunto completo de usuarios.
    - Usuarios regulares: Restringidos exclusivamente a su propio perfil (Anti-IDOR).
    - Prevención de escalación de privilegios.
    """
    queryset = User.objects.all()
    serializer_class = userSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return User.objects.none()
        if user.is_staff or user.is_superuser:
            return User.objects.all()
        return User.objects.filter(id=user.id)

    def perform_create(self, serializer):
        if not self.request.user.is_staff and not self.request.user.is_superuser:
            raise PermissionDenied("No posee privilegios para registrar nuevos usuarios en el sistema.")
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        if not (user.is_staff or user.is_superuser):
            if 'is_staff' in serializer.validated_data or 'is_superuser' in serializer.validated_data:
                raise PermissionDenied("No tiene permisos para modificar roles o privilegios de usuario.")
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.is_staff and not self.request.user.is_superuser:
            raise PermissionDenied("No posee permisos para eliminar usuarios.")
        instance.delete()
