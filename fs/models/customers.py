from django.db import models

CUSTOMER_TYPES = [('I', 'Individual'), ('C', 'Corporate')]

class Customer(models.Model):
    customer_type = models.CharField(max_length=1, choices=CUSTOMER_TYPES)
    phone = models.CharField(max_length=20)

class IndividualCustomer(models.Model):
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, primary_key=True, related_name='individual_profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    identity_card = models.CharField(max_length=50) # Cédula
    email = models.EmailField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

class CorporateCustomer(models.Model):
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, primary_key=True, related_name='corporate_profile')
    company_name = models.CharField(max_length=200) # Razón social
    tax_id = models.CharField(max_length=50) # RUC
    representative = models.CharField(max_length=200, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
