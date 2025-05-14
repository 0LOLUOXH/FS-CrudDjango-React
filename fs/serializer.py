from rest_framework import serializers
from .models import *

class userSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'date_joined')


class marcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = ('id', 'nombre')

class modeloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modelo
        fields = ('id', 'nombre', 'marca')
        
class clienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ('id', 'tipo', 'telefono')
        
class clienteJuridicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClienteJuridico
        fields = ('cliente', 'razon_social', 'ruc')
        
class ClienteNaturalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClienteNatural
        fields = ('cliente', 'nombre', 'apellido', 'cedula')
        
class empleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = ('id', 'nombre', 'apellido', 'telefono', 'cargo')
        
class bodegaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bodega
        fields = ('id', 'nombre', 'estado', 'capacidad', 'empleado')
        
class productoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ('id', 'nombre', 'modelo', 'codigobodega', 'descripcion', 'cantidad')

class stockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ('producto', 'precio_venta')

class PrecioProveedorProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrecioProveedorProducto
        fields = ('id', 'producto', 'proveedor', 'precio', 'iva')
        
class ventaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venta
        fields = ('id', 'fecha', 'cliente', 'empleado', 'total_a_pagar', 'metodo_de_pago', 'instalacion', 'direccion', 'precio_instalacion')
        
class detalleventaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleVenta
        fields = ('id', 'venta', 'producto', 'cantidad_por_producto')
        
class proveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = ('id', 'cedula', 'nombre', 'apellido', 'telefono')
        
class detalleproveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleProveedor        
        fields = ('id', 'proveedor', 'producto', 'tipo_comprobante', 'metodo_de_pago', 'numero_comprobante', 'fecha', 'total_a_pagar', 'cantidad')
