from django.db import models
from .user import User
from .customers import Customer
from .inventory import Product, SerialNumber
from .quotes import Quote

class Sale(models.Model):
    SALE_STATUS = [('COMPLETED', 'Completed'), ('CANCELED', 'Canceled'), ('RETURNED', 'Returned')]
    
    date = models.DateTimeField(auto_now_add=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='sales')
    seller = models.ForeignKey(User, on_delete=models.PROTECT, related_name='sales')
    quote_reference = models.ForeignKey(Quote, on_delete=models.SET_NULL, null=True, blank=True)
    
    currency = models.CharField(max_length=3, choices=[('USD', 'Dollars'), ('NIO', 'Cordobas')])
    exchange_rate = models.DecimalField(max_digits=10, decimal_places=4, default=1.0000) 
    
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=SALE_STATUS, default='COMPLETED')

class SaleDetail(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='details')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    serial_number = models.ForeignKey(SerialNumber, on_delete=models.SET_NULL, null=True, blank=True) 
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)

class SaleReturn(models.Model):
    sale = models.OneToOneField(Sale, on_delete=models.CASCADE)
    processed_by = models.ForeignKey(User, on_delete=models.PROTECT)
    return_date = models.DateTimeField(auto_now_add=True)
    reason = models.TextField()
    stock_restored = models.BooleanField(default=True)

class InstallationService(models.Model):
    sale = models.OneToOneField(Sale, on_delete=models.CASCADE, related_name='installation')
    scheduled_date = models.DateField()
    address = models.CharField(max_length=300)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_completed = models.BooleanField(default=False)
    assigned_technician = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
