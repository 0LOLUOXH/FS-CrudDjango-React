from rest_framework import viewsets
from fs.models import *
from fs.api.serializers import *
from .auth_views import userViewSet

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class IndividualCustomerViewSet(viewsets.ModelViewSet):
    queryset = IndividualCustomer.objects.all()
    serializer_class = IndividualCustomerSerializer

class CorporateCustomerViewSet(viewsets.ModelViewSet):
    queryset = CorporateCustomer.objects.all()
    serializer_class = CorporateCustomerSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

class ProductModelViewSet(viewsets.ModelViewSet):
    queryset = ProductModel.objects.all()
    serializer_class = ProductModelSerializer

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class KitComponentViewSet(viewsets.ModelViewSet):
    queryset = KitComponent.objects.all()
    serializer_class = KitComponentSerializer

class SerialNumberViewSet(viewsets.ModelViewSet):
    queryset = SerialNumber.objects.all()
    serializer_class = SerialNumberSerializer

class InventoryAdjustmentViewSet(viewsets.ModelViewSet):
    queryset = InventoryAdjustment.objects.all()
    serializer_class = InventoryAdjustmentSerializer

class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer

class QuoteDetailViewSet(viewsets.ModelViewSet):
    queryset = QuoteDetail.objects.all()
    serializer_class = QuoteDetailSerializer

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer

class SaleDetailViewSet(viewsets.ModelViewSet):
    queryset = SaleDetail.objects.all()
    serializer_class = SaleDetailSerializer

class SaleReturnViewSet(viewsets.ModelViewSet):
    queryset = SaleReturn.objects.all()
    serializer_class = SaleReturnSerializer

class InstallationServiceViewSet(viewsets.ModelViewSet):
    queryset = InstallationService.objects.all()
    serializer_class = InstallationServiceSerializer

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer

class PurchaseDetailViewSet(viewsets.ModelViewSet):
    queryset = PurchaseDetail.objects.all()
    serializer_class = PurchaseDetailSerializer
