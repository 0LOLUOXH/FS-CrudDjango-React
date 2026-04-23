from django.urls import path, include
from rest_framework.documentation import include_docs_urls
from rest_framework import routers
from .api.views import *

router = routers.DefaultRouter()
router.register(r'brand', BrandViewSet)
router.register(r'model', ProductModelViewSet)
router.register(r'customer', CustomerViewSet)
router.register(r'corporate_customer', CorporateCustomerViewSet)
router.register(r'individual_customer', IndividualCustomerViewSet)
router.register(r'warehouse', WarehouseViewSet)
router.register(r'product', ProductViewSet)
router.register(r'kit_component', KitComponentViewSet)
router.register(r'serial_number', SerialNumberViewSet)
router.register(r'inventory_adjustment', InventoryAdjustmentViewSet)
router.register(r'quote', QuoteViewSet)
router.register(r'quote_detail', QuoteDetailViewSet)
router.register(r'sale', SaleViewSet)
router.register(r'sale_detail', SaleDetailViewSet)
router.register(r'sale_return', SaleReturnViewSet)
router.register(r'installation_service', InstallationServiceViewSet)
router.register(r'supplier', SupplierViewSet)
router.register(r'purchase_order', PurchaseOrderViewSet)
router.register(r'purchase_detail', PurchaseDetailViewSet)
router.register(r'user', userViewSet)

urlpatterns = [
    path('apibd/v1/', include(router.urls)),   
    path('apibd/v1/process_sale/', ProcessSaleView.as_view(), name='process_sale'),
    path('docs/', include_docs_urls(title='API BD', description='Documentación de la API BD')),
    path('login/', LoginView.as_view(), name='api_login'),
    path('reset-password/', PasswordResetView.as_view(), name='password_reset'),  
    path('reset-password/<str:token>/', PasswordResetConfirmView.as_view(),),   
    path('backups/create/', CreateBackupView.as_view(), name='create_backup'),
    path('backups/restore/', RestoreBackupView.as_view(), name='restore_backup'),
    path('backups/list/', ListBackupsView.as_view(), name='list_backups'),
    path('backups/download/', DownloadBackupView.as_view(), name='download_backup'),
    path('backups/delete/', DeleteBackupView.as_view(), name='delete_backup'),
    path('dashboard/top-products/', DashboardTopProducts.as_view(), name='dashboard-top-products'),
    path('dashboard/top-purchased/', DashboardTopPurchased.as_view(), name='dashboard-top-purchased'),
    path('dashboard/top-clients/', DashboardTopClients.as_view(), name='dashboard-top-clients'),
    path('dashboard/top-stock/', DashboardTopStock.as_view(), name='dashboard-top-stock'),
    path('dashboard/sales-trend/', DashboardSalesTrend.as_view(), name='dashboard-sales-trend'),
    path('dashboard/purchase-trend/', DashboardPurchaseTrend.as_view(), name='dashboard-purchase-trend'),
]
