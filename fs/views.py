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
from django.contrib.auth import get_user_model
User = get_user_model()

class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
        })

#class LoginView(APIView):
#    def post(self, request):
#        username = request.data.get('username')
#        attempts = cache.get(f"login_attempts_{username}", 0)
#        
#        if attempts >= 3:
#            return Response({'error': 'Maximum login attempts exceeded.'}, status=403)
#        
#        serializer = LoginSerializer(data=request.data)
#        if serializer.is_valid():
#            cache.delete(f"login_attempts_{username}")
#            return Response(userSerializer(serializer.validated_data).data)
#        else:
#            cache.set(f"login_attempts_{username}", attempts + 1, timeout=300)
#            return Response(serializer.errors, status=400)

class PasswordResetView(APIView):
    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        if user:
            token = get_random_string(32)
            cache.set(f"password_reset_token_{token}", user.username, timeout=15*60)  # 15 min
            # Aquí guardar token si se requiere validación
            send_mail(
                'Password Reset',
                f'Click the link to reset your password: http://localhost:5173/reset-password/{token}',
                'mAlbertOrtega@gmail.com',
                [email],
                fail_silently=False
            )
        return Response({'message': 'If email exists, reset link was sent.'})
    
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