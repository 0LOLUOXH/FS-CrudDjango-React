from rest_framework import serializers
from fs.models import Customer, IndividualCustomer, CorporateCustomer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class IndividualCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndividualCustomer
        fields = '__all__'

class CorporateCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CorporateCustomer
        fields = '__all__'
