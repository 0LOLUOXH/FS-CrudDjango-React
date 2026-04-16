from django.db import models
from .user import User

class Brand(models.Model):
    name = models.CharField(max_length=100)

class ProductModel(models.Model):
    name = models.CharField(max_length=100)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='models')

class Warehouse(models.Model):
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    capacity = models.IntegerField()
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_warehouses')

class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    stock_quantity = models.IntegerField(default=0)
    minimum_stock = models.IntegerField(default=5) # RF04 - Alertas de stock mínimo
    base_price_usd = models.DecimalField(max_digits=10, decimal_places=2) # RF12 - Base en dólares
    warranty_months = models.IntegerField(default=0) # RF03 - Garantía
    is_kit = models.BooleanField(default=False) # RF05 - Kits Solares
    product_model = models.ForeignKey(ProductModel, on_delete=models.CASCADE, related_name='products')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='products')

class KitComponent(models.Model):
    parent_kit = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='components', limit_choices_to={'is_kit': True})
    component_product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity_required = models.IntegerField(default=1)

class SerialNumber(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='serial_numbers')
    serial_code = models.CharField(max_length=100, unique=True)
    is_sold = models.BooleanField(default=False)

class InventoryAdjustment(models.Model):
    ADJUSTMENT_TYPES = [('IN', 'Entry'), ('OUT', 'Exit'), ('DMG', 'Damage'), ('LOSS', 'Loss')]
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    adjustment_type = models.CharField(max_length=10, choices=ADJUSTMENT_TYPES)
    quantity = models.IntegerField()
    reason = models.TextField()
    adjusted_by = models.ForeignKey(User, on_delete=models.PROTECT)
    date = models.DateTimeField(auto_now_add=True)
