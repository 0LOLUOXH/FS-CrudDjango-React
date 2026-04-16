from django.db import models

class Supplier(models.Model):
    tax_id = models.CharField(max_length=50) # RUC
    company_name = models.CharField(max_length=100)
    representative = models.CharField(max_length=200, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
