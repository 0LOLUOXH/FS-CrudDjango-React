from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import *
from django.contrib.auth import get_user_model
User = get_user_model()

class userSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'is_staff', 'is_active', 'email', 'date_joined')
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'is_active': {'read_only': True},  # Opcional: para que no se pueda modificar desde la API
            'date_joined': {'read_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_staff=validated_data.get('is_staff', False)
        )
        return user

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        
        password = validated_data.get('password')
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance
        
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(request=self.context.get('request'),
                                username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("User account is disabled.")
                data['user'] = user
                return data
            else:
                raise serializers.ValidationError("Invalid credentials.")
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'.")


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
    telefono = serializers.CharField(source='cliente.telefono', read_only=True)
    
    class Meta:
        model = ClienteJuridico
        fields = ('cliente', 'razon_social', 'ruc', 'telefono')
        
class ClienteNaturalSerializer(serializers.ModelSerializer):
    telefono = serializers.CharField(source='cliente.telefono', read_only=True)

    class Meta:
        model = ClienteNatural
        fields = ('cliente', 'nombre', 'apellido', 'cedula', 'telefono')
        
class empleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = ('id', 'nombre', 'apellido', 'telefono', 'cargo')
        
class bodegaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bodega
        fields = ('id', 'nombre', 'estado', 'capacidad', 'empleado')
        
class productoSerializer(serializers.ModelSerializer):
    nmodelo = serializers.CharField(source='modelo.nombre', read_only=True)
    nmarca = serializers.CharField(source='modelo.marca.nombre', read_only=True)
    bodega = serializers.CharField(source='codigobodega.nombre', read_only=True)
    
    class Meta:
        model = Producto
        fields = ('id', 'nombre', 'modelo', 'bodega', 'codigobodega', 'descripcion', 'cantidad', 'nmodelo', 'nmarca')

class stockSerializer(serializers.ModelSerializer):
    cantidad = serializers.IntegerField(source='producto.cantidad', read_only=True, default=0)
    modelo = serializers.CharField(source='producto.modelo.nombre', read_only=True)
    marca = serializers.CharField(source='producto.modelo.marca.nombre', read_only=True)
    class Meta:
        model = Stock
        fields = ('cantidad', 'producto', 'precio_venta', 'modelo', 'marca')

class PrecioProveedorProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrecioProveedorProducto
        fields = ('id', 'producto', 'proveedor', 'precio', 'iva', 'numero_comprobante')
        
class ventaSerializer(serializers.ModelSerializer):
    ncliente = serializers.CharField(source='cliente.nombre', read_only=True)
    tcliente = serializers.CharField(source='cliente.tipo', read_only=True)
    nempleado = serializers.CharField(source='empleado.nombre', read_only=True)
    class Meta:
        model = Venta
        fields = ('id', 'fecha', 'cliente', 'empleado', 'total_a_pagar', 'metodo_de_pago', 'instalacion', 'direccion', 'precio_instalacion', 'ncliente', 'tcliente', 'nempleado')
        
class detalleventaSerializer(serializers.ModelSerializer):
    nproducto = serializers.CharField(source='producto.nombre', read_only=True)
    class Meta:
        model = DetalleVenta
        fields = ('id', 'venta', 'producto', 'cantidad_por_producto', 'nproducto', 'preciodelproducto',)
        
class proveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = ('id', 'cedula', 'nombre', 'apellido', 'telefono')
        
class detalleproveedorSerializer(serializers.ModelSerializer):
    nproducto = serializers.CharField(source='producto.nombre', read_only=True)
    nproveedor = serializers.CharField(source='proveedor.nombre', read_only=True)
    class Meta:
        model = DetalleProveedor        
        fields = ('id', 'proveedor', 'producto', 'tipo_comprobante', 'metodo_de_pago', 'numero_comprobante', 'fecha', 'total_a_pagar', 'cantidad', 'nproveedor', 'nproducto',)
