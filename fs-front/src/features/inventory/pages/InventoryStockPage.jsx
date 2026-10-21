import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllProducts, getAllStocks, createStock, updateStock, deleteStock } from '../../../api/inventory_api';
import { GlassCard, Modal, FloatingInput, Badge } from '../../../components/ui';
import { toast } from 'react-toastify';

export default function InventoryStockPage() {
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
    const [stockTableSearch, setStockTableSearch] = useState('');

    // Obtener productos que no estén ya en el stock
    const productsAvailable = useMemo(() => {
        return products.filter(product => 
            !stocks.some(stock => stock.producto === product.id)
        );
    }, [products, stocks]);

    // Filtrar productos basados en el término de búsqueda
    const filteredProducts = useMemo(() => {
        return productsAvailable.filter(product =>
            (product.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [productsAvailable, searchTerm]);

    const calculatePrices = useCallback(() => {
        const product = products.find(p => p.id === parseInt(selectedProduct));
        const supplierPrice = supplierPrices.find(pp => pp.producto === parseInt(selectedProduct));
        
        if (product) {
            let base = 0;
            if (supplierPrice) {
                base = Number(supplierPrice.precio || 0) + Number(supplierPrice.iva || 0);
            } else {
                base = parseFloat(product.base_price_usd) || 0;
            }
            setSubtotal(base); 
            
            const newFinalPrice = base + parseFloat(profit || 0);
            setFinalPrice(newFinalPrice);
            setAvailableQuantity(product.stock_quantity || 0);
        }
    }, [products, supplierPrices, selectedProduct, profit]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productsRes, stocksRes] = await Promise.allSettled([
                    getAllProducts(),
                    getAllStocks()
                ]);
                
                if (productsRes.status === 'fulfilled') {
                    setProducts(productsRes.value.data || []);
                }
                if (stocksRes.status === 'fulfilled') {
                    setStocks(stocksRes.value.data || []);
                } else {
                    setStocks([]);
                }
                setSupplierPrices([]);
                setError('');
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Error al cargar datos de inventario');
            } finally {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!selectedProduct) {
            setError('Por favor seleccione un producto');
            toast.warn('Seleccione un producto para continuar');
            return;
        }
        
        if (stocks.some(stock => stock.producto === parseInt(selectedProduct))) {
            setError('Este producto ya existe en el stock');
            toast.warn('Este producto ya existe en el stock');
            return;
        }
        
        try {
            const newStock = {
                precio_venta: Number(finalPrice),
                producto: parseInt(selectedProduct),
            };
            
            const response = await createStock(newStock);
            const created = response.data || response;
            setStocks(prev => [...prev, created]);
            toast.success("Producto agregado al stock de venta");
            
            // Reset form
            setSelectedProduct('');
            setProfit(0);
            setSubtotal(0);
            setFinalPrice(0);
            setAvailableQuantity(0);
            setSearchTerm('');
        } catch (err) {
            console.error('Error al crear stock:', err);
            const msg = err.response?.data?.message || err.message || 'Error al crear el stock';
            setError(msg);
            toast.error(msg);
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
        if (!currentStock) return;
        try {
            const updatedStock = await updateStock(currentStock.producto, {
                precio_venta: parseFloat(newPrice)
            });
            const data = updatedStock.data || updatedStock;
            
            setStocks(stocks.map(stock => 
                stock.producto === (data.producto || currentStock.producto) ? { ...stock, precio_venta: parseFloat(newPrice) } : stock
            ));
            setEditModal(false);
            toast.success("Precio actualizado exitosamente");
        } catch (err) {
            console.error('Error al actualizar precio:', err);
            toast.error("Error al actualizar el precio");
        }
    };

    const handleDeleteStock = async () => {
        if (!currentStock) return;
        try {
            await deleteStock(currentStock.producto);
            setStocks(stocks.filter(stock => stock.producto !== currentStock.producto));
            setDeleteModal(false);
            toast.success("Producto eliminado del stock");
        } catch (err) {
            console.error('Error al eliminar stock:', err);
            toast.error("Error al eliminar del stock");
        }
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product.id);
        setIsDropdownOpen(false);
        setSearchTerm(product.name || '');
    };

    // Filtrar tabla de stock
    const filteredStockList = useMemo(() => {
        return stocks.filter(stock => {
            const prod = products.find(p => p.id === stock.producto);
            const name = prod ? prod.name.toLowerCase() : '';
            return name.includes(stockTableSearch.toLowerCase());
        });
    }, [stocks, products, stockTableSearch]);

    // Métricas
    const totalPhysicalUnits = useMemo(() => {
        return products.reduce((acc, p) => acc + (p.stock_quantity || 0), 0);
    }, [products]);

    return (
        <div className="w-full p-4 lg:p-6 space-y-6">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] flex items-center gap-2.5">
                        <i className="fa-solid fa-boxes-stacked text-[var(--primary)]"></i>
                        Ajuste y Precios de Stock
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Definición de márgenes de ganancia y fijación de precios finales de venta al público
                    </p>
                </div>
            </div>

            {/* Tarjetas KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-box-open"></i>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Productos en Catálogo</span>
                        <h3 className="text-2xl font-bold text-[var(--text-main)] mt-0.5">{products.length}</h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-tags"></i>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Precios de Venta Activos</span>
                        <h3 className="text-2xl font-bold text-emerald-500 mt-0.5">{stocks.length}</h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-xl shrink-0">
                        <i className="fa-solid fa-cubes"></i>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Existencias Totales</span>
                        <h3 className="text-2xl font-bold text-[var(--text-main)] mt-0.5">
                            {totalPhysicalUnits.toLocaleString()} <span className="text-xs font-normal text-[var(--text-muted)]">un.</span>
                        </h3>
                    </div>
                </GlassCard>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-3">
                    <i className="fa-solid fa-circle-exclamation text-lg"></i>
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Contenedor 2 Columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Columna Izquierda: Formulario de Fijación de Precio */}
                <div className="lg:col-span-5">
                    <GlassCard className="p-6 space-y-5">
                        <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-glass)]">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center text-lg">
                                <i className="fa-solid fa-plus"></i>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-[var(--text-main)]">Fijar Precio de Venta</h2>
                                <p className="text-xs text-[var(--text-muted)]">Seleccione un producto para calcular su precio final</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Buscador de Producto con Dropdown flotante */}
                            <div className="space-y-1 relative">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                    Producto a Comercializar *
                                </label>
                                <div className="relative">
                                    <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm"></i>
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setIsDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        placeholder="Buscar por nombre de producto..."
                                        required
                                    />
                                    {selectedProduct && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedProduct('');
                                                setSearchTerm('');
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-rose-500"
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    )}
                                </div>

                                {/* Menú desplegable */}
                                {isDropdownOpen && (
                                    <div className="absolute z-20 mt-1 w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border-glass)] shadow-2xl max-h-56 overflow-auto backdrop-blur-xl">
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map(product => (
                                                <div
                                                    key={product.id}
                                                    className="px-4 py-2.5 hover:bg-[var(--primary)]/10 cursor-pointer text-sm text-[var(--text-main)] flex justify-between items-center transition-colors border-b border-[var(--border-glass)]/50 last:border-b-0"
                                                    onClick={() => handleProductSelect(product)}
                                                >
                                                    <div>
                                                        <div className="font-semibold">{product.name}</div>
                                                        <div className="text-xs text-[var(--text-muted)]">Stock físico: {product.stock_quantity || 0} un.</div>
                                                    </div>
                                                    <span className="font-mono text-xs text-emerald-500 font-semibold">
                                                        Base: ${parseFloat(product.base_price_usd || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-xs text-[var(--text-muted)] text-center">
                                                No hay productos pendientes por asignar precio
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Margen de Ganancia */}
                            <FloatingInput
                                label="Ganancia en Dólares ($)"
                                type="number"
                                name="profit"
                                value={profit}
                                onChange={(e) => setProfit(e.target.value)}
                                min="0"
                                step="0.01"
                                required
                                icon={<i className="fa-solid fa-arrow-trend-up text-sm"></i>}
                            />

                            {/* Panel Resumen de Cálculos */}
                            <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-glass)] space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--text-muted)]">Costo Base / Subtotal:</span>
                                    <span className="font-mono font-semibold text-[var(--text-main)]">
                                        ${subtotal.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--text-muted)]">Margen Aplicado:</span>
                                    <span className="font-mono font-semibold text-emerald-500">
                                        +${parseFloat(profit || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-[var(--border-glass)] flex justify-between items-center">
                                    <span className="font-semibold text-sm text-[var(--text-main)]">Precio Final Venta:</span>
                                    <span className="text-xl font-bold text-[var(--primary)] font-mono">
                                        ${finalPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Indicador de Unidades en Bodega */}
                            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card-subtle)] text-xs">
                                <span className="text-[var(--text-muted)]">Unidades disponibles en bodega:</span>
                                <span className="font-semibold text-[var(--text-main)]">{availableQuantity} un.</span>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full shadow-lg shadow-[var(--primary)]/20 py-3"
                            >
                                <i className="fa-solid fa-tag mr-2"></i>
                                Registrar Precio en Stock
                            </button>
                        </form>
                    </GlassCard>
                </div>

                {/* Columna Derecha: Tabla de Productos en Stock */}
                <div className="lg:col-span-7">
                    <GlassCard className="p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[var(--border-glass)]">
                            <div>
                                <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                                    <i className="fa-solid fa-list-check text-[var(--primary)]"></i>
                                    Precios de Venta Establecidos
                                </h2>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {stocks.length} {stocks.length === 1 ? 'producto activo' : 'productos activos'} en catálogo comercial
                                </p>
                            </div>

                            <div className="relative w-full sm:w-64">
                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs"></i>
                                <input
                                    type="text"
                                    placeholder="Filtrar por nombre..."
                                    value={stockTableSearch}
                                    onChange={(e) => setStockTableSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all"
                                />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table-custom">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Precio Venta</th>
                                        <th>Físico</th>
                                        <th className="text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-10">
                                                <i className="fa-solid fa-spinner fa-spin text-xl text-[var(--primary)]"></i>
                                                <p className="text-xs text-[var(--text-muted)] mt-2">Cargando existencias...</p>
                                            </td>
                                        </tr>
                                    ) : filteredStockList.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-10 text-[var(--text-muted)]">
                                                <i className="fa-solid fa-tags text-2xl mb-2 opacity-50 block"></i>
                                                No hay precios de venta registrados aún
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStockList.map(stock => {
                                            const product = products.find(p => p.id === stock.producto);
                                            return (
                                                <tr key={stock.producto}>
                                                    <td>
                                                        <div>
                                                            <div className="font-semibold text-sm text-[var(--text-main)]">
                                                                {product ? product.name : `Producto #${stock.producto}`}
                                                            </div>
                                                            {product?.warehouse && (
                                                                <div className="text-xs text-[var(--text-muted)]">
                                                                    ID Producto: #{stock.producto}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                            ${parseFloat(stock.precio_venta || 0).toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[var(--bg-card-subtle)] text-[var(--text-main)] border border-[var(--border-glass)] font-medium">
                                                            <i className="fa-solid fa-cubes text-[10px] text-[var(--primary)]"></i>
                                                            {stock.cantidad !== undefined ? stock.cantidad : (product?.stock_quantity || 0)} un.
                                                        </span>
                                                    </td>
                                                    <td className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => openEditModal(stock)}
                                                                className="btn btn-icon p-1.5 text-amber-500 hover:bg-amber-500/15 rounded-lg transition-colors"
                                                                title="Editar precio de venta"
                                                            >
                                                                <i className="fa-solid fa-pen-to-square"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(stock)}
                                                                className="btn btn-icon p-1.5 text-rose-500 hover:bg-rose-500/15 rounded-lg transition-colors"
                                                                title="Eliminar de catálogo de venta"
                                                            >
                                                                <i className="fa-solid fa-trash-can"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Modal Editar Precio */}
            <Modal
                isOpen={editModal}
                onClose={() => setEditModal(false)}
                title="Editar Precio de Venta"
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <p className="text-xs text-[var(--text-muted)]">
                        Ingrese el nuevo precio de venta al público para este producto.
                    </p>

                    <FloatingInput
                        label="Nuevo Precio de Venta ($)"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        required
                        icon={<i className="fa-solid fa-dollar-sign text-sm"></i>}
                    />

                    <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-glass)]">
                        <button
                            type="button"
                            onClick={() => setEditModal(false)}
                            className="btn btn-outline"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleUpdatePrice}
                            className="btn btn-primary"
                        >
                            <i className="fa-solid fa-floppy-disk mr-1.5"></i>
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal Confirmar Eliminación */}
            <Modal
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                title="Confirmar Eliminación"
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-3">
                        <i className="fa-solid fa-triangle-exclamation text-xl shrink-0"></i>
                        <p className="text-sm">
                            ¿Está seguro de que desea eliminar este producto del catálogo comercial de precios?
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-glass)]">
                        <button
                            type="button"
                            onClick={() => setDeleteModal(false)}
                            className="btn btn-outline"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteStock}
                            className="btn bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                        >
                            <i className="fa-solid fa-trash-can mr-1.5"></i>
                            Eliminar Stock
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
