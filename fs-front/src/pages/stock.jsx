import { useState, useEffect } from 'react';
import { fetchProductos } from '../api/producto_api';
import { fetchStocks, createStock } from '../api/stock_api';
import { fetchPrecioProveedorProductos } from '../api/precioproveedorproducto_api';

function Stock() {
    const [productos, setProductos] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [preciosProveedor, setPreciosProveedor] = useState([]);
    const [selectedProducto, setSelectedProducto] = useState('');
    const [ganancia, setGanancia] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [precioFinal, setPrecioFinal] = useState(0);
    const [cantidadDisponible, setCantidadDisponible] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productosData, stocksData, preciosData] = await Promise.all([
                    fetchProductos(),
                    fetchStocks(),
                    fetchPrecioProveedorProductos()
                ]);
                
                setProductos(productosData);
                setStocks(stocksData);
                setPreciosProveedor(preciosData);
                setLoading(false);
                console.log('Productos:', productosData);
                console.log('Stocks:', stocksData);
                console.log('Precios:', preciosData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedProducto) {
            calcularPrecios();
        }
    }, [selectedProducto, ganancia]);

    const calcularPrecios = () => {
        const producto = productos.find(p => p.id === parseInt(selectedProducto));
        const precioProveedor = preciosProveedor.find(pp => pp.producto === parseInt(selectedProducto));
        
        if (producto && precioProveedor) {
            // Calcular subtotal (precio + IVA)
            const nuevoSubtotal = Number(precioProveedor.precio)+Number(precioProveedor.iva);
            setSubtotal(nuevoSubtotal); 
            
            // Calcular precio final (subtotal + ganancia)
            const nuevoPrecioFinal = nuevoSubtotal + parseFloat(ganancia);
            setPrecioFinal(nuevoPrecioFinal);
            
            // Obtener cantidad disponible del producto
            setCantidadDisponible(producto.cantidad || 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedProducto || !ganancia) {
            alert('Por favor complete todos los campos');
            return;
        }
        
        try {
            const nuevoStock = {
                precio_venta: parseFloat(precioFinal),
                producto: parseInt(selectedProducto),
            };
            
            const response = await createStock(nuevoStock);
            setStocks([...stocks, response]);
            
            // Reset form
            setSelectedProducto('');
            setGanancia(0);
            setSubtotal(0);
            setPrecioFinal(0);
            setCantidadDisponible(0);
        } catch (error) {
            console.error('Error al crear stock:', error);
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="stock-container p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Agregar Producto al Stock</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Producto</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={selectedProducto}
                                onChange={(e) => setSelectedProducto(e.target.value)}
                                required
                            >
                                <option value="">Seleccione un producto</option>
                                {productos.map(producto => (
                                    <option key={producto.id} value={producto.id}>
                                        {producto.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Ganancia</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={ganancia}
                                onChange={(e) => setGanancia(e.target.value)}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Subtotal (Precio + IVA)</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded bg-gray-100"
                                value={subtotal}
                                readOnly
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Precio Final (Subtotal + Ganancia)</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded bg-gray-100"
                                value={precioFinal}
                                readOnly
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Cantidad Disponible</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded bg-gray-100"
                                value={cantidadDisponible}
                                readOnly
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Agregar al Stock
                        </button>
                    </form>
                </div>
                
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Productos en Stock</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b">Producto</th>
                                    <th className="py-2 px-4 border-b">Precio Venta</th>
                                    <th className="py-2 px-4 border-b">Cantidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.map(stock => {
                                    const producto = productos.find(p => p.id === stock.producto);
                                    return (
                                        <tr key={stock.id}>
                                            <td className="py-2 px-4 border-b">
                                                {producto ? producto.nombre : 'Producto no encontrado'}
                                            </td>
                                            <td className="py-2 px-4 border-b">${stock.precio_venta}</td>
                                            <td className="py-2 px-4 border-b">{stock.cantidad}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Stock;