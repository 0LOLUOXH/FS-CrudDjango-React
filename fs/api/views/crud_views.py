from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from decimal import Decimal
from fs.models import *
from fs.api.serializers import *
from fs.api.serializers.sales import ProcessSaleSerializer
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

class ProcessSaleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ProcessSaleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        
        try:
            with transaction.atomic():
                # 1. Verificar stock antes de crear nada
                products_to_update = []
                total_calculated = Decimal('0.0')
                
                for item in data['items']:
                    # Usamos select_for_update() para bloquear la fila y evitar race conditions
                    product = Product.objects.select_for_update().get(id=item['product_id'])
                    
                    if product.stock_quantity < item['quantity']:
                        return Response(
                            {"error": f"Stock insuficiente para el producto {product.name}. Disponible: {product.stock_quantity}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    products_to_update.append({
                        'product': product,
                        'quantity': item['quantity'],
                        'price': item['price']
                    })
                    total_calculated += Decimal(item['price']) * item['quantity']

                # Agregar costo de instalación al total si requiere
                if data.get('requires_installation') and data.get('installation_price'):
                    total_calculated += Decimal(data['installation_price'])

                # 2. Crear Venta (Sale)
                sale = Sale.objects.create(
                    customer_id=data['customer_id'],
                    seller=request.user,  # Garantizado por IsAuthenticated
                    currency=data['currency'],
                    exchange_rate=data['exchange_rate'],
                    discount_amount=data['discount_amount'],
                    total_amount=total_calculated,
                    payment_method=data['payment_method'],
                    status='COMPLETED'
                )

                # 3. Crear Detalles (SaleDetail) y Descontar Stock
                for item_data in products_to_update:
                    product = item_data['product']
                    qty = item_data['quantity']
                    
                    # Crear detalle
                    SaleDetail.objects.create(
                        sale=sale,
                        product=product,
                        quantity=qty,
                        unit_price=item_data['price']
                    )
                    
                    # Descontar stock
                    product.stock_quantity -= qty
                    product.save(update_fields=['stock_quantity'])

                # 4. Crear Servicio de Instalación si es necesario
                if data.get('requires_installation'):
                    InstallationService.objects.create(
                        sale=sale,
                        scheduled_date=data['scheduled_date'],
                        address=data['installation_address'],
                        cost=data.get('installation_price') or 0,  # Evita IntegrityError por null
                        is_completed=False
                    )

            return Response({
                "message": "Venta procesada exitosamente", 
                "sale_id": sale.id
            }, status=status.HTTP_201_CREATED)

        except Product.DoesNotExist:
            return Response({"error": "Un producto enviado no existe en la base de datos"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
