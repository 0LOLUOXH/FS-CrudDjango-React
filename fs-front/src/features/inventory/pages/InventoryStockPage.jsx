import { useState, useEffect, useCallback } from 'react';
import { getAllProducts, getAllStocks, createStock, updateStock, deleteStock } from '../../../api/inventory_api';
// PrecioProveedorProducto no longer exists as a separate concept in the new schema

function InventoryStockPage() {
    const [products, setProducts] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [supplierPrices, setSupplierPrices] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [profit, setProfit] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [finalPrice, setFinalPrice] = useState(0);
    const [availableQuantity, setAvailableQuantity] = useState(0);
    const [loading, setLoading] = useState(true);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [currentStock, setCurrentStock] = useState(null);
    const [newPrice, setNewPrice] = useState(0);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Obtener productos con precios de proveedor que no estén ya en stock
    const productsWithPrice = products.filter(product => 
        supplierPrices.some(pp => pp.producto === product.id) &&
        !stocks.some(stock => stock.producto === product.id)
    );

    // Filtrar productos basados en el término de búsqueda
    const filteredProducts = productsWithPrice.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, stocksData] = await Promise.all([
                    getAllProducts(),
                    getAllStocks()
                ]);
                
                setProducts(productsData.data);
                setStocks(stocksData.data);
                setSupplierPrices([]); // Concept merged into purchase details
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            calculatePrices();
        }
    }, [selectedProduct, calculatePrices]);

    const calculatePrices = useCallback(() => {
        const product = products.find(p => p.id === parseInt(selectedProduct));
        const supplierPrice = supplierPrices.find(pp => pp.producto === parseInt(selectedProduct));
        
        if (product && supplierPrice) {
            const newSubtotal = Number(supplierPrice.precio) + Number(supplierPrice.iva);
            setSubtotal(newSubtotal); 
            
            const newFinalPrice = newSubtotal + parseFloat(profit);
            setFinalPrice(newFinalPrice);
            
            setAvailableQuantity(product.stock_quantity || 0);
        }
    }, [products, supplierPrices, selectedProduct, profit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!selectedProduct || !profit) {
            setError('Por favor complete todos los campos');
            return;
        }
        
        // Validar que el producto no esté ya en stock
        if (stocks.some(stock => stock.producto === parseInt(selectedProduct))) {
            setError('Este producto ya existe en el stock');
            return;
        }
        
        try {
            const newStock = {
                precio_venta: Number(finalPrice),
                producto: parseInt(selectedProduct),
            };
            
            const response = await createStock(newStock);
            setStocks([...stocks, response]);
            
            // Reset form
            setSelectedProduct('');
            setProfit(0);
            setSubtotal(0);
            setFinalPrice(0);
            setAvailableQuantity(0);
            setSearchTerm('');
        } catch (error) {
            console.error('Error al crear stock:', error);
            setError('Error al crear el stock. Por favor intente nuevamente.');
        }
    };

    const openEditModal = (stock) => {
        setCurrentStock(stock);
        setNewPrice(stock.precio_venta);
        setEditModal(true);
    };

    const openDeleteModal = (stock) => {
        setCurrentStock(stock);
        setDeleteModal(true);
    };

    const handleUpdatePrice = async () => {
        try {
            const updatedStock = await updateStock(currentStock.producto, {
                precio_venta: newPrice
            });
            
            setStocks(stocks.map(stock => 
                stock.producto === updatedStock.producto ? updatedStock : stock
            ));
            setEditModal(false);
        } catch (error) {
            console.error('Error al actualizar precio:', error);
        }
    };

    const handleDeleteStock = async () => {
        try {
            await deleteStock(currentStock.producto);
            setStocks(stocks.filter(stock => stock.producto !== currentStock.producto));
            setDeleteModal(false);
        } catch (error) {
            console.error('Error al eliminar stock:', error);
        }
    };

    const handleProductSelect = (productId) => {
        setSelectedProduct(productId);
        setIsDropdownOpen(false);
        setSearchTerm(products.find(p => p.id === productId)?.name || '');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulario para agregar stock */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Agregar Producto al Stock</h2>
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                            <p>{error}</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4 relative">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Producto</label>
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
                                    required
                                />
                                {selectedProduct && (
                                    <input type="hidden" name="producto" value={selectedProduct} />
                                )}
                                {isDropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map(product => (
                                                <div
                                                    key={product.id}
                                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                                                    onClick={() => handleProductSelect(product.id)}
                                                >
                                                    {product.name}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-gray-500">No se encontraron productos</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Ganancia ($)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={profit}
                                onChange={(e) => setProfit(e.target.value)}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Subtotal</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                    value={subtotal.toFixed(2)}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Precio Final</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                    value={finalPrice.toFixed(2)}
                                    readOnly
                                />
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Cantidad Disponible</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                value={availableQuantity}
                                readOnly
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150"
                        >
                            Agregar al Stock
                        </button>
                    </form>
                </div>
                
                {/* Tabla de productos en stock */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Productos en Stock</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stocks.map(stock => {
                                    const product = products.find(p => p.id === stock.producto);
                                    return (
                                        <tr key={stock.producto}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {product ? product.name : 'Producto no encontrado'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">${stock.precio_venta}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{stock.cantidad || 0}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => openEditModal(stock)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(stock)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* Modal para editar precio */}
            {editModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Precio de Venta</h3>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Nuevo Precio</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setEditModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdatePrice}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal para eliminar stock */}
            {deleteModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Eliminación</h3>
                        <p className="mb-6">¿Estás seguro que deseas eliminar este producto del stock?</p>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteStock}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InventoryStockPage;
