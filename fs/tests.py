from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from fs.models import Customer, Supplier, Product, Brand, ProductModel, Warehouse, Sale, SaleDetail
from decimal import Decimal
import threading
from django.test import TransactionTestCase
from django.db import connections

User = get_user_model()

class ProcessSaleCalculationTest(TestCase):
    def setUp(self):
        # 1. Crear un usuario para autenticación
        self.user = User.objects.create_user(username='vendedor_test', password='password123')
        self.token = Token.objects.create(user=self.user)
        
        # 2. Configurar el cliente API con el token
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        # 3. Crear datos mínimos para la venta
        self.customer = Customer.objects.create(customer_type='I', phone='88888888')
        
        # Crear Marca, Modelo, Bodega y Producto
        self.brand = Brand.objects.create(name='MarcaTest')
        self.model = ProductModel.objects.create(name='ModeloTest', brand=self.brand)
        self.warehouse = Warehouse.objects.create(name='BodegaTest', capacity=100, manager=self.user)
        
        self.product1 = Product.objects.create(
            name='Panel Solar', description='Panel 100W', stock_quantity=10,
            base_price_usd=Decimal('100.00'), product_model=self.model, warehouse=self.warehouse
        )
        self.product2 = Product.objects.create(
            name='Batería', description='Batería 12V', stock_quantity=5,
            base_price_usd=Decimal('50.00'), product_model=self.model, warehouse=self.warehouse
        )

    def test_process_sale_total_calculation(self):
        """CP-UNI-01: Verifica que el total sea Items + Instalación"""
        url = '/fs/apibd/v1/process_sale/'  # Asegúrate de que esta sea la URL correcta
        
        payload = {
            "customer_id": self.customer.id,
            "currency": "USD",
            "exchange_rate": "1.0000",
            "payment_method": "Efectivo",
            "discount_amount": "0.00",
            "items": [
                {"product_id": self.product1.id, "quantity": 2, "price": "100.00"}, # 200.00
                {"product_id": self.product2.id, "quantity": 1, "price": "50.00"}   # 50.00
            ],
            "requires_installation": True,
            "installation_price": "50.00", # Instalación
            "installation_address": "Calle Falsa 123",
            "scheduled_date": "2026-10-15"
        }

        response = self.client.post(url, payload, format='json')
        
        # Verificaciones
        self.assertEqual(response.status_code, 201) # Creado exitosamente
        
        # El total esperado es: (2*100) + (1*50) + 50 = 300.00
        from fs.models import Sale
        sale = Sale.objects.last()
        
        self.assertEqual(sale.total_amount, Decimal('300.00'))
        print("\n✅ CP-UNI-01: El cálculo del total fue correcto ($300.00)")

    def test_process_sale_insufficient_stock(self):
        """Prueba extra: Verifica que no se venda si no hay stock"""
        url = '/fs/apibd/v1/process_sale/'
        
        payload = {
            "customer_id": self.customer.id,
            "currency": "USD",
            "exchange_rate": "1.0000",
            "payment_method": "Efectivo",
            "discount_amount": "0.00",
            "items": [
                {"product_id": self.product1.id, "quantity": 100, "price": "100.00"}, # Solo hay 10
            ],
            "requires_installation": False
        }

        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, 400) # Bad Request
        self.assertIn("Stock insuficiente", response.data['error'])
        print("\n✅ Prueba extra: Bloqueo correcto por stock insuficiente.")
        
from django.core.cache import cache

class LoginBruteForceTest(TestCase):
    def setUp(self):
        # Limpiar la caché antes de cada prueba para evitar interferencias
        cache.clear()
        self.username = 'usuario_victima'
        self.password = 'password_correcto'
        self.user = User.objects.create_user(username=self.username, password=self.password)
        self.url = '/fs/login/'

    def test_login_blocked_after_three_failed_attempts(self):
        """CP-UNI-02: Verifica el bloqueo tras 3 intentos fallidos"""
        
        # Intento 1
        res1 = self.client.post(self.url, {'username': self.username, 'password': 'mal'}, format='json')
        self.assertEqual(res1.status_code, 401) # No autorizado
        
        # Intento 2
        res2 = self.client.post(self.url, {'username': self.username, 'password': 'mal'}, format='json')
        self.assertEqual(res2.status_code, 401)

        # Intento 3 (Este debería bloquear)
        res3 = self.client.post(self.url, {'username': self.username, 'password': 'mal'}, format='json')
        self.assertEqual(res3.status_code, 401)
        self.assertIn("Usuario bloqueado", str(res3.data)) # Verifica el mensaje

        # Intento 4 (Incluso con la contraseña correcta, debe estar bloqueado)
        res4 = self.client.post(self.url, {'username': self.username, 'password': self.password}, format='json')
        self.assertEqual(res4.status_code, 401)
        self.assertIn("Demasiados intentos fallidos", str(res4.data))
        
        print("\n✅ CP-UNI-02: El sistema bloqueó correctamente al usuario tras 3 intentos fallidos.")
        

class StockDecrementOnSaleTest(TestCase):
    def setUp(self):
        # Crear usuario vendedor con token
        self.user = User.objects.create_user(username='vendedor_stock', password='password123')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        # Datos base
        self.customer = Customer.objects.create(customer_type='I', phone='77777777')
        self.brand = Brand.objects.create(name='MarcaStock')
        self.model = ProductModel.objects.create(name='ModeloStock', brand=self.brand)
        self.warehouse = Warehouse.objects.create(name='BodegaStock', capacity=200, manager=self.user)

        # Producto con stock inicial de 10
        self.product = Product.objects.create(
            name='Inversor 3kW',
            description='Inversor solar de 3 kilovatios',
            stock_quantity=10,
            base_price_usd=Decimal('500.00'),
            product_model=self.model,
            warehouse=self.warehouse
        )

    def test_stock_decreases_after_sale(self):
        """CP-UNI-03: El stock debe disminuir en la cantidad vendida"""
        url = '/fs/apibd/v1/process_sale/'
        stock_inicial = self.product.stock_quantity  # 10

        payload = {
            "customer_id": self.customer.id,
            "currency": "USD",
            "exchange_rate": "1.0000",
            "payment_method": "Efectivo",
            "discount_amount": "0.00",
            "items": [
                {"product_id": self.product.id, "quantity": 3, "price": "500.00"}
            ],
            "requires_installation": False
        }

        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, 201)

        # Refrescar desde la base de datos para obtener el valor actualizado
        self.product.refresh_from_db()

        # El stock debió bajar de 10 a 7
        self.assertEqual(self.product.stock_quantity, 7)
        print(f"\n✅ CP-UNI-03: Stock decrementado correctamente (de {stock_inicial} a {self.product.stock_quantity})")
        
        
from fs.middleware import _current_user  # Para simular el middleware en tests
from fs.models import AuditLog

class AuditLogSignalTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='auditor_test', password='password123')
        self.brand = Brand.objects.create(name='MarcaAudit')
        self.model = ProductModel.objects.create(name='ModeloAudit', brand=self.brand)
        self.warehouse = Warehouse.objects.create(name='BodegaAudit', capacity=100, manager=self.user)

    def tearDown(self):
        # Limpiar el thread-local del middleware al finalizar cada test
        _current_user.user = None

    def test_audit_log_created_on_product_creation(self):
        """CP-UNI-04: Al crear un Producto se genera un registro AuditLog con los datos correctos"""
        # Contar registros antes
        count_before = AuditLog.objects.count()

        # Crear el producto (esto dispara el signal post_save)
        product = Product.objects.create(
            name='Panel Auditado 550W',
            description='Panel solar para prueba de auditoría',
            stock_quantity=8,
            base_price_usd=Decimal('250.00'),
            product_model=self.model,
            warehouse=self.warehouse
        )

        # Verificar que se creó exactamente 1 nuevo registro de auditoría
        count_after = AuditLog.objects.count()
        self.assertEqual(count_after, count_before + 1,
            "No se creó ningún registro de auditoría al crear el producto")

        # Buscar específicamente el log de NUESTRO producto
        log = AuditLog.objects.filter(
            record_id=product.id,
            table_name='Product'
        ).first()

        self.assertIsNotNone(log, "No se encontró el AuditLog para el producto creado")
        self.assertEqual(log.action, 'CREATE')
        self.assertEqual(log.table_name, 'Product')
        self.assertIn("Producto creado: 'Panel Auditado 550W'", log.description)
        self.assertIn("Stock inicial: 8", log.description)

        # Sin request real, el actor debe ser None (sistema)
        self.assertIsNone(log.user)

        print(f"\n✅ CP-UNI-04: AuditLog creado | Acción: {log.action} | Tabla: {log.table_name} | ID: {log.record_id}")

    def test_audit_log_captures_authenticated_user_via_middleware(self):
        """Prueba extra: El middleware captura el usuario autenticado y lo guarda en AuditLog"""
        # Simular que un request autenticado está en curso
        _current_user.user = self.user

        product = Product.objects.create(
            name='Producto con Usuario',
            description='Prueba de captura de usuario',
            stock_quantity=3,
            base_price_usd=Decimal('100.00'),
            product_model=self.model,
            warehouse=self.warehouse
        )

        log = AuditLog.objects.filter(record_id=product.id, table_name='Product').first()
        self.assertIsNotNone(log)
        self.assertEqual(log.user, self.user)
        print(f"\n✅ Prueba extra: AuditLog capturó correctamente al usuario '{log.user.username}' vía middleware")
        
        
        
class ProcessSaleSerializerValidationTest(TestCase):
    """CP-UNI-05: El serializer debe rechazar payloads inválidos con HTTP 400"""

    def setUp(self):
        self.user = User.objects.create_user(username='validator_user', password='password123')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        self.customer = Customer.objects.create(customer_type='I', phone='88880000')
        self.brand = Brand.objects.create(name='MarcaValid')
        self.model = ProductModel.objects.create(name='ModeloValid', brand=self.brand)
        self.warehouse = Warehouse.objects.create(name='BodegaValid', capacity=50, manager=self.user)
        self.product = Product.objects.create(
            name='Regulador de Carga',
            description='Regulador MPPT',
            stock_quantity=20,
            base_price_usd=Decimal('80.00'),
            product_model=self.model,
            warehouse=self.warehouse
        )
        self.url = '/fs/apibd/v1/process_sale/'

    def _base_payload(self):
        """Devuelve un payload base válido que podemos mutar por prueba."""
        return {
            "customer_id": self.customer.id,
            "currency": "USD",
            "exchange_rate": "1.0000",
            "payment_method": "Efectivo",
            "discount_amount": "0.00",
            "items": [
                {"product_id": self.product.id, "quantity": 1, "price": "80.00"}
            ],
            "requires_installation": False
        }

    def test_rejects_zero_quantity(self):
        """Rechaza si un ítem tiene cantidad 0"""
        payload = self._base_payload()
        payload['items'][0]['quantity'] = 0  # Inválido: min_value=1
        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('items', response.data)
        print("\n✅ CP-UNI-05a: Rechazado correctamente payload con cantidad = 0")

    def test_rejects_negative_quantity(self):
        """Rechaza si un ítem tiene cantidad negativa"""
        payload = self._base_payload()
        payload['items'][0]['quantity'] = -5
        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('items', response.data)
        print("✅ CP-UNI-05b: Rechazado correctamente payload con cantidad negativa")

    def test_rejects_missing_customer_id(self):
        """Rechaza si falta el customer_id (campo obligatorio)"""
        payload = self._base_payload()
        del payload['customer_id']
        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('customer_id', response.data)
        print("✅ CP-UNI-05c: Rechazado correctamente payload sin customer_id")

    def test_rejects_empty_items_list(self):
        """Rechaza si el carrito está vacío"""
        payload = self._base_payload()
        payload['items'] = []
        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('items', response.data)
        print("✅ CP-UNI-05d: Rechazado correctamente payload con carrito vacío")
        
        
class ProcessSaleTransactionRollbackTest(TestCase):
    """CP-UNI-06: Si una venta falla, NADA debe quedar guardado (atomicidad)"""

    def setUp(self):
        self.user = User.objects.create_user(username='rollback_user', password='password123')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        self.customer = Customer.objects.create(customer_type='I', phone='88881111')
        self.brand = Brand.objects.create(name='MarcaRollback')
        self.model = ProductModel.objects.create(name='ModeloRollback', brand=self.brand)
        self.warehouse = Warehouse.objects.create(name='BodegaRollback', capacity=50, manager=self.user)

        # Producto 1: tiene stock suficiente (10)
        self.product_ok = Product.objects.create(
            name='Controlador OK',
            description='Controlador con stock',
            stock_quantity=10,
            base_price_usd=Decimal('100.00'),
            product_model=self.model,
            warehouse=self.warehouse
        )
        # Producto 2: tiene stock insuficiente (2, pero pediremos 5)
        self.product_fail = Product.objects.create(
            name='Controlador FAIL',
            description='Controlador sin stock',
            stock_quantity=2,
            base_price_usd=Decimal('200.00'),
            product_model=self.model,
            warehouse=self.warehouse
        )

    def test_rollback_when_second_item_has_insufficient_stock(self):
        """CP-UNI-06: Si el 2do ítem no tiene stock, la venta completa se revierte"""
        from fs.models import Sale, SaleDetail

        url = '/fs/apibd/v1/process_sale/'
        sales_before = Sale.objects.count()
        details_before = SaleDetail.objects.count()
        stock_ok_before = self.product_ok.stock_quantity       # 10
        stock_fail_before = self.product_fail.stock_quantity   # 2

        payload = {
            "customer_id": self.customer.id,
            "currency": "USD",
            "exchange_rate": "1.0000",
            "payment_method": "Efectivo",
            "discount_amount": "0.00",
            "items": [
                # Primer item: OK, hay stock de sobra
                {"product_id": self.product_ok.id, "quantity": 2, "price": "100.00"},
                # Segundo item: FALLA, pedimos 5 pero solo hay 2
                {"product_id": self.product_fail.id, "quantity": 5, "price": "200.00"}
            ],
            "requires_installation": False
        }

        response = self.client.post(url, payload, format='json')

        # 1. La respuesta debe ser 400 (Bad Request)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Stock insuficiente", response.data['error'])

        # 2. NO debe haberse creado ninguna Venta
        self.assertEqual(Sale.objects.count(), sales_before,
            "❌ Se creó una venta a pesar del fallo")

        # 3. NO debe haberse creado ningún Detalle
        self.assertEqual(SaleDetail.objects.count(), details_before,
            "❌ Se creó un SaleDetail a pesar del fallo")

        # 4. El stock de AMBOS productos debe estar intacto
        self.product_ok.refresh_from_db()
        self.product_fail.refresh_from_db()
        self.assertEqual(self.product_ok.stock_quantity, stock_ok_before,
            "❌ El stock del primer producto se modificó a pesar del rollback")
        self.assertEqual(self.product_fail.stock_quantity, stock_fail_before,
            "❌ El stock del segundo producto se modificó a pesar del rollback")

        print(f"\n✅ CP-UNI-06: Rollback exitoso. Venta NO creada, stock intacto "
            f"(OK={self.product_ok.stock_quantity}, FAIL={self.product_fail.stock_quantity})")
        
