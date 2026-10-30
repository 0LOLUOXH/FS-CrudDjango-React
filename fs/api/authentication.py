from rest_framework.authentication import BaseAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model

User = get_user_model()

class CookieTokenAuthentication(BaseAuthentication):
    """
    Autenticación segura basada en Cookies HttpOnly (ISO 27001 / OWASP ASVS).
    
    1. Busca la clave del token en la cookie HttpOnly 'auth_token'.
    2. Como respaldo controlado (para herramientas de automatización/pruebas),
       permite la cabecera 'Authorization: Token <key>'.
    3. Valida la existencia del token y que el usuario permanezca activo.
    """
    def authenticate(self, request):
        token_key = request.COOKIES.get('auth_token')
        
        # Fallback para herramientas CLI / scripts que utilicen Authorization header
        if not token_key:
            auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
            if auth_header and auth_header.startswith('Token '):
                parts = auth_header.split(' ')
                if len(parts) == 2:
                    token_key = parts[1]
            elif auth_header and auth_header.startswith('Bearer '):
                parts = auth_header.split(' ')
                if len(parts) == 2:
                    token_key = parts[1]
                    
        if not token_key:
            return None

        try:
            token = Token.objects.select_related('user').get(key=token_key)
        except Token.DoesNotExist:
            raise AuthenticationFailed('Token de autenticación inválido o expirado.')

        if not token.user.is_active:
            raise AuthenticationFailed('La cuenta de usuario se encuentra inactiva o deshabilitada.')

        return (token.user, token)

    def authenticate_header(self, request):
        return 'Token'
