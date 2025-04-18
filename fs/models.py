from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now


class User(AbstractUser):
    # Cambia los related_name para evitar conflictos
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name="custom_user_set",  # Nombre único
        related_query_name="custom_user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="custom_user_set",  # Nombre único
        related_query_name="custom_user",
    )
    
    class Meta:
        # Esto ayuda a evitar conflictos con la tabla auth_user
        db_table = 'custom_user'


class marca(models.Model):
    nombre = models.CharField(max_length=50)
    
    def __str__(self):
        return self.nombre

class modelo(models.Model):
    nombre = models.CharField(max_length=50)
    marca = models.ForeignKey(marca, on_delete=models.CASCADE, related_name='modelos')
    
    def __str__(self):
        return f"{self.marca.nombre} - {self.nombre}"
    
class cliente(models.Model):
    cedula = models.CharField(max_length=50)
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    telefono = models.CharField(max_length=50)
    
    def __str__(self):
        return self.nombre

class empleado(models.Model):
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    telefono = models.CharField(max_length=50)
    cargo = models.CharField(max_length=50)
    
    def __str__(self):
        return self.nombre

class bodega(models.Model):
    nombre = models.CharField(max_length=50)
    estado = models.BooleanField()
    capacidad = models.IntegerField(default=0) 
    idempleado = models.ForeignKey(empleado, on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return self.nombre

class producto(models.Model):
    nombre = models.CharField(max_length=50)
    modeloandmarca = models.ForeignKey(modelo, on_delete=models.CASCADE, null=True)
    preciounitario = models.FloatField()
    ganancia = models.FloatField()
    iva = models.FloatField()
    codigobodega = models.ForeignKey(bodega, on_delete=models.CASCADE)
    descripcion = models.CharField(max_length=200)
    cantidad = models.IntegerField(default=0)
    fechadeactualizacion = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    
    def __str__(self):
        return self.nombre
    
class venta(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    cliente = models.ForeignKey(cliente, on_delete=models.CASCADE)
    empleado = models.ForeignKey(User, on_delete=models.CASCADE)
    totalapagar = models.FloatField()
    metododepago = models.CharField(max_length=50)
    instalacion = models.BooleanField(default=False)
    direccion = models.CharField(max_length=300, default="")
    precioinstalacion = models.FloatField(default=0)
    
    def __str__(self):
        return f"Venta {self.id} - Cliente: {self.cliente.nombre}"
    
    
class detalleventa(models.Model):
    venta = models.ForeignKey(venta, on_delete=models.CASCADE)
    producto = models.ForeignKey(producto, on_delete=models.CASCADE)
    cantidadporproducto = models.IntegerField(default=1)
    
    def __str__(self):
        return f"Detalle Venta {self.venta.id} - Producto: {self.producto.nombre} - Cantidad: {self.cantidadporproducto}"

class proveedor(models.Model):
    cedula = models.CharField(max_length=50)
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    telefono = models.CharField(max_length=50)
    
    def __str__(self):
        return self.nombre
    
class detalleproveedor(models.Model):
    proveedor = models.ForeignKey(proveedor, on_delete=models.CASCADE)
    producto = models.ForeignKey(producto, on_delete=models.CASCADE)
    tipocomprobante = models.CharField(max_length=50, default="Factura")
    metododepago = models.CharField(max_length=50, default="Contado")
    numerocomprobante = models.CharField(max_length=50, default="0000")
    fecha = models.DateField(default=now)
    totalapagar = models.FloatField(default=0)
    cantidad = models.IntegerField(default=1)
    
    def __str__(self):
        return self.producto.nombre