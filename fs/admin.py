from django.contrib import admin
from .models import *

# Register your models here.
@admin.register(User)
class useradminn(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'date_joined')
    list_filter = ('date_joined',)
    
@admin.register(marca)
class marcaadmin(admin.ModelAdmin):
    list_display = ('id','nombre')
    
@admin.register(modelo)
class modeloadmin(admin.ModelAdmin):
    list_display = ('id','nombre', 'marca')
    
@admin.register(cliente)
class clienteadmin(admin.ModelAdmin):
    list_display = ('id','cedula', 'nombre', 'apellido', 'telefono')
    
@admin.register(empleado)
class empleadoadmin(admin.ModelAdmin):
    list_display = ('id','nombre', 'apellido', 'telefono', 'cargo')
    
@admin.register(bodega)
class bodegaadmin(admin.ModelAdmin):
    list_display = ('id','nombre', 'estado', 'capacidad', 'idempleado')
    
@admin.register(producto)
class productoadmin(admin.ModelAdmin):
    list_display = ('id','nombre', 'modeloandmarca', 'preciounitario', 'ganancia', 'iva', 'codigobodega', 'descripcion', 'cantidad', 'fechadeactualizacion')
    
@admin.register(venta)
class ventadmin(admin.ModelAdmin):
    list_display = ('id','fecha', 'cliente', 'empleado', 'totalapagar', 'metododepago', 'instalacion', 'direccion')
    
@admin.register(detalleventa)
class detalleventaadmin(admin.ModelAdmin):
    list_display = ('id','venta', 'producto', 'cantidadporproducto')
    
@admin.register(proveedor)
class proveedoradmin(admin.ModelAdmin):
    list_display = ('id','cedula', 'nombre', 'apellido', 'telefono')
    
@admin.register(detalleproveedor)
class detalleproveedoradmin(admin.ModelAdmin):
    list_display = ('id','proveedor', 'producto', 'fecha', 'totalapagar', 'tipocomprobante', 'metododepago', 'numerocomprobante', 'cantidad')