import { useState, useEffect } from 'react';
import { fetchProductos, updateProducto } from '../api/producto_api';
import { fetchClientes } from '../api/clientes_api';
import { fetchPrecioProveedorProductos } from '../api/precioproveedorproducto_api';
import { createVenta } from '../api/venta_api';
import { createDetalleVenta } from '../api/detalleventa_api';

function Ventas() {
    // Estados para datos
    const [productos, setProductos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [preciosProductos, setPreciosProductos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Estados para el carrito
    const [carrito, setCarrito] = useState([]);
    const [clienteId, setClienteId] = useState('');
    const [metodoPago, setMetodoPago] = useState('Efectivo');
    const [instalacion, setInstalacion] = useState(false);
    const [precioInstalacion, setPrecioInstalacion] = useState(0);
    const [direccion, setDireccion] = useState('');

    // Cargar datos al iniciar
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [productosData, clientesData, preciosData] = await Promise.all([
                    fetchProductos(),
                    fetchClientes(),
                    fetchPrecioProveedorProductos()
                ]);
                setProductos(productosData);
                setClientes(clientesData);
                setPreciosProductos(preciosData);
            } catch (error) {
                setError('Error al cargar datos iniciales');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // Filtrar productos
    const filteredProductos = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Obtener precio de venta de un producto
    const getPrecioVenta = (productoId) => {
        const precio = preciosProductos.find(p => p.producto === productoId);
        return precio ? precio.precio: 0;
    };

    // Agregar al carrito con validación
    const agregarAlCarrito = (producto) => {
        const existe = carrito.find(item => item.producto.id === producto.id);
        const precioVenta = getPrecioVenta(producto.id);
        
        if (existe) {
            if (existe.cantidad >= producto.cantidad) {
                setError(`No hay suficiente stock de ${producto.nombre}`);
                return;
            }
            setCarrito(carrito.map(item =>
                item.producto.id === producto.id
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
        } else {
            if (producto.cantidad < 1) {
                setError(`No hay stock disponible de ${producto.nombre}`);
                return;
            }
            setCarrito([...carrito, {
                producto,
                cantidad: 1,
                precio: precioVenta
            }]);
        }
        setError(null);
    };

    // Actualizar cantidad en carrito con validación
    const actualizarCantidad = (productoId, cantidad) => {
        const producto = productos.find(p => p.id === productoId);
        const itemCarrito = carrito.find(item => item.producto.id === productoId);
        
        if (cantidad < 0) return;
        if (cantidad > producto.cantidad) {
            setError(`No hay suficiente stock (disponible: ${producto.cantidad})`);
            return;
        }

        setCarrito(carrito.map(item =>
            item.producto.id === productoId
                ? { ...item, cantidad: parseInt(cantidad) || 0 }
                : item
        ));
        setError(null);
    };

    // Eliminar del carrito
    const eliminarDelCarrito = (productoId) => {
        setCarrito(carrito.filter(item => item.producto.id !== productoId));
    };

    // Calcular total
    const calcularTotal = () => {
        const subtotal = carrito.reduce((total, item) => {
            return total + (item.precio * item.cantidad);
        }, 0);
        
        return subtotal + (instalacion ? parseFloat(precioInstalacion) || 0 : 0);
    };

    // Procesar venta
    const procesarVenta = async () => {
        if (carrito.length === 0) {
            setError('Agregue productos al carrito');
            return;
        }

        if (!clienteId) {
            setError('Seleccione un cliente');
            return;
        }

        if (instalacion && (!precioInstalacion || isNaN(precioInstalacion))) {
            setError('Ingrese un precio válido para la instalación');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Crear la venta principal
            const ventaData = {
                cliente: clienteId,
                total_a_pagar: calcularTotal(),
                metodo_de_pago: metodoPago,
                instalacion: instalacion,
                direccion: instalacion ? direccion : '',
                precio_instalacion: instalacion ? parseFloat(precioInstalacion) : 0
            };

            const venta = await createVenta(ventaData);

            // 2. Crear detalles de venta y actualizar stock
            for (const item of carrito) {
                // Registrar detalle
                await createDetalleVenta({
                    venta: venta.id,
                    producto: item.producto.id,
                    cantidad_por_producto: item.cantidad,
                    precio_unitario: item.precio
                });

                // Actualizar stock del producto
                const nuevaCantidad = item.producto.cantidad - item.cantidad;
                await updateProducto(item.producto.id, {
                    cantidad: nuevaCantidad
                });
            }

            // 3. Actualizar lista de productos y limpiar formulario
            const productosActualizados = await fetchProductos();
            setProductos(productosActualizados);
            setCarrito([]);
            setClienteId('');
            setPrecioInstalacion(0);
            setDireccion('');
            setInstalacion(false);

            alert('Venta registrada exitosamente!');
        } catch (error) {
            setError('Error al procesar la venta: ' + error.message);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="loading">Cargando...</div>;

    return (
        <div className="ventas-container p-4">
            <h1 className="text-2xl font-bold mb-6">Módulo de Ventas</h1>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sección de búsqueda y productos */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Productos Disponibles</h2>
                    
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="productos-list mb-6 max-h-96 overflow-y-auto">
                        {filteredProductos.map(producto => (
                            <div key={producto.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                                <div className="flex-1">
                                    <h3 className="font-medium">{producto.nombre}</h3>
                                    <p className="text-sm text-gray-600">
                                        {producto.descripcion.substring(0, 50)}...
                                    </p>
                                    <p className="text-sm">
                                        Stock: {producto.cantidad} 
                                    </p>
                                </div>
                                <button
                                    onClick={() => agregarAlCarrito(producto)}
                                    className={`px-3 py-1 rounded ${producto.cantidad <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                    disabled={producto.cantidad <= 0}
                                >
                                    {producto.cantidad <= 0 ? 'Sin stock' : 'Agregar'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sección del carrito y datos de venta */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Detalles de Venta</h2>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                        <select
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={clienteId}
                            onChange={(e) => setClienteId(e.target.value)}
                            required
                        >
                            <option value="">Seleccione un cliente</option>
                            {clientes.map(cliente => (
                                <option key={cliente.id} value={cliente.id}>
                                    {cliente.tipo === 'N' ? 
                                        `${cliente.natural.nombre} ${cliente.natural.apellido}` : 
                                        cliente.juridico.razon_social}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                        <select
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                        >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Transferencia">Transferencia</option>
                        </select>
                    </div>

                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            id="instalacion"
                            className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500"
                            checked={instalacion}
                            onChange={(e) => setInstalacion(e.target.checked)}
                        />
                        <label htmlFor="instalacion" className="text-sm font-medium text-gray-700">
                            ¿Requiere instalación?
                        </label>
                    </div>

                    {instalacion && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Instalación ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={precioInstalacion}
                                    onChange={(e) => setPrecioInstalacion(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Instalación</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    placeholder="Dirección completa"
                                />
                            </div>
                        </>
                    )}

                    <h3 className="text-lg font-semibold mt-6 mb-2">Productos en Carrito</h3>
                    
                    {carrito.length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay productos en el carrito</p>
                    ) : (
                        <div className="carrito-list mb-4 max-h-64 overflow-y-auto">
                            {carrito.map(item => (
                                <div key={item.producto.id} className="border-b pb-3 mb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium">{item.producto.nombre}</h4>
                                            <p className="text-sm text-gray-600">
                                                Precio unitario: ${item.precio.toFixed(2)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => eliminarDelCarrito(item.producto.id)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center mt-2">
                                        <label className="mr-2 text-sm">Cantidad:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={item.producto.cantidad}
                                            value={item.cantidad}
                                            onChange={(e) => actualizarCantidad(item.producto.id, e.target.value)}
                                            className="w-20 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-600 ml-2">
                                            (Disponible: {item.producto.cantidad})
                                        </span>
                                    </div>
                                    <div className="mt-1 text-sm">
                                        Subtotal: ${(item.precio * item.cantidad).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between font-medium text-lg">
                            <span>Subtotal:</span>
                            <span>${carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0).toFixed(2)}</span>
                        </div>
                        {instalacion && (
                            <div className="flex justify-between mt-2">
                                <span className="text-sm">Instalación:</span>
                                <span className="text-sm">${parseFloat(precioInstalacion).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 font-bold text-lg">
                            <span>Total:</span>
                            <span>${calcularTotal().toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={procesarVenta}
                        disabled={carrito.length === 0 || isLoading || !clienteId}
                        className={`w-full px-4 py-2 rounded-lg mt-4 text-white ${carrito.length === 0 || isLoading || !clienteId ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {isLoading ? 'Procesando...' : 'Finalizar Venta'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Ventas;