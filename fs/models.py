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
# Marcas y Modelos
# ============================
class Marca(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class Modelo(models.Model):
    nombre = models.CharField(max_length=100)
    marca = models.ForeignKey(Marca, on_delete=models.CASCADE, related_name='modelos')

    def __str__(self):
        return f"{self.marca.nombre} - {self.nombre}"


# ============================
# Empleados y Bodegas
# ============================
class Empleado(models.Model):
    nombre   = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20)
    cargo    = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

class Bodega(models.Model):
    nombre    = models.CharField(max_length=100)
    estado    = models.BooleanField()
    capacidad = models.IntegerField()
    empleado  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bodegas', default=None)

    def __str__(self):
        return self.nombre


# ============================
# Clientes
# ============================
TIPO_CLIENTE = [
    ('N', 'Natural'),
    ('J', 'Jurídico'),
]

class Cliente(models.Model):
    tipo     = models.CharField(max_length=1, choices=TIPO_CLIENTE)
    telefono = models.CharField(max_length=20)

    def __str__(self):
        return f"Cliente {self.id} ({self.get_tipo_display()})"

class ClienteNatural(models.Model):
    cliente  = models.OneToOneField(Cliente, on_delete=models.CASCADE, primary_key=True, related_name='natural')
    nombre   = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.CharField(max_length=200, blank=True, null=True)
    cedula   = models.CharField(max_length=50)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    estado  = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

class ClienteJuridico(models.Model):
    cliente      = models.OneToOneField(Cliente, on_delete=models.CASCADE, primary_key=True, related_name='juridico')
    razon_social = models.CharField(max_length=200)
    representante = models.CharField(max_length=200, blank=True, null=True)
    email = models.CharField(max_length=200, blank=True, null=True)
    ruc          = models.CharField(max_length=50, blank=True)
    telefono     = models.CharField(max_length=50, blank=True)
    estado  = models.BooleanField(default=False)

    def __str__(self):
        return self.razon_social


# ============================
# Proveedores
# ============================
class Proveedor(models.Model):
    ruc   = models.CharField(max_length=50)
    razon_social   = models.CharField(max_length=100)
    respresentante = models.CharField(max_length=200, blank=True, null=True)
    email = models.CharField(max_length=200, blank=True, null=True)
    telefono = models.CharField(max_length=20)
    estado  = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.nombre} {self.apellido}"


# ============================
# Productos y Stock
# ============================
class Producto(models.Model):
    nombre     = models.CharField(max_length=100)
    descripcion= models.TextField()
    cantidad   = models.IntegerField()
    precio_venta= models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    modelo     = models.ForeignKey(Modelo, on_delete=models.CASCADE, related_name='productos')
    codigobodega     = models.ForeignKey(Bodega, on_delete=models.CASCADE, related_name='productos')

    def __str__(self):
        return self.nombre

class PrecioProveedorProducto(models.Model):
    numero_comprobante = models.CharField(max_length=100, default="NO HAY COMPROBANTE", null=True)
    precio    = models.DecimalField(max_digits=10, decimal_places=2)
    iva       = models.DecimalField(max_digits=5,  decimal_places=2)
    producto  = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='precios_proveedor')
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE, related_name='precios_producto')

    def __str__(self):
        return f"{self.producto.nombre} - {self.proveedor.nombre} @ {self.precio}"

# ============================
# Ventas
# ============================
class Venta(models.Model):
    fecha              = models.DateTimeField(auto_now_add=True)
    total_a_pagar      = models.DecimalField(default=None, max_digits=12, decimal_places=2)
    metodo_de_pago     = models.CharField(max_length=50)
    instalacion        = models.BooleanField(default=False, null=True, blank=True)
    direccion          = models.CharField(max_length=300, default=None, null=True, blank=True)
    precio_instalacion = models.DecimalField(default=None, max_digits=15, decimal_places=2, null=True, blank=True)
    cliente            = models.ForeignKey(Cliente,  on_delete=models.CASCADE, related_name='ventas')
    empleado           = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ventas')

    def __str__(self):
        return f"Venta {self.id}"

class DetalleVenta(models.Model):
    venta                = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')
    producto             = models.ForeignKey(Producto, on_delete=models.CASCADE)
    preciodelproducto    = models.DecimalField(default=None, max_digits=12, decimal_places=2)
    cantidad_por_producto= models.IntegerField(default=1)

    def __str__(self):
        return f"Detalle {self.venta.id} - {self.producto.nombre}"


# ============================
# Detalles de Compras a Proveedor
# ============================
class DetalleProveedor(models.Model):
    tipo_comprobante  = models.CharField(max_length=50, default=None)
    metodo_de_pago    = models.CharField(max_length=50, default=None)
    numero_comprobante= models.CharField(max_length=100, default=None)
    fecha             = models.DateField()
    total_a_pagar     = models.DecimalField(max_digits=12, decimal_places=2, default=None)
    cantidad          = models.IntegerField()
    proveedor         = models.ForeignKey(Proveedor, on_delete=models.CASCADE, related_name='compras')
    producto          = models.ForeignKey(Producto,  on_delete=models.CASCADE, related_name='compras')

    def __str__(self):
        return f"Compra {self.id} - {self.proveedor.nombre}"
    
    

     
