from rest_framework import serializers
from fs.models import Brand, ProductModel, Warehouse, Product, KitComponent, SerialNumber, InventoryAdjustment

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'

class ProductModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductModel
        fields = '__all__'

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class KitComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KitComponent
        fields = '__all__'

class SerialNumberSerializer(serializers.ModelSerializer):
    class Meta:
        model = SerialNumber
        fields = '__all__'

class InventoryAdjustmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryAdjustment
        fields = '__all__'
