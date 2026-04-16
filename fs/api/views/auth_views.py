from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from fs.api.serializers import LoginSerializer, userSerializer
from django.core.cache import cache
from django.contrib.auth.tokens import default_token_generator
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed, ValidationError
import re

User = get_user_model()

class LoginView(APIView):
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
        except AuthenticationFailed as e:
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
            token = get_random_string(48)
            cache.set(f"password_reset_token_{token}", user.username, timeout=15*60)

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
                print(f"Error enviando correo: {e}")

        return Response({'detail': 'Si el correo está registrado, se ha enviado un enlace para restablecer la contraseña.'}, status=status.HTTP_200_OK)

    def validate_email(self, email):
        pattern = r"[^@]+@[^@]+\.[^@]+"
        return re.match(pattern, email)
    
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
        return super().get_queryset()
