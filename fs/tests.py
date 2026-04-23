from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

from fs.models import (
    User,
    Customer,
    Product,
    Brand,
    ProductModel,
    Warehouse,
    Sale,
    SaleDetail,
)


class ProcessSaleTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="password123"
        )
        self.client.force_authenticate(user=self.user)

        self.customer = Customer.objects.create(
            customer_type="I",
            phone="12345678"
        )

        self.brand = Brand.objects.create(name="Test Brand")
        self.model = ProductModel.objects.create(
            name="Test Model",
            brand=self.brand
        )
        self.warehouse = Warehouse.objects.create(
            name="Test Warehouse",
            capacity=100
        )

        self.product1 = Product.objects.create(
            name="Panel Solar 500W",
            description="Panel de prueba",
            stock_quantity=10,
            minimum_stock=2,
            base_price_usd=150.00,
            warranty_months=12,
            is_kit=False,
            product_model=self.model,
            warehouse=self.warehouse
        )

        self.product2 = Product.objects.create(
            name="Inversor 5KW",
            description="Inversor de prueba",
            stock_quantity=5,
            minimum_stock=1,
            base_price_usd=500.00,
            warranty_months=24,
            is_kit=False,
            product_model=self.model,
            warehouse=self.warehouse
        )

        self.url = reverse("process_sale")

        self.valid_payload = {
            "customer_id": self.customer.id,
            "currency": "USD",
            "exchange_rate": "1.0000",
            "payment_method": "Efectivo",
            "discount_amount": "0.00",
            "items": [
                {
                    "product_id": self.product1.id,
                    "quantity": 2,
                    "price": "150.00"
                },
                {
                    "product_id": self.product2.id,
                    "quantity": 1,
                    "price": "500.00"
                }
            ],
            "requires_installation": False
        }

    def test_create_sale_successfully(self):
        """Requisito 1: Crear venta correctamente"""
        response = self.client.post(self.url, self.valid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Sale.objects.count(), 1)
        self.assertEqual(SaleDetail.objects.count(), 2)

        sale = Sale.objects.first()
        self.assertEqual(float(sale.total_amount), 800.00)

    def test_stock_reduced_correctly(self):
        """Requisito 2: El stock se reduce correctamente tras la venta"""
        response = self.client.post(self.url, self.valid_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.product1.refresh_from_db()
        self.product2.refresh_from_db()

        self.assertEqual(self.product1.stock_quantity, 8)
        self.assertEqual(self.product2.stock_quantity, 4)

    def test_prevent_sale_without_stock(self):
        """Requisito 3: No permite vender si no hay stock suficiente"""
        payload = {
            **self.valid_payload,
            "items": [
                {
                    "product_id": self.product1.id,
                    "quantity": 15,
                    "price": "150.00"
                },
                {
                    "product_id": self.product2.id,
                    "quantity": 1,
                    "price": "500.00"
                }
            ]
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Sale.objects.count(), 0)

        self.product1.refresh_from_db()
        self.product2.refresh_from_db()

        self.assertEqual(self.product1.stock_quantity, 10)
        self.assertEqual(self.product2.stock_quantity, 5)

    def test_rollback_on_failure(self):
        """Requisito 4: Rollback completo si ocurre un error durante la operación"""
        payload = {
            **self.valid_payload,
            "items": [
                {
                    "product_id": 9999,
                    "quantity": 2,
                    "price": "150.00"
                },
                {
                    "product_id": self.product2.id,
                    "quantity": 1,
                    "price": "500.00"
                }
            ]
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertIn(
            response.status_code,
            [status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND]
        )

        self.assertEqual(Sale.objects.count(), 0)
        self.assertEqual(SaleDetail.objects.count(), 0)

        self.product1.refresh_from_db()
        self.product2.refresh_from_db()

        self.assertEqual(self.product1.stock_quantity, 10)
        self.assertEqual(self.product2.stock_quantity, 5)