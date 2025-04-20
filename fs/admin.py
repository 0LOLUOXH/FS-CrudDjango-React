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
    list_display = ('id','identificacion', 'nombre', 'apellido', 'telefono')

@admin.register(ClienteJuridico)
class ClienteJuridicoadmin(admin.ModelAdmin):
    list_display = ('id','cliente', 'razon_social')
    
@admin.register(Empleado)
class Empleadoadmin(admin.ModelAdmin):
    list_display = ('id','nombre', 'apellido', 'telefono', 'cargo')
    
@admin.register(Bodega)
class Bodegaadmin(admin.ModelAdmin):
    list_display = ('id','nombre', 'estado', 'capacidad', 'idempleado')
    
@admin.register(Producto)
class Productoadmin(admin.ModelAdmin):
    list_display = ('id','nombre', 'modelo', 'codigobodega', 'descripcion', 'cantidad', 'fechadeactualizacion')

@admin.register(PrecioProveedorProducto)
class PrecioProveedorProductoadmin(admin.ModelAdmin):
    list_display = ('id','producto', 'proveedor', 'precio', 'ganancia', 'iva', 'fecha_actualizacion')
    
@admin.register(Venta)
class Ventadmin(admin.ModelAdmin):
    list_display = ('id','fecha', 'cliente', 'empleado', 'totalapagar', 'metododepago', 'instalacion', 'direccion')
    
@admin.register(DetalleVenta)
class DetalleVentaadmin(admin.ModelAdmin):
    list_display = ('id','venta', 'producto', 'cantidadporproducto')
    
@admin.register(Proveedor)
class Proveedoradmin(admin.ModelAdmin):
    list_display = ('id','cedula', 'nombre', 'apellido', 'telefono')
    
@admin.register(DetalleProveedor)
class DetalleProveedoradmin(admin.ModelAdmin):
    list_display = ('id','proveedor', 'producto', 'fecha', 'totalapagar', 'tipocomprobante', 'metododepago', 'numerocomprobante', 'cantidad')
    
@admin.register(Promocion)    
class Promocionadmin(admin.ModelAdmin):
    list_display = ('id','nombre', 'descripcion', 'tipo_descuento', 'valor_descuento', 'fecha_inicio', 'fecha_fin', 'activo', 'productos')