class ConcurrencySaleTest(TransactionTestCase):
    """CP-SIS-01: Dos usuarios comprando el último artículo → solo uno gana"""

    def setUp(self):
        self.user = User.objects.create_user(username='concurrent_user', password='password123')
        self.token = Token.objects.create(user=self.user)

        self.customer = Customer.objects.create(customer_type='I', phone='88882222')
        self.brand = Brand.objects.create(name='MarcaConc')
        self.model = ProductModel.objects.create(name='ModeloConc', brand=self.brand)
        self.warehouse = Warehouse.objects.create(name='BodegaConc', capacity=50, manager=self.user)

        # Producto con stock = 1 (el último artículo)
        self.product = Product.objects.create(
            name='Último Panel Solar',
            description='Único en stock',
            stock_quantity=1,
            base_price_usd=Decimal('999.00'),
            product_model=self.model,
            warehouse=self.warehouse
        )

    def _attempt_sale(self, results, lock):
        """Función que se ejecuta en cada hilo: intenta hacer la venta."""
        try:
            client = APIClient()
            token = Token.objects.get(user=self.user)
            client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

            url = '/fs/apibd/v1/process_sale/'
            payload = {
                "customer_id": self.customer.id,
                "currency": "USD",
                "exchange_rate": "1.0000",
                "payment_method": "Efectivo",
                "discount_amount": "0.00",
                "items": [
                    {"product_id": self.product.id, "quantity": 1, "price": "999.00"}
                ],
                "requires_installation": False
            }

            response = client.post(url, payload, format='json')
            with lock:
                results.append(response.status_code)
        except Exception as e:
            with lock:
                results.append(('error', type(e).__name__, str(e)))
        finally:
            # Cada hilo debe cerrar su propia conexión a la BD
            connections.close_all()

    def test_two_concurrent_sales_cannot_oversell_last_item(self):
        """CP-SIS-01: Solo una venta debe tener éxito sobre el último artículo"""
        results = []
        lock = threading.Lock()

        # Lanzar 2 hilos simultáneamente
        threads = [
            threading.Thread(target=self._attempt_sale, args=(results, lock))
            for _ in range(2)
        ]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=10)

        # Análisis de resultados
        successes = results.count(201)
        failures = results.count(400)

        # Debe haber exactamente 1 éxito y 1 fallo
        self.assertEqual(successes, 1,
            f"❌ Se esperaba exactamente 1 venta exitosa, se obtuvieron {successes}. Resultados: {results}")
        self.assertEqual(failures, 1,
            f"❌ Se esperaba exactamente 1 venta fallida, se obtuvieron {failures}. Resultados: {results}")

        # El stock final debe ser 0 (nunca negativo)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 0,
            f"❌ El stock terminó en {self.product.stock_quantity}, debería ser 0")

        print(f"\n✅ CP-SIS-01: Bloqueo pesimista funcionó. Stock final: {self.product.stock_quantity}")
        print(f"   Resultados de los hilos: {results}")
        
        
class FullTraceabilityIntegrationTest(TestCase):
    """CP-SIS-02: Trazabilidad end-to-end vía API + Signals"""

    def setUp(self):
        self.user = User.objects.create_user(username='tracer', password='password123')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        self.brand = Brand.objects.create(name='MarcaTrace')
        self.model = ProductModel.objects.create(name='ModeloTrace', brand=self.brand)
        self.warehouse = Warehouse.objects.create(name='BodegaTrace', capacity=50, manager=self.user)

    def test_product_creation_via_api_generates_audit_log(self):
        """CP-SIS-02a: Crear un producto vía API debe generar AuditLog automáticamente"""
        audit_before = AuditLog.objects.count()

        payload = {
            "name": "Batería de Litio 200Ah",
            "description": "Batería para sistema solar",
            "stock_quantity": 0,
            "base_price_usd": "1200.00",
            "warranty_months": 24,
            "is_kit": False,
            "minimum_stock": 2,
            "product_model": self.model.id,
            "warehouse": self.warehouse.id
        }

        response = self.client.post('/fs/apibd/v1/product/', payload, format='json')
        self.assertEqual(response.status_code, 201, f"Error al crear producto: {response.data}")

        product_id = response.data['id']

        # Verificar que se creó el AuditLog
        self.assertEqual(AuditLog.objects.count(), audit_before + 1)

        log = AuditLog.objects.filter(record_id=product_id, table_name='Product', action='CREATE').first()
        self.assertIsNotNone(log, "No se creó el AuditLog de tipo CREATE para el producto")
        self.assertIn("Batería de Litio 200Ah", log.description)

        print(f"\n✅ CP-SIS-02a: AuditLog generado para Product ID={product_id} vía API")

    def test_customer_creation_via_api_generates_audit_log(self):
        """CP-SIS-02b: Crear un cliente vía API debe generar AuditLog"""
        audit_before = AuditLog.objects.count()

        payload = {
            "customer_type": "I",
            "phone": "8888-1234"
        }
        response = self.client.post('/fs/apibd/v1/customer/', payload, format='json')
        self.assertEqual(response.status_code, 201)

        customer_id = response.data['id']

        log = AuditLog.objects.filter(record_id=customer_id, table_name='Customer', action='CREATE').first()
        self.assertIsNotNone(log, "No se generó AuditLog para el Customer creado vía API")
        self.assertIn("Cliente creado", log.description)

        print(f"✅ CP-SIS-02b: AuditLog generado para Customer ID={customer_id} vía API")

    def test_full_sale_chain_generates_multiple_audit_logs(self):
        """CP-SIS-02c: Flujo completo: Cliente + Producto + Venta → múltiples AuditLogs"""
        # Crear cliente vía API
        cust_res = self.client.post('/fs/apibd/v1/customer/', 
            {"customer_type": "I", "phone": "8888-9999"}, format='json')
        customer_id = cust_res.data['id']

        # Crear producto vía API con stock
        prod_payload = {
            "name": "Inversor Híbrido 5kW",
            "description": "Inversor para prueba de flujo completo",
            "stock_quantity": 5,
            "base_price_usd": "850.00",
            "warranty_months": 12,
            "is_kit": False,
            "minimum_stock": 1,
            "product_model": self.model.id,
            "warehouse": self.warehouse.id
        }
        prod_res = self.client.post('/fs/apibd/v1/product/', prod_payload, format='json')
        product_id = prod_res.data['id']

        # Contar logs antes de la venta
        audit_before = AuditLog.objects.count()

        # Procesar la venta vía endpoint dedicado
        sale_payload = {
            "customer_id": customer_id,
            "currency": "USD",
            "exchange_rate": "1.0000",
            "payment_method": "Transferencia",
            "discount_amount": "0.00",
            "items": [
                {"product_id": product_id, "quantity": 2, "price": "850.00"}
            ],
            "requires_installation": False
        }
        sale_res = self.client.post('/fs/apibd/v1/process_sale/', sale_payload, format='json')
        self.assertEqual(sale_res.status_code, 201)

        sale_id = sale_res.data['sale_id']

        # Debe haberse creado al menos 1 AuditLog nuevo (el de la Sale)
        self.assertGreater(AuditLog.objects.count(), audit_before,
            "No se generó AuditLog al procesar la venta")

        sale_log = AuditLog.objects.filter(record_id=sale_id, table_name='Sale', action='CREATE').first()
        self.assertIsNotNone(sale_log, "No se generó AuditLog para la Sale")
        self.assertIn("Venta registrada", sale_log.description)
        self.assertIn("Transferencia", sale_log.description)

        # Verificar trazabilidad total: 3 logs esperados (Customer, Product, Sale)
        total_logs = AuditLog.objects.filter(
            table_name__in=['Customer', 'Product', 'Sale']
        ).count()
        self.assertGreaterEqual(total_logs, 3)

        print(f"\n✅ CP-SIS-02c: Trazabilidad completa funcionando")
        print(f"   → AuditLogs generados en esta prueba: {AuditLog.objects.count() - audit_before}")
        print(f"   → Sale ID: {sale_id}, Product ID: {product_id}, Customer ID: {customer_id}")
        

