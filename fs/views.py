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
    
class userViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = userSerializer