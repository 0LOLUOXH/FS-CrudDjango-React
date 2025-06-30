from django.urls import path, include
from rest_framework.documentation import include_docs_urls
from rest_framework import routers
from .views import *
from .views import LoginView, PasswordResetView, PasswordResetConfirmView

router = routers.DefaultRouter()
router.register(r'marca', marcaViewSet)
router.register(r'modelo', modeloViewSet)
router.register(r'cliente', clienteViewSet)
router.register(r'clientejuridico', clientejuridicoViewSet)
router.register(r'empleado', empleadoViewSet)
router.register(r'bodega', bodegaViewSet)
router.register(r'producto', productoViewSet)
router.register(r'precioproveedorproducto', precioproveedorproductoViewSet)
router.register(r'venta', ventaViewSet)
router.register(r'detalleventa', detalleventaViewSet)
router.register(r'proveedor', proveedorViewSet)
router.register(r'detalleproveedor', detalleproveedorViewSet)   
router.register(r'user', userViewSet)
router.register(r'clientenatural', clienteNaturalViewSet)

urlpatterns = [
    path('apibd/v1/', include(router.urls)),   
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
