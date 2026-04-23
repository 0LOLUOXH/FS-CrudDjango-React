import threading

# Almacén thread-local: cada request tiene su propio espacio aislado
_current_user = threading.local()


def get_current_user():
    """Retorna el usuario autenticado del request actual, o None si no hay."""
    return getattr(_current_user, 'user', None)


class CurrentUserMiddleware:
    """
    Middleware que captura el usuario autenticado en cada request
    y lo almacena en un thread-local para que los signals puedan accederlo.
    Debe ir DESPUÉS de 'django.contrib.auth.middleware.AuthenticationMiddleware'
    en MIDDLEWARE de settings.py.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Guardar el usuario actual en el thread-local
        _current_user.user = getattr(request, 'user', None)
        response = self.get_response(request)
        return response
