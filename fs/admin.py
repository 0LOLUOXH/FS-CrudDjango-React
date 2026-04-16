from django.contrib import admin
from .models import *

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'date_joined')
    list_filter = ('date_joined',)

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'action', 'table_name', 'timestamp')

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_type', 'phone')

@admin.register(IndividualCustomer)
class IndividualCustomerAdmin(admin.ModelAdmin):
    list_display = ('customer', 'first_name', 'last_name', 'identity_card', 'email', 'is_active')

@admin.register(CorporateCustomer)
class CorporateCustomerAdmin(admin.ModelAdmin):
    list_display = ('customer', 'company_name', 'tax_id', 'representative', 'email', 'is_active')

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('id', 'tax_id', 'company_name', 'email', 'phone', 'is_active')

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

@admin.register(ProductModel)
class ProductModelAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'brand')

@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_active', 'capacity', 'manager')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'product_model', 'base_price_usd', 'stock_quantity')

@admin.register(KitComponent)
class KitComponentAdmin(admin.ModelAdmin):
    list_display = ('id', 'parent_kit', 'component_product', 'quantity_required')

@admin.register(SerialNumber)
class SerialNumberAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'serial_code', 'is_sold')

@admin.register(InventoryAdjustment)
class InventoryAdjustmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'adjustment_type', 'quantity', 'adjusted_by', 'date')

@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'date', 'customer', 'created_by', 'total_amount')

@admin.register(QuoteDetail)
class QuoteDetailAdmin(admin.ModelAdmin):
    list_display = ('id', 'quote', 'product', 'quantity', 'unit_price')

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'date', 'customer', 'seller', 'total_amount', 'status')

@admin.register(SaleDetail)
class SaleDetailAdmin(admin.ModelAdmin):
    list_display = ('id', 'sale', 'product', 'quantity', 'unit_price')

@admin.register(SaleReturn)
class SaleReturnAdmin(admin.ModelAdmin):
    list_display = ('id', 'sale', 'processed_by', 'return_date', 'stock_restored')

@admin.register(InstallationService)
class InstallationServiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'sale', 'scheduled_date', 'cost', 'is_completed')

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'date', 'supplier', 'total_amount')

@admin.register(PurchaseDetail)
class PurchaseDetailAdmin(admin.ModelAdmin):
    list_display = ('id', 'purchase_order', 'product', 'quantity', 'unit_price')