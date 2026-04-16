from django.db import models
from .user import User
from .customers import Customer
from .inventory import Product

class Quote(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    currency = models.CharField(max_length=3, default='USD') 
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_converted_to_sale = models.BooleanField(default=False)

class QuoteDetail(models.Model):
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name='details')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
