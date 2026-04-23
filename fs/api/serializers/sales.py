from rest_framework import serializers
from fs.models import Sale, SaleDetail, SaleReturn, InstallationService

class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'

class SaleDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleDetail
        fields = '__all__'

class SaleReturnSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleReturn
        fields = '__all__'

class InstallationServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstallationService
        fields = '__all__'

class ProcessSaleItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(max_digits=12, decimal_places=2)

class ProcessSaleSerializer(serializers.Serializer):
    customer_id = serializers.IntegerField()
    currency = serializers.CharField(max_length=3, default='USD')
    exchange_rate = serializers.DecimalField(max_digits=10, decimal_places=4, default=1.0)
    payment_method = serializers.CharField(max_length=50)
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    items = ProcessSaleItemSerializer(many=True)
    
    # Instalación opcional
    requires_installation = serializers.BooleanField(default=False)
    installation_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    installation_address = serializers.CharField(max_length=300, required=False, allow_blank=True)
    scheduled_date = serializers.DateField(required=False, allow_null=True)
