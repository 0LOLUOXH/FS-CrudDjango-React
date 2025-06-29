import { useState, useEffect, useRef } from 'react';
import { fetchStocks } from '../api/stock_api';
import { fetchClientes, fetchClientesNaturales, fetchClientesJuridicos } from '../api/clientes_api';
import { createVenta } from '../api/venta_api';
import { createDetalleVenta } from '../api/detalleventa_api';
import { fetchProductos, updateProducto } from '../api/producto_api';
import { useAuth } from '../auth/AuthContext';

function Ventas() {
    const { user } = useAuth();

    // Estados para datos
    const [productos, setProductos] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [clientesNaturales, setClientesNaturales] = useState([]);
    const [clientesJuridicos, setClientesJuridicos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [clienteSearchTerm, setClienteSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isClienteDropdownOpen, setIsClienteDropdownOpen] = useState(false);

    // Referencias para manejar clicks fuera del dropdown
    const clienteDropdownRef = useRef(null);
    const productoDropdownRef = useRef(null);

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
                const [productosData, stocksData, clientesData, naturalesData, juridicosData] = await Promise.all([
                    fetchProductos(),
                    fetchStocks(),
                    fetchClientes(),
                    fetchClientesNaturales(),
                    fetchClientesJuridicos()
                ]);
                
                setProductos(productosData);
                setStocks(stocksData);
                setClientes(clientesData);
                setClientesNaturales(naturalesData);
                setClientesJuridicos(juridicosData);
            } catch (error) {
                setError('Error al cargar datos iniciales');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // Manejador de clicks fuera del dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (clienteDropdownRef.current && !clienteDropdownRef.current.contains(event.target)) {
                setIsClienteDropdownOpen(false);
            }
            if (productoDropdownRef.current && !productoDropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Obtener cliente completo por ID
    const getClienteCompleto = (clienteId) => {
        const cliente = clientes.find(c => c.id === clienteId);
        if (!cliente) return null;

        if (cliente.tipo === 'N') {
            const natural = clientesNaturales.find(n => n.cliente === clienteId);
            return { ...cliente, ...natural };
        } else {
            const juridico = clientesJuridicos.find(j => j.cliente === clienteId);
            return { ...cliente, ...juridico };
        }
    };

    // Filtrar clientes basados en el término de búsqueda
    const filteredClientes = clientes.filter(cliente => {
        if (cliente.tipo === 'N') {
            const natural = clientesNaturales.find(n => n.cliente === cliente.id);
            if (!natural) return false;
            return (
                natural.nombre.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
                natural.apellido.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
                natural.cedula.toLowerCase().includes(clienteSearchTerm.toLowerCase())
            );
        } else {
            const juridico = clientesJuridicos.find(j => j.cliente === cliente.id);
            if (!juridico) return false;
            return (
                juridico.razon_social.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
                (juridico.ruc && juridico.ruc.toLowerCase().includes(clienteSearchTerm.toLowerCase()))
            );
        }
    });

    // Obtener productos con stock disponible
    const productosDisponibles = productos.filter(producto => {
        const stockItem = stocks.find(s => s.producto === producto.id);
        return stockItem && stockItem.cantidad > 0;
    });

    // Filtrar productos basados en el término de búsqueda
    const filteredProductos = productosDisponibles.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Obtener precio de venta de un producto
    const getPrecioVenta = (productoId) => {
        const stockItem = stocks.find(s => s.producto === productoId);
        return stockItem ? stockItem.precio_venta : 0;
    };

    // Obtener stock disponible de un producto
    const getStockDisponible = (productoId) => {
        const stockItem = stocks.find(s => s.producto === productoId);
        return stockItem ? stockItem.cantidad : 0;
    };

    // Agregar al carrito con validación
    const agregarAlCarrito = (producto) => {
        const existe = carrito.find(item => item.producto.id === producto.id);
        const precioVenta = getPrecioVenta(producto.id);
        const stockDisponible = getStockDisponible(producto.id);
        
        if (existe) {
            if (existe.cantidad >= stockDisponible) {
                setError(`No hay suficiente stock de ${producto.nombre}`);
                return;
            }
            setCarrito(carrito.map(item =>
                item.producto.id === producto.id
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
        } else {
            if (stockDisponible < 1) {
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
        setSearchTerm('');
        setIsDropdownOpen(false);
    };

    // Actualizar cantidad en carrito con validación
    const actualizarCantidad = (productoId, cantidad) => {
        const stockDisponible = getStockDisponible(productoId);
        const cantidadNum = parseInt(cantidad) || 0;
        
        if (cantidadNum < 1) return;
        if (cantidadNum > stockDisponible) {
            setError(`No hay suficiente stock (disponible: ${stockDisponible})`);
            return;
        }

        setCarrito(carrito.map(item =>
            item.producto.id === productoId
                ? { ...item, cantidad: cantidadNum }
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

    // Seleccionar cliente
    const seleccionarCliente = (cliente) => {
        setClienteId(cliente.id);
        setClienteSearchTerm(
            cliente.tipo === 'N' ? 
            `${cliente.nombre} ${cliente.apellido}` : 
            cliente.razon_social
        );
        setIsClienteDropdownOpen(false);
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
                empleado: user.user_id,
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
                    preciodelproducto: item.precio
                });

                // Actualizar stock del producto
                const stockActual = stocks.find(s => s.producto === item.producto.id);
                if (stockActual) {
                    const nuevaCantidad = stockActual.cantidad - item.cantidad;
                    await updateProducto(item.producto.id, {
                        cantidad: nuevaCantidad
                    });
                }
            }
            console.log('detalles creados exitosamente:', carrito);
            // 3. Actualizar lista de productos y limpiar formulario
            const [productosActualizados, stocksActualizados] = await Promise.all([
                fetchProductos(),
                fetchStocks()
            ]);
            
            setProductos(productosActualizados);
            setStocks(stocksActualizados);
            setCarrito([]);
            setClienteId('');
            setClienteSearchTerm('');
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
                    
                    <div className="mb-4 relative" ref={productoDropdownRef}>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Buscar Producto</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                placeholder="Buscar producto..."
                            />
                            {isDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {filteredProductos.length > 0 ? (
                                        filteredProductos.map(producto => (
                                            <div
                                                key={producto.id}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                                                onClick={() => agregarAlCarrito(producto)}
                                            >
                                                <div>
                                                    <div className="font-medium">{producto.nombre}</div>
                                                    <div className="text-sm text-gray-600">
                                                        Stock: {getStockDisponible(producto.id)} | 
                                                        Precio: ${getPrecioVenta(producto.id)}
                                                    </div>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                    Agregar
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-gray-500">No se encontraron productos</div>
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
                                                Precio unitario: <span className="text-gray-700 font-medium">${item.precio}</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => eliminarDelCarrito(item.producto.id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Eliminar
                                        </button>
                                    </div>

                                    <div className="flex items-center mt-3">
                                        <label className="mr-2 text-sm font-medium text-gray-700">Cantidad:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={getStockDisponible(item.producto.id) + item.cantidad}
                                            value={item.cantidad}
                                            onChange={(e) => actualizarCantidad(item.producto.id, e.target.value)}
                                            className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-500 ml-3">
                                            (Disponible: {getStockDisponible(item.producto.id)})
                                        </span>
                                    </div>

                                    <div className="mt-2 text-sm text-gray-700">
                                        Subtotal: <span className="font-semibold">C${(item.precio * item.cantidad)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sección del carrito y datos de venta */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Detalles de Venta</h2>
                    
                    <div className="mb-4 relative" ref={clienteDropdownRef}>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Cliente</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={clienteSearchTerm}
                                onChange={(e) => {
                                    setClienteSearchTerm(e.target.value);
                                    setIsClienteDropdownOpen(true);
                                }}
                                onFocus={() => setIsClienteDropdownOpen(true)}
                                placeholder="Buscar cliente..."
                            />
                            <input type="hidden" name="clienteId" value={clienteId} />
                            {isClienteDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {filteredClientes.length > 0 ? (
                                        filteredClientes.map(cliente => {
                                            const clienteCompleto = getClienteCompleto(cliente.id);
                                            if (!clienteCompleto) return null;
                                            
                                            return (
                                                <div
                                                    key={cliente.id}
                                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                                                    onClick={() => seleccionarCliente(clienteCompleto)}
                                                >
                                                    {cliente.tipo === 'N' ? (
                                                        <div>
                                                            <div className="text-sm text-gray-600">Tipo: Natural</div> 
                                                            <div className="font-medium">{clienteCompleto.nombre} {clienteCompleto.apellido}</div>
                                                            <div className="text-sm text-gray-600">Cédula: {clienteCompleto.cedula}</div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="text-sm text-gray-600">Tipo: Juridico</div> 
                                                            <div className="font-medium">{clienteCompleto.razon_social}</div>
                                                            <div className="text-sm text-gray-600">RUC: {clienteCompleto.ruc || 'No especificado'}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="px-4 py-2 text-gray-500">No se encontraron clientes</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Método de Pago</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                <label className="block text-gray-700 text-sm font-bold mb-2">Precio Instalación ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={precioInstalacion}
                                    onChange={(e) => setPrecioInstalacion(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Dirección de Instalación</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    placeholder="Dirección completa"
                                />
                            </div>
                        </>
                    )}       

                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between font-medium text-lg">
                            <span>Subtotal:</span>
                            <span>C${carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0)}</span>
                        </div>
                        {instalacion && (
                            <div className="flex justify-between mt-2">
                                <span className="text-sm">Instalación:</span>
                                <span className="text-sm">${parseFloat(precioInstalacion)}</span>
                            </div>
                        )}
                        <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 font-bold text-lg">
                            <span>Total:</span>
                            <span>C${calcularTotal()}</span>
                        </div>
                    </div>

                    <button
                        onClick={procesarVenta}
                        disabled={carrito.length === 0 || isLoading || !clienteId}
                        className={`w-full px-4 py-2 rounded-lg mt-4 text-white font-medium ${carrito.length === 0 || isLoading || !clienteId ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {isLoading ? 'Procesando...' : 'Finalizar Venta'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Ventas;