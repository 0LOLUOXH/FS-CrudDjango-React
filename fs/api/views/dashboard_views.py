from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, F, Case, When, Value, CharField
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth, TruncYear
from django.utils import timezone
from datetime import timedelta
from fs.models import SaleDetail, PurchaseDetail, Sale, Product, PurchaseOrder

class DashboardBaseView(APIView):
    def handle_exception(self, exc):
        error_data = {
            'error': str(exc),
            'success': False,
            'message': 'Ocurrió un error al procesar la solicitud'
        }
        return Response(error_data, status=500)

class DashboardTopProducts(DashboardBaseView):
    def get(self, request):
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            queryset = SaleDetail.objects.select_related(
                'sale', 'product'
            ).all()
            
            if start_date and end_date:
                queryset = queryset.filter(
                    sale__date__range=[start_date, end_date]
                )
            
            top_products = queryset.values(
                'product__name'
            ).annotate(
                total_sold=Sum('quantity')
            ).order_by('-total_sold')[:10]
            
            return Response({
                'data': list(top_products),
                'success': True,
                'message': 'Datos obtenidos correctamente'
            })
        
        except Exception as e:
            return self.handle_exception(e)

class DashboardTopPurchased(DashboardBaseView):
    def get(self, request):
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            queryset = PurchaseDetail.objects.select_related(
                'product', 'purchase_order'
            ).all()
            
            if start_date and end_date:
                queryset = queryset.filter(
                    purchase_order__date__range=[start_date, end_date]
                )
            
            top_purchased = queryset.values(
                'product__name'
            ).annotate(
                total_purchased=Sum('quantity')
            ).order_by('-total_purchased')[:10]
            
            return Response({
                'data': list(top_purchased),
                'success': True,
                'message': 'Datos obtenidos correctamente'
            })
            
        except Exception as e:
            return self.handle_exception(e)

class DashboardTopClients(DashboardBaseView):
    def get(self, request):
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            queryset = Sale.objects.select_related(
                'customer'
            ).all()
            
            if start_date and end_date:
                queryset = queryset.filter(
                    date__range=[start_date, end_date]
                )
            
            top_clients = queryset.values(
                'customer_id'
            ).annotate(
                total_spent=Sum('total_amount'),
                customer_name=Case(
                    When(customer__customer_type='I', 
                         then=F('customer__individual_profile__first_name')),
                    When(customer__customer_type='C', 
                         then=F('customer__corporate_profile__company_name')),
                    default=Value('Cliente desconocido'),
                    output_field=CharField()
                )
            ).order_by('-total_spent')[:10]
            
            return Response({
                'data': list(top_clients),
                'success': True,
                'message': 'Datos obtenidos correctamente'
            })
            
        except Exception as e:
            return self.handle_exception(e)

class DashboardTopStock(DashboardBaseView):
    def get(self, request):
        try:
            top_stock = Product.objects.order_by('-stock_quantity').values(
                'name', 'stock_quantity'
            )[:10]
            
            return Response({
                'data': list(top_stock),
                'success': True,
                'message': 'Datos obtenidos correctamente'
            })
            
        except Exception as e:
            return self.handle_exception(e)

class DashboardSalesTrend(DashboardBaseView):
    def get(self, request):
        try:
            start_date = request.query_params.get('start_date', 
                (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
            end_date = request.query_params.get('end_date', 
                timezone.now().strftime('%Y-%m-%d'))
            time_range = request.query_params.get('time_range', 'day')
            
            queryset = Sale.objects.filter(
                date__range=[start_date, end_date]
            )
            
            if time_range == 'day':
                trend = queryset.annotate(
                    period=TruncDay('date')
                ).values('period').annotate(
                    total=Sum('total_amount')
                ).order_by('period')
            elif time_range == 'week':
                trend = queryset.annotate(
                    period=TruncWeek('date')
                ).values('period').annotate(
                    total=Sum('total_amount')
                ).order_by('period')
            elif time_range == 'month':
                trend = queryset.annotate(
                    period=TruncMonth('date')
                ).values('period').annotate(
                    total=Sum('total_amount')
                ).order_by('period')
            else:
                trend = queryset.annotate(
                    period=TruncYear('date')
                ).values('period').annotate(
                    total=Sum('total_amount')
                ).order_by('period')
            
            return Response({
                'data': list(trend),
                'success': True,
                'message': 'Datos obtenidos correctamente'
            })
            
        except Exception as e:
            return self.handle_exception(e)

class DashboardPurchaseTrend(DashboardBaseView):
    def get(self, request):
        try:
            start_date = request.query_params.get('start_date', 
                (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
            end_date = request.query_params.get('end_date', 
                timezone.now().strftime('%Y-%m-%d'))
            time_range = request.query_params.get('time_range', 'day')
            
            queryset = PurchaseOrder.objects.filter(
                date__range=[start_date, end_date]
            )
            
            if time_range == 'day':
                trend = queryset.annotate(
                    period=TruncDay('date')
                ).values('period').annotate(
                    total=Sum('total_amount')
                ).order_by('period')
            elif time_range == 'week':
                trend = queryset.annotate(
                    period=TruncWeek('date')
                ).values('period').annotate(
                    total=Sum('total_amount')
                ).order_by('period')
            elif time_range == 'month':
                trend = queryset.annotate(
                    period=TruncMonth('date')
                ).values('period').annotate(
                    total=Sum('total_amount')
                ).order_by('period')
            else:
                trend = queryset.annotate(
                    period=TruncYear('date')
                ).values('period').annotate(
                    total=Sum('total_amount')
                ).order_by('period')
            
            return Response({
                'data': list(trend),
                'success': True,
                'message': 'Datos obtenidos correctamente'
            })
            
        except Exception as e:
            return self.handle_exception(e)
