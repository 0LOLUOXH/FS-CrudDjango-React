from rest_framework import serializers
from .models import *

class marcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = marca
        fields = ('id', 'nombre')

class modeloSerializer(serializers.ModelSerializer):
    class Meta:
        model = modelo
        fields = ('id', 'nombre', 'marca')
        
class clienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = cliente
        fields = ('id', 'cedula', 'nombre', 'apellido', 'telefono')
        
class empleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = empleado
        fields = ('id', 'nombre', 'apellido', 'telefono', 'cargo')
        
class bodegaSerializer(serializers.ModelSerializer):
    class Meta:
        model = bodega
        fields = ('id', 'nombre', 'estado', 'capacidad', 'idempleado')
        
class productoSerializer(serializers.ModelSerializer):
    class Meta:
        model = producto
        fields = ('id', 'nombre', 'modeloandmarca', 'preciounitario', 'ganancia', 'iva', 'codigobodega', 'descripcion', 'cantidad', 'fechadeactualizacion')
        
class ventaSerializer(serializers.ModelSerializer):
    class Meta:
        model = venta
        fields = ('id', 'fecha', 'cliente', 'empleado', 'totalapagar', 'metododepago', 'instalacion', 'direccion', 'precioinstalacion')
        
class detalleventaSerializer(serializers.ModelSerializer):
    class Meta:
        model = detalleventa
        fields = ('id', 'venta', 'producto', 'cantidadporproducto')
        
class proveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = proveedor
        fields = ('id', 'cedula', 'nombre', 'apellido', 'telefono')
        
class detalleproveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = detalleproveedor        
        fields = ('id', 'proveedor', 'producto', 'tipocomprobante', 'metododepago', 'numerocomprobante', 'fecha', 'totalapagar', 'cantidad')