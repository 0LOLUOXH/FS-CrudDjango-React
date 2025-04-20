from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now

# ============================
# Usuario personalizado
# ============================
class User(AbstractUser):
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name="custom_user_set",
        related_query_name="custom_user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name="custom_user_set",
        related_query_name="custom_user",
    )

    class Meta:
        db_table = 'custom_user'

# ============================
# Marcas y modelos
# ============================
class Marca(models.Model):
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre

class Modelo(models.Model):
    nombre = models.CharField(max_length=50)
    marca = models.ForeignKey(Marca, on_delete=models.CASCADE, related_name='modelos')

    def __str__(self):
        return f"{self.marca.nombre} - {self.nombre}"

# ============================
# Clientes
# ============================
TIPO_CLIENTE = [
    ("natural", "Natural"),
    ("juridico", "Jurídico"),
]

class Cliente(models.Model):
    tipo = models.CharField(max_length=10, choices=TIPO_CLIENTE, default="natural")
    identificacion = models.CharField(max_length=50)
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50, blank=True, null=True)
    telefono = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"

class ClienteJuridico(models.Model):
    cliente = models.OneToOneField(Cliente, on_delete=models.CASCADE)
    razon_social = models.CharField(max_length=100)

# ============================
# Empleados
# ============================
class Empleado(models.Model):
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    telefono = models.CharField(max_length=50)
    cargo = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre

# ============================
# Bodegas
# ============================
class Bodega(models.Model):
    nombre = models.CharField(max_length=50)
    estado = models.BooleanField()
    capacidad = models.IntegerField(default=0)
    idempleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return self.nombre

# ============================
# Productos
# ============================
class Producto(models.Model):
    nombre = models.CharField(max_length=50)
    modelo = models.ForeignKey(Modelo, on_delete=models.CASCADE, null=True)
    codigobodega = models.ForeignKey(Bodega, on_delete=models.CASCADE)
    descripcion = models.CharField(max_length=200)
    cantidad = models.IntegerField(default=0)
    fechadeactualizacion = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return self.nombre

# ============================
# Relación producto-proveedor con precios
# ============================
class PrecioProveedorProducto(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    proveedor = models.ForeignKey('Proveedor', on_delete=models.CASCADE)
    precio = models.FloatField()
    ganancia = models.FloatField()
    iva = models.FloatField()
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.producto.nombre} - {self.proveedor.nombre} - {self.precio}"

# ============================
# Ventas
# ============================
class Venta(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    empleado = models.ForeignKey(User, on_delete=models.CASCADE)
    totalapagar = models.FloatField()
    metododepago = models.CharField(max_length=50)
    instalacion = models.BooleanField(default=False)
    direccion = models.CharField(max_length=300, default="")
    precioinstalacion = models.FloatField(default=0)

    def __str__(self):
        return f"Venta {self.id} - Cliente: {self.cliente.nombre}"

class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidadporproducto = models.IntegerField(default=1)

    def __str__(self):
        return f"Detalle Venta {self.venta.id} - Producto: {self.producto.nombre} - Cantidad: {self.cantidadporproducto}"

# ============================
# Proveedores
# ============================
class Proveedor(models.Model):
    cedula = models.CharField(max_length=50)
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    telefono = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre

class DetalleProveedor(models.Model):
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    tipocomprobante = models.CharField(max_length=50, default="Factura")
    metododepago = models.CharField(max_length=50, default="Contado")
    numerocomprobante = models.CharField(max_length=50, default="0000")
    fecha = models.DateField(default=now)
    totalapagar = models.FloatField(default=0)
    cantidad = models.IntegerField(default=1)

    def __str__(self):
        return self.producto.nombre
