from rest_framework import viewsets
from .models import *
from .serializer import *

# Create your views here.
class marcaViewSet(viewsets.ModelViewSet):
    queryset = marca.objects.all()
    serializer_class = marcaSerializer

class modeloViewSet(viewsets.ModelViewSet):
    queryset = modelo.objects.all()
    serializer_class = modeloSerializer
    
class clienteViewSet(viewsets.ModelViewSet):
    queryset = cliente.objects.all()
    serializer_class = clienteSerializer
    
class empleadoViewSet(viewsets.ModelViewSet):
    queryset = empleado.objects.all()
    serializer_class = empleadoSerializer
    
class bodegaViewSet(viewsets.ModelViewSet):
    queryset = bodega.objects.all()
    serializer_class = bodegaSerializer
    
class productoViewSet(viewsets.ModelViewSet):
    queryset = producto.objects.all()
    serializer_class = productoSerializer
    
class ventaViewSet(viewsets.ModelViewSet):
    queryset = venta.objects.all()
    serializer_class = ventaSerializer
    
class detalleventaViewSet(viewsets.ModelViewSet):
    queryset = detalleventa.objects.all()
    serializer_class = detalleventaSerializer
    
class proveedorViewSet(viewsets.ModelViewSet):
    queryset = proveedor.objects.all()
    serializer_class = proveedorSerializer
    
class detalleproveedorViewSet(viewsets.ModelViewSet):
    queryset = detalleproveedor.objects.all()
    serializer_class = detalleproveedorSerializer