class ProtectedEndpointsSecurityTest(TestCase):
    """CP-SIS-03: Los endpoints protegidos deben devolver 401 sin token válido"""

    def setUp(self):
        # Sin token configurado en el cliente → todas las peticiones serán anónimas
        self.client = APIClient()

    def test_product_list_requires_authentication(self):
        """CP-SIS-03a: GET /product/ sin token → 401"""
        response = self.client.get('/fs/apibd/v1/product/')
        self.assertEqual(response.status_code, 401,
            f"❌ /product/ permitió acceso sin token. Código: {response.status_code}")
        print("\n✅ CP-SIS-03a: /product/ bloquea acceso sin token (401)")

    def test_backups_list_requires_authentication(self):
        """CP-SIS-03b: GET /backups/list/ sin token → 401"""
        response = self.client.get('/fs/backups/list/')
        self.assertEqual(response.status_code, 401,
            f"❌ /backups/list/ permitió acceso sin token. Código: {response.status_code}")
        print("✅ CP-SIS-03b: /backups/list/ bloquea acceso sin token (401)")

    def test_process_sale_requires_authentication(self):
        """CP-SIS-03c: POST /process_sale/ sin token → 401"""
        payload = {
            "customer_id": 1,
            "currency": "USD",
            "exchange_rate": "1.0000",
            "payment_method": "Efectivo",
            "discount_amount": "0.00",
            "items": [{"product_id": 1, "quantity": 1, "price": "100.00"}],
            "requires_installation": False
        }
        response = self.client.post('/fs/apibd/v1/process_sale/', payload, format='json')
        self.assertEqual(response.status_code, 401,
            f"❌ /process_sale/ permitió venta sin autenticación. Código: {response.status_code}")
        print("✅ CP-SIS-03c: /process_sale/ bloquea ventas sin token (401)")

    def test_backup_restore_requires_authentication(self):
        """CP-SIS-03d: POST /backups/restore/ sin token → 401"""
        response = self.client.post('/fs/backups/restore/', {'filename': 'backup_test.db'}, format='json')
        self.assertEqual(response.status_code, 401,
            f"❌ /backups/restore/ permitió restauración sin token. Código: {response.status_code}")
        print("✅ CP-SIS-03d: /backups/restore/ bloquea restauración sin token (401)")

    def test_invalid_token_is_rejected(self):
        """CP-SIS-03e: Token inválido → 401"""
        self.client.credentials(HTTP_AUTHORIZATION='Token token_falso_12345')
        response = self.client.get('/fs/apibd/v1/product/')
        self.assertEqual(response.status_code, 401,
            f"❌ Se aceptó un token inválido. Código: {response.status_code}")
        print("✅ CP-SIS-03e: Token inválido rechazado correctamente (401)")
        
    
class InactiveUserAuthenticationTest(TestCase):
    """CP-SIS-04: Los usuarios desactivados no deben poder iniciar sesión"""

    def setUp(self):
        cache.clear()
        self.url = '/fs/login/'
        # Usuario ACTIVO (control)
        self.active_user = User.objects.create_user(
            username='usuario_activo',
            password='Password123',
            is_active=True
        )
        # Usuario INACTIVO (a probar)
        self.inactive_user = User.objects.create_user(
            username='usuario_inactivo',
            password='Password123',
            is_active=False
        )

    def test_active_user_can_login(self):
        """CP-SIS-04a (control): Un usuario activo SÍ puede iniciar sesión"""
        response = self.client.post(self.url, {
            'username': 'usuario_activo',
            'password': 'Password123'
        }, format='json')
        self.assertEqual(response.status_code, 200,
            f"❌ El usuario activo no pudo iniciar sesión. Código: {response.status_code}")
        self.assertIn('token', response.data)
        print("\n✅ CP-SIS-04a (control): Usuario activo inició sesión correctamente")

    def test_inactive_user_cannot_login(self):
        """CP-SIS-04b: Un usuario desactivado NO puede iniciar sesión"""
        response = self.client.post(self.url, {
            'username': 'usuario_inactivo',
            'password': 'Password123'  # Contraseña correcta
        }, format='json')
        self.assertEqual(response.status_code, 401,
            f"❌ El usuario inactivo inició sesión. Código: {response.status_code}")
        self.assertNotIn('token', response.data)
        # Verificar que el mensaje sea el correcto
        msg = str(response.data)
        self.assertIn("desactivada", msg.lower(),
            f"❌ El mensaje no indica que la cuenta está desactivada. Respuesta: {msg}")
        print("✅ CP-SIS-04b: Usuario desactivado fue rechazado correctamente (401)")
        
        
        
from unittest.mock import patch
from django.core.cache import cache

