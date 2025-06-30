import { useEffect, useState } from 'react';
import { createDetalleProveedor } from '../api/detalleproveedor_api';
import { fetchProductos, updateProducto } from '../api/producto_api';
import { fetchProveedores } from '../api/proveedor_api';
import { createPrecioProveedorProducto } from '../api/precioproveedorproducto_api';

function Compras() {
    const IVA_PORCENTAJE = 0.15; // 15% de IVA en Nicaragua

    // Estados para el formulario principal
    const [formData, setFormData] = useState({
        tipo_comprobante: '',
        metodo_de_pago: '',
        numero_comprobante: '',
        fecha: new Date().toISOString().split('T')[0],
        total_a_pagar: 0,
        proveedor: ''
    });

    // Estados para el carrito
    const [carrito, setCarrito] = useState([]);
    const [productos, setProductos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductList, setShowProductList] = useState(true);

    // Cargar datos iniciales
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [productosData, proveedoresData] = await Promise.all([
                    fetchProductos(),
                    fetchProveedores()
                ]);
                setProductos(productosData);
                setProveedores(proveedoresData);
            } catch (error) {
                setError('Error al cargar los datos');
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // Filtrar productos según búsqueda o mostrar todos
    const filteredProductos = searchTerm 
        ? productos.filter(producto =>
            producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : productos;

    // Agregar producto al carrito
    const agregarAlCarrito = (producto) => {
        console.log('Producto seleccionado:', producto);
        if (!producto) return;
        
        const existeEnCarrito = carrito.find(item => item.producto.id === producto.id);
        
        if (existeEnCarrito) {
            setCarrito(carrito.map(item =>
                item.producto.id === producto.id
                    ? { ...item, cantidad: (item.cantidad || 0) + 1 }
                    : item
            ));
        } else {
            setCarrito([...carrito, {
                stock: producto.cantidad,
                producto,
                cantidad: 0,
                precio: '',
                iva: IVA_PORCENTAJE
            }]);
        }
        
        // Limpiar selección después de agregar
        setSelectedProduct(null);
        setSearchTerm('');
        setShowProductList(true);
    };

    // Actualizar cantidad en carrito
    const actualizarCantidad = (productoId, cantidad) => {
        // Permitir campo vacío o número positivo
        if (cantidad === '' || (!isNaN(cantidad) && cantidad >= 0)) {
            setCarrito(carrito.map(item =>
                item.producto.id === productoId
                    ? { ...item, cantidad }
                    : item
            ));
        }
    };

    // Actualizar precio en carrito
    const actualizarPrecio = (productoId, precio) => {
        // Permitir campo vacío o número positivo
        if (precio === '' || (!isNaN(precio) && precio >= 0)) {
            setCarrito(carrito.map(item =>
                item.producto.id === productoId
                    ? { ...item, precio }
                    : item
            ));
        }
    };

    // Calcular total
    const calcularTotal = () => {
        return carrito.reduce((total, item) => {
            const precio = item.precio === '' ? 0 : parseFloat(item.precio);
            const cantidad = item.cantidad === '' ? 0 : parseInt(item.cantidad);
            const subtotal = precio * cantidad;
            const iva = subtotal * IVA_PORCENTAJE;
            return total + subtotal + iva;
        }, 0);
    };

    // Procesar la compra
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.proveedor) {
            setError('Seleccione un proveedor');
            return;
        }
        
        if (carrito.length === 0) {
            setError('Agregue productos al carrito');
            return;
        }

        // Validar que todos los productos tengan cantidad y precio válidos
        const itemsInvalidos = carrito.some(item => 
            item.cantidad === '' || isNaN(item.cantidad) || item.cantidad <= 0 ||
            item.precio === '' || isNaN(item.precio) || item.precio <= 0
        );

        if (itemsInvalidos) {
            setError('Complete correctamente todos los campos de los productos');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Crear el detalle de proveedor (compra principal)
            for (const item of carrito) {
                await createDetalleProveedor({
                    ...formData,
                    total_a_pagar: calcularTotal(),
                    producto: item.producto.id,
                    cantidad: item.cantidad
                });
            }
            
            // 2. Crear los precios por producto
            for (const item of carrito) {
                await createPrecioProveedorProducto({
                    numero_comprobante: formData.numero_comprobante,
                    precio: parseFloat(item.precio),
                    iva: parseFloat(item.precio) * IVA_PORCENTAJE,
                    producto: item.producto.id,
                    proveedor: formData.proveedor,
                });

                console.log('Precio registrado para producto:', item.producto.id);
                // Verificar si el producto ya tiene un precio registrado
                console.log('Producto en carrito:', formData.numero_comprobante);

                // Actualizar el stock del producto
                const nuevaCantidad = item.producto.cantidad + parseInt(item.cantidad);
                await updateProducto(item.producto.id, {
                    cantidad: nuevaCantidad
                });
            }

            // 3. Limpiar el formulario y carrito
            setFormData({
                tipo_comprobante: '',
                metodo_de_pago: '',
                numero_comprobante: '',
                fecha: new Date().toISOString().split('T')[0],
                total_a_pagar: 0,
                proveedor: ''
            });
            setCarrito([]);
            setSearchTerm('');
            setSelectedProduct(null);
            setShowProductList(true);

            alert('Compra registrada exitosamente!');
        } catch (error) {
            setError('Error al registrar la compra');
            console.error('Error processing purchase:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Eliminar producto del carrito
    const eliminarDelCarrito = (productoId) => {
        setCarrito(carrito.filter(item => item.producto.id !== productoId));
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
                {/* Sección de búsqueda y productos */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Productos Disponibles</h2>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Buscar Producto</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setSelectedProduct(null);
                                    setShowProductList(true);
                                }}
                                onFocus={() => setShowProductList(true)}
                                placeholder="Buscar producto..."
                            />
                            
                            {showProductList && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {filteredProductos
                                        .filter(producto => !carrito.some(item => item.producto.id === producto.id))
                                        .map(producto => (
                                            <div
                                                key={producto.id}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                                                onClick={() => agregarAlCarrito(producto)}
                                            >
                                                <div>
                                                    <div className="font-medium">{producto.nombre}</div>
                                                    <div className="text-sm text-gray-600">
                                                        Stock: {producto.cantidad} | Marca: {producto.nmarca} | Modelo: {producto.nmodelo}
                                                    </div>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                    Agregar
                                                </button>
                                            </div>
                                        ))
                                    }
                                    {filteredProductos.filter(p => !carrito.some(c => c.producto.id === p.id)).length === 0 && (
                                        <div className="px-4 py-2 text-gray-500">Todos los productos ya están en el carrito</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-2">Productos en Carrito</h3>
                    
                    {carrito.length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay productos en el carrito</p>
                    ) : (
                        <div className="carrito-list mb-4 max-h-64 overflow-y-auto">
                            {carrito.map(item => (
                                <div key={item.producto.id} className="border-b pb-4 mb-4 px-4 bg-white rounded-lg shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800">{item.producto.nombre}</h4>
                                            <p className="text-sm text-gray-500">
                                                Stock actual: <span className="text-gray-700 font-medium">{item.cantidad || '0'}</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => eliminarDelCarrito(item.producto.id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Eliminar
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.cantidad}
                                                onChange={(e) => actualizarCantidad(item.producto.id, e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Precio</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.precio}
                                                onChange={(e) => actualizarPrecio(item.producto.id, e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">IVA (15%)</label>
                                            <input
                                                type="text"
                                                value={item.precio === '' ? '0.00' : (IVA_PORCENTAJE * parseFloat(item.precio)).toFixed(2)}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm bg-gray-100"
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                        </div>
                    )}
                </div>

                {/* Sección del formulario de compra */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Detalles de Compra</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Proveedor</label>
                            <select
                                name="proveedor"
                                value={formData.proveedor}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Seleccione un proveedor</option>
                                {proveedores.map(proveedor => (
                                    <option key={proveedor.id} value={proveedor.id}>
                                        {proveedor.razon_social} | Ruc: {proveedor.ruc}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Tipo de Comprobante</label>
                                <select
                                    name="tipo_comprobante"
                                    value={formData.tipo_comprobante}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Seleccione tipo</option>
                                    <option value="Factura">Factura</option>
                                    <option value="Boleta">Boleta</option>
                                    <option value="Nota de Crédito">Nota de Crédito</option>
                                    <option value="Nota de Débito">Nota de Débito</option>
                                </select>
                            </div>
                            
                            <div className="space-y-1">
                                <label className="block text-gray-700 text-sm font-bold mb-2">N° Comprobante</label>
                                <input
                                    type="text"
                                    name="numero_comprobante"
                                    value={formData.numero_comprobante}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-1">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Fecha</label>
                                <input
                                    type="date"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-1">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Método de Pago</label>
                                <select
                                    name="metodo_de_pago"
                                    value={formData.metodo_de_pago}
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
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Total a Pagar</label>
                            <input
                                type="text"
                                value={`C$${calcularTotal().toFixed(2)}`}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                readOnly
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || carrito.length === 0}
                            className={`w-full px-4 py-2 rounded-lg mt-6 text-white font-medium ${carrito.length === 0 || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isLoading ? 'Procesando...' : 'Registrar Compra'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Compras;