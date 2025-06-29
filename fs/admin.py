from django.contrib import admin
from .models import *

# Register your models here.
@admin.register(User)
class useradminn(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'date_joined')
    list_filter = ('date_joined',)
    
@admin.register(Marca)
class Marcaadmin(admin.ModelAdmin):
    list_display = ('id','nombre')
    
@admin.register(Modelo)
class Modeloadmin(admin.ModelAdmin):
    list_display = ('id','nombre', 'marca')
    
@admin.register(Cliente)
class Clienteadmin(admin.ModelAdmin):
    list_display = ('id','tipo', 'telefono')

@admin.register(ClienteJuridico)
class ClienteJuridicoadmin(admin.ModelAdmin):
    list_display = ('cliente', 'razon_social', 'ruc', 'respresentante', 'email')

@admin.register(ClienteNatural)
class ClienteNaturaladmin(admin.ModelAdmin):
    list_display = ('cliente', 'nombre', 'apellido', 'cedula')
    
@admin.register(Empleado)
class Empleadoadmin(admin.ModelAdmin):
    list_display = ('id','nombre', 'apellido', 'telefono', 'cargo')
    
@admin.register(Bodega)
class Bodegaadmin(admin.ModelAdmin):
    list_display = ('id','nombre', 'estado', 'capacidad', 'empleado')
    
@admin.register(Producto)
class Productoadmin(admin.ModelAdmin):
    list_display = ('id','nombre', 'modelo', 'precio_venta', 'codigobodega', 'descripcion', 'cantidad')


@admin.register(PrecioProveedorProducto)
class PrecioProveedorProductoadmin(admin.ModelAdmin):
    list_display = ('id','producto', 'proveedor', 'precio', 'iva', 'numero_comprobante')
    
@admin.register(Venta)
class Ventadmin(admin.ModelAdmin):
    list_display = ('id','fecha', 'cliente', 'empleado', 'total_a_pagar', 'metodo_de_pago', 'instalacion', 'precio_instalacion', 'direccion')
    
@admin.register(DetalleVenta)
class DetalleVentaadmin(admin.ModelAdmin):
    list_display = ('id','venta', 'producto', 'cantidad_por_producto', 'preciodelproducto')
    
@admin.register(Proveedor)
class Proveedoradmin(admin.ModelAdmin):
    list_display = ('id','ruc', 'razon_social', 'respresentante', 'email', 'telefono')
    
@admin.register(DetalleProveedor)
class DetalleProveedoradmin(admin.ModelAdmin):
    list_display = ('id','proveedor', 'producto', 'fecha', 'total_a_pagar', 'tipo_comprobante', 'metodo_de_pago', 'numero_comprobante', 'cantidad')
    