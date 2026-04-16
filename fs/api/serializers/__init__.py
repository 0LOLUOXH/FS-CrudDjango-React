from .user_serializer import userSerializer, LoginSerializer
from .customers import CustomerSerializer, IndividualCustomerSerializer, CorporateCustomerSerializer
from .suppliers import SupplierSerializer
from .inventory import BrandSerializer, ProductModelSerializer, WarehouseSerializer, ProductSerializer, KitComponentSerializer, SerialNumberSerializer, InventoryAdjustmentSerializer
from .quotes import QuoteSerializer, QuoteDetailSerializer
from .sales import SaleSerializer, SaleDetailSerializer, SaleReturnSerializer, InstallationServiceSerializer
from .purchases import PurchaseOrderSerializer, PurchaseDetailSerializer
