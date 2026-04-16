from .auth_views import LoginView, PasswordResetView, PasswordResetConfirmView, userViewSet
from .crud_views import (
    CustomerViewSet, IndividualCustomerViewSet, CorporateCustomerViewSet,
    SupplierViewSet, BrandViewSet, ProductModelViewSet, WarehouseViewSet,
    ProductViewSet, KitComponentViewSet, SerialNumberViewSet,
    InventoryAdjustmentViewSet, QuoteViewSet, QuoteDetailViewSet,
    SaleViewSet, SaleDetailViewSet, SaleReturnViewSet,
    InstallationServiceViewSet, PurchaseOrderViewSet, PurchaseDetailViewSet
)
from .backup_views import CreateBackupView, RestoreBackupView, ListBackupsView, DownloadBackupView, DeleteBackupView
from .dashboard_views import (
    DashboardBaseView, DashboardTopProducts, DashboardTopPurchased, DashboardTopClients,
    DashboardTopStock, DashboardSalesTrend, DashboardPurchaseTrend
)