class PasswordStrengthValidationTest(TestCase):
    """CP-SIS-05: Verificar si el backend valida la fortaleza de la contraseña"""

    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(
            username='reset_test_user',
            password='OldPassword123',
            email='reset@test.com'
        )
        self.url = '/fs/reset-password/'

    @patch('fs.api.views.auth_views.get_random_string')
    def test_backend_accepts_weak_password(self, mock_get_random_string):
        """
        CP-SIS-05: Enviar una contraseña débil (solo 'a') al endpoint de reset.
        Si el backend responde 200, significa que NO valida fortaleza.
        """
        # Forzamos un token predecible
        mock_get_random_string.return_value = 'test_token_weak'

        # 1. Solicitar reset (guarda el token en caché)
        response = self.client.post(self.url, {'email': 'reset@test.com'}, format='json')
        self.assertEqual(response.status_code, 200)

        # 2. Verificar que el token se guardó en caché
        token_key = f"password_reset_token_test_token_weak"
        self.assertIsNotNone(cache.get(token_key), "El token no se guardó en caché")

        # 3. Intentar cambiar la contraseña a una DÉBIL (solo 'a')
        weak_password = 'a'
        confirm_url = f'/fs/reset-password/test_token_weak/'
        response = self.client.post(confirm_url, {
            'password': weak_password,
            'confirm_password': weak_password
        }, format='json')

        # ANÁLISIS DEL RESULTADO
        if response.status_code == 200:
            print(f"\n⚠️  CP-SIS-05: HALLAZGO — El backend ACEPTÓ una contraseña débil ('{weak_password}')")
            print(f"    Esto significa que la validación de fortaleza SOLO existe en el frontend.")
            self.fail(
                f"❌ El backend no valida la fortaleza de la contraseña. "
                f"Se aceptó '{weak_password}' como contraseña válida (HTTP {response.status_code})."
            )
        else:
            print(f"\n✅ CP-SIS-05: El backend rechazó la contraseña débil correctamente "
                f"(HTTP {response.status_code})")
            
            
class PasswordResetFullFlowTest(TestCase):
    """CP-SIS-06: Flujo completo de reset password y token de un solo uso"""

    def setUp(self):
        cache.clear()
        self.url_request = '/fs/reset-password/'
        self.user = User.objects.create_user(
            username='flow_user',
            password='OriginalPass1',
            email='flow@test.com'
        )

    def _request_reset_and_get_token(self):
        """Helper: solicita reset y devuelve el token generado."""
        with patch('fs.api.views.auth_views.get_random_string') as mock:
            mock.return_value = 'flow_token_xyz'
            response = self.client.post(self.url_request, {'email': 'flow@test.com'}, format='json')
            self.assertEqual(response.status_code, 200)
        return 'flow_token_xyz'

    def test_full_password_reset_flow(self):
        """CP-SIS-06a: Flujo completo exitoso"""
        # 1. Solicitar el reset → obtener token
        token = self._request_reset_and_get_token()
        self.assertIsNotNone(cache.get(f"password_reset_token_{token}"),
            "El token no se guardó en caché")

        # 2. Cambiar la contraseña con el token
        new_password = 'NewPassword456'
        confirm_url = f'/fs/reset-password/{token}/'
        response = self.client.post(confirm_url, {
            'password': new_password,
            'confirm_password': new_password
        }, format='json')
        self.assertEqual(response.status_code, 200)

        # 3. Verificar que el usuario puede loguearse con la NUEVA contraseña
        login_res = self.client.post('/fs/login/', {
            'username': 'flow_user',
            'password': new_password
        }, format='json')
        self.assertEqual(login_res.status_code, 200)
        self.assertIn('token', login_res.data)

        print("\n✅ CP-SIS-06a: Flujo completo exitoso (reset → cambio → login)")

    def test_password_reset_token_is_single_use(self):
        """CP-SIS-06b: El token no debe poder usarse dos veces"""
        # 1. Solicitar reset
        token = self._request_reset_and_get_token()

        # 2. Usar el token por primera vez
        confirm_url = f'/fs/reset-password/{token}/'
        response1 = self.client.post(confirm_url, {
            'password': 'FirstChange1',
            'confirm_password': 'FirstChange1'
        }, format='json')
        self.assertEqual(response1.status_code, 200)

        # 3. Intentar reutilizar el mismo token
        response2 = self.client.post(confirm_url, {
            'password': 'SecondChange2',
            'confirm_password': 'SecondChange2'
        }, format='json')

        self.assertEqual(response2.status_code, 400,
            f"❌ El token pudo reutilizarse. Código: {response2.status_code}")
        print("✅ CP-SIS-06b: Token invalidado correctamente tras su primer uso")

    def test_old_password_no_longer_works(self):
        """CP-SIS-06c: La contraseña antigua ya no debe funcionar tras el reset"""
        token = self._request_reset_and_get_token()

        # Cambiar la contraseña
        self.client.post(f'/fs/reset-password/{token}/', {
            'password': 'BrandNewPass9',
            'confirm_password': 'BrandNewPass9'
        }, format='json')

        # Intentar loguearse con la contraseña VIEJA
        login_res = self.client.post('/fs/login/', {
            'username': 'flow_user',
            'password': 'OriginalPass1'
        }, format='json')

        self.assertEqual(login_res.status_code, 401,
            f"❌ La contraseña antigua sigue funcionando. Código: {login_res.status_code}")
        print("✅ CP-SIS-06c: Contraseña antigua rechazada correctamente")

    def test_invalid_token_is_rejected(self):
        """CP-SIS-06d: Token inexistente debe devolver 400"""
        response = self.client.post('/fs/reset-password/token_inventado_999/', {
            'password': 'WhateverPass1',
            'confirm_password': 'WhateverPass1'
        }, format='json')
        self.assertEqual(response.status_code, 400)
        print("✅ CP-SIS-06d: Token inválido rechazado correctamente")
        
        
        
