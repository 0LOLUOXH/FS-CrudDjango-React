from django.db import models
from .suppliers import Supplier
from .inventory import Product

class PurchaseOrder(models.Model):
    date = models.DateField()
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='purchases')
    invoice_number = models.CharField(max_length=100)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50)

class PurchaseDetail(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='details')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
