from django.urls import path, include
from rest_framework.documentation import include_docs_urls
from rest_framework import routers
from .views import *

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
router.register(r'promocion', promocionViewSet)

urlpatterns = [
    path('apibd/v1/', include(router.urls)),   
    path('docs/', include_docs_urls(title='API BD', description='Documentación de la API BD')),     
]