class RoleBasedAccessControlTest(TestCase):
    """CP-SIS-07: Un usuario no-staff no debe poder ejecutar acciones administrativas"""

    def setUp(self):
        # Usuario NO administrador (vendedor común)
        self.regular_user = User.objects.create_user(
            username='vendedor_comun',
            password='VendedorPass1',
            is_staff=False
        )
        self.regular_token = Token.objects.create(user=self.regular_user)

        # Usuario administrador (para el caso de control)
        self.admin_user = User.objects.create_user(
            username='admin_user',
            password='AdminPass1',
            is_staff=True
        )
        self.admin_token = Token.objects.create(user=self.admin_user)

        self.client = APIClient()

    def test_regular_user_can_read_own_data(self):
        """CP-SIS-07a (control): Un usuario regular SÍ puede consultar productos"""
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.regular_token.key)
        response = self.client.get('/fs/apibd/v1/product/')
        self.assertEqual(response.status_code, 200)
        print("\n✅ CP-SIS-07a (control): Usuario regular puede leer productos")

    def test_regular_user_cannot_list_all_users(self):
        """CP-SIS-07b: Un usuario regular NO debe poder listar todos los usuarios (empleados)"""
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.regular_token.key)
        response = self.client.get('/fs/apibd/v1/user/')

        if response.status_code == 200:
            # Hallazgo: cualquier usuario puede ver la lista completa de empleados
            print(f"\n⚠️  CP-SIS-07b: HALLAZGO — El usuario regular PUEDE listar todos los usuarios.")
            self.fail(
                f"❌ Un usuario no-staff obtuvo la lista completa de usuarios (HTTP 200). "
                f"Esto expone información sensible de empleados."
            )
        else:
            print(f"✅ CP-SIS-07b: Usuario regular bloqueado correctamente "
                  f"(HTTP {response.status_code})")

    def test_regular_user_cannot_create_new_user(self):
        """CP-SIS-07c: Un usuario regular NO debe poder crear empleados"""
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.regular_token.key)
        payload = {
            'username': 'empleado_falso',
            'email': 'fake@test.com',
            'password': 'FakePass123',
            'is_staff': True  # ¡Intento de escalada de privilegios!
        }
        response = self.client.post('/fs/apibd/v1/user/', payload, format='json')

        if response.status_code in (200, 201):
            # Verificar si el usuario fue creado con privilegios de admin
            fake_created = User.objects.filter(username='empleado_falso').first()
            if fake_created and fake_created.is_staff:
                print(f"\n⚠️  CP-SIS-07c: HALLAZGO CRÍTICO — Escalada de privilegios posible.")
                self.fail(
                    f"❌ Un usuario NO-staff pudo crear un usuario administrador. "
                    f"Escalada de privilegios confirmada."
                )
        else:
            print(f"✅ CP-SIS-07c: Creación de usuario bloqueada correctamente "
                  f"(HTTP {response.status_code})")

    def test_regular_user_cannot_access_backups(self):
        """CP-SIS-07d: Un usuario regular NO debe poder ver la lista de backups"""
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.regular_token.key)
        response = self.client.get('/fs/backups/list/')

        if response.status_code == 200:
            print(f"\n⚠️  CP-SIS-07d: HALLAZGO — Usuario regular accede a lista de backups.")
            self.fail(
                f"❌ Un usuario no-staff pudo ver la lista de backups (HTTP 200). "
                f"Los backups son información sensible de administración."
            )
        else:
            print(f"✅ CP-SIS-07d: Acceso a backups bloqueado "
                f"(HTTP {response.status_code})")

    def test_admin_user_can_access_admin_endpoints(self):
        """CP-SIS-07e (control): Un admin SÍ debe poder acceder a endpoints administrativos"""
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        response = self.client.get('/fs/apibd/v1/user/')
        self.assertEqual(response.status_code, 200,
            f"❌ El admin no pudo acceder a /user/. Código: {response.status_code}")
        print("✅ CP-SIS-07e (control): Admin accede correctamente a endpoints administrativos")
        
        
        
import os
import tempfile
import shutil
from django.test import override_settings

class BackupLifecycleTest(TestCase):
    """CP-SIS-08: Ciclo completo de creación, listado, descarga y eliminación de backups"""

    def setUp(self):
        # Directorio temporal aislado para no tocar los backups reales del proyecto
        self.temp_backup_dir = tempfile.mkdtemp(prefix='test_backups_')

        # Override del setting BACKUPS_DIR durante toda esta clase de pruebas
        self.override = override_settings(BACKUPS_DIR=self.temp_backup_dir)
        self.override.enable()

        # Creamos un usuario admin para poder usar los endpoints de backup
        self.admin_user = User.objects.create_user(
            username='backup_admin',
            password='BackupPass1',
            is_staff=True
        )
        self.admin_token = Token.objects.create(user=self.admin_user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)

    def tearDown(self):
        self.override.disable()
        shutil.rmtree(self.temp_backup_dir, ignore_errors=True)

    def test_full_backup_lifecycle(self):
        """CP-SIS-08: Crear → Listar → Descargar → Eliminar un backup"""
        # 1. CREAR backup
        response = self.client.post('/fs/backups/create/', {}, format='json')
        self.assertEqual(response.status_code, 200,
            f"❌ Error al crear backup: {response.data}")
        backup_filename = response.data['backup']['filename']
        backup_path = os.path.join(self.temp_backup_dir, backup_filename)

        # Verificar que el archivo existe físicamente en disco
        self.assertTrue(os.path.exists(backup_path),
            f"❌ El archivo de backup no existe en disco: {backup_path}")
        # Verificar que se creó el archivo .meta
        self.assertTrue(os.path.exists(backup_path + '.meta'),
            "❌ No se creó el archivo .meta con los metadatos")
        print(f"\n✅ CP-SIS-08a: Backup creado en disco: {backup_filename}")

        # 2. LISTAR backups
        response = self.client.get('/fs/backups/list/')
        self.assertEqual(response.status_code, 200)
        filenames = [b['filename'] for b in response.data['backups']]
        self.assertIn(backup_filename, filenames,
            f"❌ El backup recién creado no aparece en la lista")
        print(f"✅ CP-SIS-08b: Backup listado correctamente ({len(filenames)} en total)")

        # 3. DESCARGAR backup
        response = self.client.get(f'/fs/backups/download/?filename={backup_filename}')
        self.assertEqual(response.status_code, 200)
        # Verificar que el contenido sea binario y no esté vacío
        self.assertGreater(len(response.content), 0,
            "❌ El archivo descargado está vacío")
        print(f"✅ CP-SIS-08c: Backup descargado ({len(response.content)} bytes)")

        # 4. ELIMINAR backup
        response = self.client.delete(f'/fs/backups/delete/?filename={backup_filename}')
        self.assertEqual(response.status_code, 200)

        # Verificar que el archivo YA NO existe en disco
        self.assertFalse(os.path.exists(backup_path),
            f"❌ El archivo aún existe tras eliminarlo")
        self.assertFalse(os.path.exists(backup_path + '.meta'),
            "❌ El archivo .meta aún existe tras eliminarlo")

        # Verificar que ya no aparece en la lista
        response = self.client.get('/fs/backups/list/')
        filenames = [b['filename'] for b in response.data['backups']]
        self.assertNotIn(backup_filename, filenames)
        print(f"✅ CP-SIS-08d: Backup eliminado correctamente (archivo y metadata)")

    def test_pre_restore_protocol_creates_safety_backup(self):
        """CP-SIS-08e: Al restaurar, debe crearse un backup pre_restore automáticamente"""
        # 1. Crear un backup inicial
        response = self.client.post('/fs/backups/create/', {}, format='json')
        backup_filename = response.data['backup']['filename']

        # 2. Restaurar desde ese backup
        response = self.client.post('/fs/backups/restore/', {
            'filename': backup_filename
        }, format='json')
        self.assertEqual(response.status_code, 200)

        # 3. Verificar que se creó el backup pre_restore
        pre_restore_name = response.data.get('pre_restore_backup')
        self.assertIsNotNone(pre_restore_name,
            "❌ No se creó el archivo pre_restore")
        pre_restore_path = os.path.join(self.temp_backup_dir, pre_restore_name)

        self.assertTrue(os.path.exists(pre_restore_path),
            f"❌ El archivo pre_restore no existe en disco: {pre_restore_path}")
        self.assertTrue(pre_restore_name.startswith('pre_restore_'),
            f"❌ El nombre no sigue el formato esperado: {pre_restore_name}")

        print(f"\n✅ CP-SIS-08e: Protocolo pre_restore funcionando: {pre_restore_name}")
        
        
