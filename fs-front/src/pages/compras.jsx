import { useEffect, useState } from 'react';
import { createDetalleProveedor } from '../api/detalleproveedor_api';
import { fetchProductos, updateProducto  } from '../api/producto_api';
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

    // Filtrar productos según búsqueda
    const filteredProductos = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

// Agregar producto al carrito (modificado)
    const agregarAlCarrito = (producto) => {
        const existeEnCarrito = carrito.find(item => item.producto.id === producto.id);
        
        if (existeEnCarrito) {
            setCarrito(carrito.map(item =>
                item.producto.id === producto.id
                    ? { ...item, cantidad: (item.cantidad || 0) + 1 }
                    : item
            ));
        } else {
            setCarrito([...carrito, {
                producto,
                cantidad: '', // Campo vacío inicialmente
                precio: '',   // Campo vacío inicialmente
                iva: IVA_PORCENTAJE // IVA automático
            }]);
        }
    };

    // Actualizar cantidad en carrito (modificado)
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

    // Actualizar precio en carrito (modificado)
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

    // Calcular total (modificado para manejar campos vacíos)
    const calcularTotal = () => {
        return carrito.reduce((total, item) => {
            const precio = item.precio === '' ? 0 : parseFloat(item.precio);
            const cantidad = item.cantidad === '' ? 0 : parseInt(item.cantidad);
            const subtotal = precio * cantidad;
            const iva = subtotal * (IVA_PORCENTAJE);
            return total + subtotal + iva;
        }, 0);
    };

    // Procesar la compra (modificado para validar campos)
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
                    cantidad: carrito.reduce((sum, item) => sum + parseInt(item.cantidad), 0)
                });
            }
            // 2. Crear los precios por producto
            for (const item of carrito) {
                await createPrecioProveedorProducto({
                    precio: parseFloat(item.precio),
                    iva: parseFloat(item.precio) * IVA_PORCENTAJE, // Siempre 15%
                    producto: item.producto.id,
                    proveedor: formData.proveedor,
                });

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

    if (isLoading) return <div className="loading">Cargando datos...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="compras-container">
            <h1>Registro de Compras</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sección de búsqueda y carrito */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Productos</h2>
                    
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="w-full border rounded-lg px-4 py-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="productos-list mb-6">
                        {filteredProductos.map(producto => (
                            <div key={producto.id} className="flex justify-between items-center p-3 border-b">
                                <div>
                                    <h3 className="font-medium">{producto.nombre}</h3>
                                    <h4>{producto.modelo}</h4>
                                    <p className="text-sm text-gray-600">{producto.descripcion.substring(0, 50)}...</p>
                                </div>
                                <button
                                    onClick={() => agregarAlCarrito(producto)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                >
                                    Agregar
                                </button>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-xl font-semibold mb-4">Carrito de Compras</h2>
                    
                    {carrito.length === 0 ? (
                <p className="text-gray-500">No hay productos en el carrito</p>
            ) : (
                <div className="carrito-list">
                    {carrito.map(item => (
                        <div key={item.producto.id} className="border-b pb-4 mb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium">{item.producto.nombre}</h3>
                                    <p className="text-sm text-gray-600">Cantidad: {item.cantidad || '0'}</p>
                                </div>
                                <button
                                    onClick={() => eliminarDelCarrito(item.producto.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Eliminar
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <div>
                                    <label className="block text-sm text-gray-600">Cantidad</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.cantidad}
                                        onChange={(e) => actualizarCantidad(item.producto.id, e.target.value)}
                                        className="w-full border rounded px-2 py-1 text-sm"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">Precio</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.precio}
                                        onChange={(e) => actualizarPrecio(item.producto.id, e.target.value)}
                                        className="w-full border rounded px-2 py-1 text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">IVA (15%)</label>
                                    <input
                                        type="number"
                                        value={IVA_PORCENTAJE*item.precio}
                                        className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between font-medium">
                            <span>Total:</span>
                            <span>${calcularTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
                </div>

                {/* Formulario de compra */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Detalles de la Compra</h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                                <select
                                    name="proveedor"
                                    value={formData.proveedor}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                >
                                    <option value="">Seleccione un proveedor</option>
                                    {proveedores.map(proveedor => (
                                        <option key={proveedor.id} value={proveedor.id}>
                                            {proveedor.nombre} {proveedor.apellido}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Comprobante</label>
                                <select
                                    name="tipo_comprobante"
                                    value={formData.tipo_comprobante}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                >
                                    <option value="">Seleccione tipo</option>
                                    <option value="Factura">Factura</option>
                                    <option value="Boleta">Boleta</option>
                                    <option value="Nota de Crédito">Nota de Crédito</option>
                                    <option value="Nota de Débito">Nota de Débito</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">N° Comprobante</label>
                                <input
                                    type="text"
                                    name="numero_comprobante"
                                    value={formData.numero_comprobante}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                <input
                                    type="date"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                                <select
                                    name="metodo_de_pago"
                                    value={formData.metodo_de_pago}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-2"
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
                            
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total a Pagar</label>
                                <input
                                    type="text"
                                    value={`$${calcularTotal().toFixed(2)}`}
                                    className="w-full border rounded-lg px-4 py-2 bg-gray-100"
                                    readOnly
                                />
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={isLoading || carrito.length === 0}
                                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {isLoading ? 'Procesando...' : 'Registrar Compra'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Compras;