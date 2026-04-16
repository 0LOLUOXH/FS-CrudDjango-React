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
