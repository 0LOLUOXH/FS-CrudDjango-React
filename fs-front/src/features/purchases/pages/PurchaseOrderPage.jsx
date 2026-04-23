import { useEffect, useState, useRef } from 'react';
import { createPurchaseOrder, createPurchaseDetail } from '../../../api/purchases_api';
import { getAllProducts, partialUpdateProduct, getAllModels, getAllBrands } from '../../../api/inventory_api';
import { getAllSuppliers } from '../../../api/suppliers_api';

function PurchaseOrderPage() {
    const TAX_RATE = 0.15; // 15% IVA

    const [formData, setFormData] = useState({
        payment_method: '',
        invoice_number: '',
        date: new Date().toISOString().split('T')[0],
        total_amount: 0,
        supplier: ''
    });

    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [models, setModels] = useState([]);
    const [brands, setBrands] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showProductList, setShowProductList] = useState(false);

    const productDropdownRef = useRef(null);

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event) {
            if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
                setShowProductList(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [productsData, suppliersData, modelsData, brandsData] = await Promise.all([
                    getAllProducts(),
                    getAllSuppliers(),
                    getAllModels(),
                    getAllBrands()
                ]);
                setProducts(productsData.data);
                setSuppliers(suppliersData.data);
                setModels(modelsData.data);
                setBrands(brandsData.data);
            } catch (error) {
                setError('Error al cargar los datos');
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const getModelName = (modelId) => {
        const m = models.find(x => x.id === modelId);
        return m ? m.name : '—';
    };

    const getBrandName = (modelId) => {
        const m = models.find(x => x.id === modelId);
        if (!m) return '—';
        const b = brands.find(x => x.id === m.brand);
        return b ? b.name : '—';
    };

    const filteredProducts = searchTerm
        ? products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : products;

    const addToCart = (product) => {
        if (!product) return;

        const exists = cart.find(item => item.product.id === product.id);

        if (exists) {
            setCart(cart.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: (item.quantity || 0) + 1 }
                    : item
            ));
        } else {
            setCart([
                ...cart,
                { stock: product.stock_quantity, product, quantity: 1, price: '', tax: TAX_RATE }
            ]);
        }

        setSearchTerm('');
        setShowProductList(false);
    };

    const updateQuantity = (productId, quantityStr) => {
        const quantity = quantityStr === '' ? '' : parseInt(quantityStr);
        if (quantity === '' || (!isNaN(quantity) && quantity >= 0)) {
            setCart(cart.map(item =>
                item.product.id === productId
                    ? { ...item, quantity }
                    : item
            ));
        }
    };

    const updatePrice = (productId, priceStr) => {
        const price = priceStr === '' ? '' : parseFloat(priceStr);
        if (price === '' || (!isNaN(price) && price >= 0)) {
            setCart(cart.map(item =>
                item.product.id === productId
                    ? { ...item, price }
                    : item
            ));
        }
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.price === '' ? 0 : parseFloat(item.price);
            const quantity = item.quantity === '' ? 0 : parseInt(item.quantity);
            const subtotal = price * quantity;
            const tax = subtotal * TAX_RATE;
            return total + subtotal + tax;
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.supplier) {
            setError('Seleccione un proveedor');
            return;
        }

        if (cart.length === 0) {
            setError('Agregue productos al carrito');
            return;
        }

        const invalidItems = cart.some(item =>
            item.quantity === '' || isNaN(item.quantity) || item.quantity <= 0 ||
            item.price === '' || isNaN(item.price) || item.price <= 0
        );

        if (invalidItems) {
            setError('Complete correctamente todos los campos de los productos');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const orderRes = await createPurchaseOrder({
                supplier: parseInt(formData.supplier),
                invoice_number: formData.invoice_number,
                date: formData.date,
                payment_method: formData.payment_method,
                total_amount: calculateTotal()
            });
            const order = orderRes.data;

            for (const item of cart) {
                await createPurchaseDetail({
                    purchase_order: order.id,
                    product: item.product.id,
                    quantity: parseInt(item.quantity),
                    unit_price: parseFloat(item.price)
                });

                const newQuantity = item.product.stock_quantity + parseInt(item.quantity);
                await partialUpdateProduct(item.product.id, {
                    stock_quantity: newQuantity
                });
            }

            // Refresh products
            const updatedProducts = await getAllProducts();
            setProducts(updatedProducts.data);

            setFormData({
                payment_method: '',
                invoice_number: '',
                date: new Date().toISOString().split('T')[0],
                total_amount: 0,
                supplier: ''
            });
            setCart([]);
            setSearchTerm('');

            alert('Compra registrada exitosamente!');
        } catch (error) {
            setError('Error al registrar la compra: ' + (error.response?.data?.message || error.message));
            console.error('Error processing purchase:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {error && (
                <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Search & Products */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Productos Disponibles</h2>

                    <div className="mb-4 relative" ref={productDropdownRef}>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Buscar Producto</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Buscar producto..."
                                value={searchTerm}
                                onChange={e => {
                                    setSearchTerm(e.target.value);
                                    setShowProductList(true);
                                }}
                                onFocus={() => setShowProductList(true)}
                            />

                            {showProductList && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {filteredProducts
                                        .filter(p => !cart.some(c => c.product.id === p.id))
                                        .map(product => (
                                            <div
                                                key={product.id}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                                                onClick={() => addToCart(product)}
                                            >
                                                <div>
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-sm text-gray-600">
                                                        Stock: {product.stock_quantity} | Marca: {getBrandName(product.product_model)} | Modelo: {getModelName(product.product_model)}
                                                    </div>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                    Agregar
                                                </button>
                                            </div>
                                        ))
                                    }
                                    {filteredProducts.filter(p => !cart.some(c => c.product.id === p.id)).length === 0 && (
                                        <div className="px-4 py-2 text-gray-500">Todos los productos ya están en el carrito</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-2">Productos en Carrito</h3>

                    {cart.length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay productos en el carrito</p>
                    ) : (
                        <div className="carrito-list mb-4 max-h-64 overflow-y-auto">
                            {cart.map(item => (
                                <div key={item.product.id} className="border-b pb-4 mb-4 px-4 bg-white rounded-lg shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800">{item.product.name}</h4>
                                            <p className="text-sm text-gray-500">
                                                Stock actual: <span className="text-gray-700 font-medium">{item.product.stock_quantity}</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.product.id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Eliminar
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad comprada</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.product.id, e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Precio Unitario ($)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.price}
                                                onChange={(e) => updatePrice(item.product.id, e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">IVA (15%)</label>
                                            <input
                                                type="text"
                                                value={item.price === '' ? '0.00' : (TAX_RATE * parseFloat(item.price) * (item.quantity === '' ? 0 : parseInt(item.quantity))).toFixed(2)}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm bg-gray-100"
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-700 w-full text-right">
                                        Subtotal: <span className="font-semibold">${((item.price === '' ? 0 : parseFloat(item.price)) * (item.quantity === '' ? 0 : parseInt(item.quantity)) * (1 + TAX_RATE)).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </div>

                {/* Purchase Form Details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Detalles de Compra</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Proveedor</label>
                            <select
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Seleccione un proveedor</option>
                                {suppliers.map(supplier => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.company_name} {supplier.tax_id ? `| RUC: ${supplier.tax_id}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1 md:col-span-2">
                                <label className="block text-gray-700 text-sm font-bold mb-2">N° Comprobante / Factura</label>
                                <input
                                    type="text"
                                    name="invoice_number"
                                    value={formData.invoice_number}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Fecha</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Método de Pago</label>
                                <select
                                    name="payment_method"
                                    value={formData.payment_method}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Seleccione método</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                                    <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Crédito">Crédito</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1 pt-4 border-t">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Total a Pagar (USD)</label>
                            <input
                                type="text"
                                value={`$${calculateTotal().toFixed(2)}`}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 font-bold text-lg text-right"
                                readOnly
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || cart.length === 0}
                            className={`w-full px-4 py-2 rounded-lg mt-6 text-white font-medium ${cart.length === 0 || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isLoading ? 'Procesando...' : 'Registrar Compra'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PurchaseOrderPage;