class DuplicatePurchaseRegressionTest(TestCase):
    """CP-MAN-05: Verificar el manejo de compras duplicadas"""

    def setUp(self):
        self.admin = User.objects.create_user(
            username='purchases_admin',
            password='AdminPass1',
            is_staff=True
        )
        self.token = Token.objects.create(user=self.admin)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.access_token if hasattr(self.token, 'access_token') else 'Token ' + self.token.key)

        self.supplier = Supplier.objects.create(
            tax_id='001-111111-0011A',
            company_name='Proveedor Regresión S.A.',
            phone='8888-0001',
            is_active=True
        )
        self.brand = Brand.objects.create(name='MarcaReg')
        self.model = ProductModel.objects.create(name='ModeloReg', brand=self.brand)
        self.warehouse = Warehouse.objects.create(name='BodegaReg', capacity=100, manager=self.admin)

    def test_duplicate_purchase_invoice_is_prevented_or_detected(self):
        """CP-MAN-05: Registrar la misma factura dos veces NO debe crear duplicados silenciosos"""
        url = '/fs/apibd/v1/purchase_order/'
        invoice_number = 'FAC-REG-001'

        payload = {
            'date': '2026-09-11',
            'supplier': self.supplier.id,
            'invoice_number': invoice_number,
            'total_amount': '1500.00',
            'payment_method': 'Transferencia'
        }

        # Primera compra
        res1 = self.client.post(url, payload, format='json')
        self.assertEqual(res1.status_code, 201, f"Error al crear primera compra: {res1.data}")

        # Segunda compra con el MISMO invoice_number y MISMO proveedor
        res2 = self.client.post(url, payload, format='json')

        # Verificar si el sistema rechaza el duplicado
        if res2.status_code in (200, 201):
            # Hallazgo: se permitió el duplicado
            print(f"\n⚠️  CP-MAN-05: HALLAZGO — Se permitió registrar la misma factura dos veces.")
            self.fail(
                f"❌ El sistema permitió crear dos PurchaseOrder con el mismo invoice_number "
                f"'{invoice_number}' para el mismo proveedor (HTTP {res2.status_code}). "
                f"Esto puede generar duplicados contables y stock inflado."
            )
        else:
            # Aprobado: el sistema rechazó el duplicado
            print(f"\n✅ CP-MAN-05: Duplicado rechazado correctamente (HTTP {res2.status_code})")

    def test_multiple_purchases_same_invoice_different_suppliers_allowed(self):
        """CP-MAN-05b (control): El mismo invoice_number para OTRO proveedor SÍ debe permitirse"""
        url = '/fs/apibd/v1/purchase_order/'

        # Otro proveedor
        other_supplier = Supplier.objects.create(
            tax_id='002-222222-0022B',
            company_name='Otro Proveedor',
            phone='8888-0002',
            is_active=True
        )

        payload = {
            'date': '2026-09-11',
            'supplier': other_supplier.id,
            'invoice_number': 'FAC-REG-001',  # Mismo número
            'total_amount': '500.00',
            'payment_method': 'Efectivo'
        }

        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, 201,
            f"❌ Un invoice_number de otro proveedor fue rechazado incorrectamente.")
        print("\n✅ CP-MAN-05b (control): Mismo invoice_number con otro proveedor permitido correctamente")
        
        
        
        
