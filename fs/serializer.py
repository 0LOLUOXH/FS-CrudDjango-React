from rest_framework import serializers
from .models import *

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
        fields = ('id', 'tipo','identificacion', 'nombre', 'apellido', 'telefono')
        
class clienteJuridicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClienteJuridico
        fields = ('id','cliente', 'razon_social')
        
class empleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = ('id', 'nombre', 'apellido', 'telefono', 'cargo')
        
class bodegaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bodega
        fields = ('id', 'nombre', 'estado', 'capacidad', 'idempleado')
        
class productoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ('id', 'nombre', 'modelo', 'codigobodega', 'descripcion', 'cantidad', 'fechadeactualizacion')

class PrecioProveedorProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrecioProveedorProducto
        fields = ('id', 'producto', 'proveedor', 'precio', 'ganancia', 'iva', 'fecha_actualizacion')
        
class ventaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venta
        fields = ('id', 'fecha', 'cliente', 'empleado', 'totalapagar', 'metododepago', 'instalacion', 'direccion', 'precioinstalacion')
        
class detalleventaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleVenta
        fields = ('id', 'venta', 'producto', 'cantidadporproducto')
        
class proveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = ('id', 'cedula', 'nombre', 'apellido', 'telefono')
        
class detalleproveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleProveedor        
        fields = ('id', 'proveedor', 'producto', 'tipocomprobante', 'metododepago', 'numerocomprobante', 'fecha', 'totalapagar', 'cantidad')

class promocionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promocion
        fields = ('id', 'nombre', 'descripcion', 'tipo_descuento', 'valor_descuento', 'fecha_inicio', 'fecha_fin', 'productos', 'activo')