class BackendSerializerValidationTest(TestCase):
    """CP-MAN-06: Los serializers deben rechazar payloads inválidos con HTTP 400"""

    def setUp(self):
        self.admin = User.objects.create_user(
            username='validation_admin',
            password='AdminPass1',
            is_staff=True
        )
        self.token = Token.objects.create(user=self.admin)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        self.brand = Brand.objects.create(name='MarcaVal')
        self.model = ProductModel.objects.create(name='ModeloVal', brand=self.brand)
        self.warehouse = Warehouse.objects.create(name='BodegaVal', capacity=100, manager=self.admin)

    def test_product_rejects_string_in_numeric_field(self):
        """CP-MAN-06a: Rechaza precio no numérico en Product"""
        payload = {
            'name': 'Producto Inválido',
            'description': 'Test',
            'stock_quantity': 10,
            'base_price_usd': 'NoSoyUnPrecio',  # ❌ String en campo Decimal
            'product_model': self.model.id,
            'warehouse': self.warehouse.id
        }
        res = self.client.post('/fs/apibd/v1/product/', payload, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn('base_price_usd', res.data)
        print("\n✅ CP-MAN-06a: Rechazado correctamente precio no numérico")

    def test_product_rejects_negative_stock(self):
        """CP-MAN-06b: Rechaza stock negativo en Product"""
        payload = {
            'name': 'Producto Stock Negativo',
            'description': 'Test',
            'stock_quantity': -5,  # ❌ Negativo
            'base_price_usd': '100.00',
            'product_model': self.model.id,
            'warehouse': self.warehouse.id
        }
        res = self.client.post('/fs/apibd/v1/product/', payload, format='json')
        self.assertEqual(res.status_code, 400)
        print("✅ CP-MAN-06b: Rechazado correctamente stock negativo")

    def test_product_rejects_missing_required_fields(self):
        """CP-MAN-06c: Rechaza payload sin campos obligatorios"""
        payload = {'name': 'Solo Nombre'}  # Faltan description, precios, modelo, etc.
        res = self.client.post('/fs/apibd/v1/product/', payload, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn('description', res.data)
        self.assertIn('base_price_usd', res.data)
        print("✅ CP-MAN-06c: Rechazado correctamente payload incompleto")

    def test_customer_rejects_invalid_customer_type(self):
        """CP-MAN-06d: Rechaza customer_type que no sea 'I' o 'C'"""
        payload = {
            'customer_type': 'X',  # ❌ Solo permite 'I' o 'C'
            'phone': '8888-1111'
        }
        res = self.client.post('/fs/apibd/v1/customer/', payload, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn('customer_type', res.data)
        print("✅ CP-MAN-06d: Rechazado correctamente customer_type inválido")

    def test_supplier_rejects_invalid_email_format(self):
        """CP-MAN-06e: Rechaza email mal formado en Supplier"""
        payload = {
            'tax_id': '001-111111-0011A',
            'company_name': 'Proveedor con Email Malo',
            'phone': '8888-1111',
            'email': 'esto-no-es-un-email'  # ❌ Sin @
        }
        res = self.client.post('/fs/apibd/v1/supplier/', payload, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn('email', res.data)
        print("✅ CP-MAN-06e: Rechazado correctamente email inválido")

    def test_product_rejects_negative_price(self):
        """CP-MAN-06f: Rechaza precio negativo en Product"""
        payload = {
            'name': 'Producto Precio Negativo',
            'description': 'Test',
            'stock_quantity': 5,
            'base_price_usd': '-50.00',  # ❌ Negativo
            'product_model': self.model.id,
            'warehouse': self.warehouse.id
        }
        res = self.client.post('/fs/apibd/v1/product/', payload, format='json')
        self.assertEqual(res.status_code, 400)
        print("✅ CP-MAN-06f: Rechazado correctamente precio negativo")
        
        
        
class SaleIntegrityRegressionTest(TestCase):
    """CP-MAN-07: La suma de los SaleDetails debe coincidir con Sale.total_amount"""

    def setUp(self):
        self.user = User.objects.create_user(username='integrity_user', password='Pass1234')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

        self.customer = Customer.objects.create(customer_type='I', phone='8888-5555')
        self.brand = Brand.objects.create(name='MarcaInt')
        self.model = ProductModel.objects.create(name='ModeloInt', brand=self.brand)
        self.warehouse = Warehouse.objects.create(name='BodegaInt', capacity=100, manager=self.user)

        self.product_a = Product.objects.create(
            name='Producto A', description='A', stock_quantity=20,
            base_price_usd=Decimal('100.00'), product_model=self.model, warehouse=self.warehouse
        )
        self.product_b = Product.objects.create(
            name='Producto B', description='B', stock_quantity=15,
            base_price_usd=Decimal('250.00'), product_model=self.model, warehouse=self.warehouse
        )

    def test_sale_total_matches_sum_of_details(self):
        """CP-MAN-07: El total de la venta debe ser la suma exacta de los detalles"""
        payload = {
            "customer_id": self.customer.id,
            "currency": "USD",
            "exchange_rate": "1.0000",
            "payment_method": "Efectivo",
            "discount_amount": "0.00",
            "items": [
                {"product_id": self.product_a.id, "quantity": 3, "price": "100.00"},  # 300
                {"product_id": self.product_b.id, "quantity": 2, "price": "250.00"},  # 500
            ],
            "requires_installation": True,
            "installation_price": "50.00",  # +50
            "installation_address": "Dirección Test",
            "scheduled_date": "2026-10-01"
        }

        res = self.client.post('/fs/apibd/v1/process_sale/', payload, format='json')
        self.assertEqual(res.status_code, 201, f"Error al crear venta: {res.data}")

        sale = Sale.objects.last()
        sale_details = SaleDetail.objects.filter(sale=sale)

        # Suma calculada de los detalles
        sum_details = sum(d.quantity * d.unit_price for d in sale_details)

        # Suma esperada = detalles + instalación
        expected_total = sum_details + Decimal('50.00')

        self.assertEqual(sale.total_amount, expected_total,
            f"❌ La suma de detalles ({sum_details}) + instalación (50) = {expected_total}, "
            f"pero Sale.total_amount = {sale.total_amount}")

        print(f"\n✅ CP-MAN-07: Integridad verificada. Detalles: ${sum_details} + Instalación: $50 = Total: ${sale.total_amount}")

    def test_sale_total_without_installation(self):
        """CP-MAN-07b: Sin instalación, el total debe ser exactamente la suma de los detalles"""
        payload = {
            "customer_id": self.customer.id,
            "currency": "USD",
            "exchange_rate": "1.0000",
            "payment_method": "Tarjeta",
            "discount_amount": "0.00",
            "items": [
                {"product_id": self.product_b.id, "quantity": 4, "price": "250.00"},  # 1000
            ],
            "requires_installation": False
        }

        res = self.client.post('/fs/apibd/v1/process_sale/', payload, format='json')
        self.assertEqual(res.status_code, 201)

        sale = Sale.objects.last()
        sale_details = SaleDetail.objects.filter(sale=sale)
        sum_details = sum(d.quantity * d.unit_price for d in sale_details)

        self.assertEqual(sale.total_amount, sum_details)
        print(f"✅ CP-MAN-07b: Sin instalación, total = ${sale.total_amount} coincide con detalles")
        


class CriticalEndpointsSmokeTest(TestCase):
    """CP-MAN-08: Smoke test — todos los endpoints críticos deben responder con token válido"""

    def setUp(self):
        self.admin = User.objects.create_user(
            username='smoke_admin', password='SmokePass1', is_staff=True
        )
        self.token = Token.objects.create(user=self.admin)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

    def _check_endpoint(self, method, url, description):
        """Helper para verificar un endpoint y reportar el resultado"""
        if method == 'GET':
            response = self.client.get(url)
        status = response.status_code
        marker = "✅" if status == 200 else "❌"
        print(f"   {marker} {description}: HTTP {status}")
        self.assertEqual(status, 200, f"{description} falló con HTTP {status}")
        return response

    def test_all_critical_read_endpoints_respond(self):
        """CP-MAN-08: Verificar que los endpoints de lectura responden correctamente"""
        print("\n🧪 CP-MAN-08: Smoke test de endpoints críticos")
        print("   ─────────────────────────────────────────────────")

        endpoints = [
            ('/fs/apibd/v1/product/', 'Listado de Productos'),
            ('/fs/apibd/v1/customer/', 'Listado de Clientes'),
            ('/fs/apibd/v1/supplier/', 'Listado de Proveedores'),
            ('/fs/apibd/v1/brand/', 'Listado de Marcas'),
            ('/fs/apibd/v1/model/', 'Listado de Modelos'),
            ('/fs/apibd/v1/warehouse/', 'Listado de Bodegas'),
            ('/fs/apibd/v1/sale/', 'Listado de Ventas'),
            ('/fs/apibd/v1/purchase_order/', 'Listado de Compras'),
            ('/fs/apibd/v1/user/', 'Listado de Usuarios'),
            ('/fs/backups/list/', 'Listado de Backups'),
            ('/fs/dashboard/top-products/', 'Dashboard — Top Productos'),
            ('/fs/dashboard/top-clients/', 'Dashboard — Top Clientes'),
            ('/fs/dashboard/top-stock/', 'Dashboard — Top Stock'),
        ]

        for url, description in endpoints:
            self._check_endpoint('GET', url, description)

        print("   ─────────────────────────────────────────────────")
        print(f"✅ CP-MAN-08: Todos los {len(endpoints)} endpoints críticos responden con HTTP 200")

    def test_all_endpoints_reject_without_token(self):
        """CP-MAN-08b: Todos los endpoints críticos deben rechazar peticiones sin token"""
        anon_client = APIClient()  # Sin credenciales

        endpoints = [
            '/fs/apibd/v1/product/',
            '/fs/apibd/v1/customer/',
            '/fs/apibd/v1/sale/',
            '/fs/backups/list/',
            '/fs/dashboard/top-products/',
        ]

        print("\n🧪 CP-MAN-08b: Verificar rechazo sin token")
        print("   ─────────────────────────────────────────────────")

        for url in endpoints:
            res = anon_client.get(url)
            marker = "✅" if res.status_code == 401 else "❌"
            print(f"   {marker} {url}: HTTP {res.status_code}")
            self.assertEqual(res.status_code, 401,
                f"{url} no rechazó petición anónima (HTTP {res.status_code})")

        print("   ─────────────────────────────────────────────────")
        print(f"✅ CP-MAN-08b: Todos los endpoints rechazan peticiones sin token (HTTP 401)")