import React, { useState, useEffect, useCallback } from "react";
import MUIDataTable from "mui-datatables";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  getAllWarehouses,
  getAllModels,
  getAllBrands
} from "../../../api/inventory_api";
import { BrandModelSelector } from "../../../components/BrandModelSelector";

const options = {
  textLabels: { 
    body: {
      noMatch: "No se encontraron registros",
      toolTip: "Ordenar",
      columnHeaderTooltip: column => `Ordenar por ${column.label}`
    },
    pagination: {
      next: "Siguiente página",
      previous: "Página anterior",
      rowsPerPage: "Filas por página",
      displayRows: "de",
      jumpToPage: "Ir a página",
    },
    toolbar: {
      search: "Buscar",
      downloadCsv: "Descargar CSV",
      print: "Imprimir",
      viewColumns: "Ver columnas",
      filterTable: "Filtrar tabla",
    },
    filter: {
      all: "Todos",
      title: "FILTROS",
      reset: "Restablecer",
    },
    viewColumns: {
      title: "Mostrar Columnas",
      titleAria: "Mostrar/Ocultar columnas",
    },
    selectedRows: {
      text: "fila(s) seleccionada(s)",
      delete: "Eliminar",
      deleteAria: "Eliminar filas seleccionadas",
    },
  },
  selectableRows: 'none',
  serverSide: false, // Turn off server-side so filter/sort work fine on frontend
  download: true,
  print: true,
  downloadOptions: {
    filename: 'productos.csv',
    separator: ',',
  },
  elevation: 0,
  responsive: 'standard',
  fixedHeader: true,
  rowHover: true,
};

export default function ProductCatalogPage() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price_usd: '',
    product_model: '',
    warehouse: ''
  });
  const [notificationShown, setNotificationShown] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, warehousesRes, modelsRes, brandsRes] = await Promise.all([
        getAllProducts(),
        getAllWarehouses(),
        getAllModels(),
        getAllBrands()
      ]);
      setProducts(productsRes.data);
      setWarehouses(warehousesRes.data.filter(b => b.is_active));
      setModels(modelsRes.data);
      setBrands(brandsRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error cargando datos');
    } finally {
      setLoading(false);
    }
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

  const getWarehouseName = useCallback((warehouseId) => {
    const w = warehouses.find(x => x.id === warehouseId);
    return w ? w.name : '—';
  }, [warehouses]);

  const showLowStockNotification = useCallback((lowStockProducts) => {
    toast.warn(
      <div>
        <strong>¡Atención! Productos con stock bajo:</strong>
        <div style={{ 
          marginTop: '10px',
          maxHeight: '200px',
          overflowY: 'auto',
          paddingRight: '10px'
        }}>
          {lowStockProducts.map(p => (
            <div key={p.id} style={{ marginBottom: '5px' }}>
              <span style={{ fontWeight: 'bold' }}>{p.name}</span> - 
              <span style={{ color: p.stock_quantity < 5 ? '#ef4444' : '#f59e0b' }}>
                {` ${p.stock_quantity} unidades`}
              </span>
              {p.warehouse && ` (${getWarehouseName(p.warehouse)})`}
            </div>
          ))}
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { width: '400px' },
      }
    );
  }, [getWarehouseName]);

  const checkLowStock = useCallback(() => {
    const lowStock = products.filter(p => p.stock_quantity < p.minimum_stock);
    
    if (lowStock.length > 0 && !notificationShown) {
      showLowStockNotification(lowStock);
      setNotificationShown(true);
    }
  }, [products, notificationShown, showLowStockNotification]);

  // Carga inicial de datos
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Verificar stock bajo cuando se actualizan los productos
  useEffect(() => {
    if (products.length > 0) {
      checkLowStock();
    }
  }, [products, checkLowStock]);

  // Abrir modal para crear o editar
  const openModal = (product = null) => {
    if (product) {
      // Modo edición
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        base_price_usd: product.base_price_usd,
        product_model: product.product_model,
        warehouse: product.warehouse
      });
    } else {
      // Modo creación
      setFormData({
        name: '',
        description: '',
        base_price_usd: '',
        product_model: '',
        warehouse: ''
      });
      setEditingProduct(null);
    }
    setIsModalOpen(true);
  };

  // Manejar cambios en el formulario
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambio de modelo
  const handleModelChange = modelId => {
    setFormData(prev => ({ ...prev, product_model: modelId }));
  };

  // Manejar envío del formulario
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        base_price_usd: parseFloat(formData.base_price_usd),
        product_model: formData.product_model ? parseInt(formData.product_model, 10) : null,
        warehouse: formData.warehouse ? parseInt(formData.warehouse, 10) : null,
        is_kit: false, // Default
        minimum_stock: 5,
        warranty_months: 0
      };

      if (!editingProduct) {
        productData.stock_quantity = 0; // Siempre 0 para nuevos productos
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      await loadData();
      setIsModalOpen(false);
      setNotificationShown(false); // Permitir nueva notificación si hay cambios
    } catch (err) {
      console.error(err);
      setError(`Error: ${err.message || 'Error al guardar producto'}`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: "id",
      label: "Código",
      options: { filter: false, sort: true }
    },
    {
      name: "name",
      label: "Nombre",
      options: { filter: true, sort: true }
    },
    {
      name: "product_model",
      label: "Modelo",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => getModelName(value)
      }
    },
    {
      name: "brand", // Virtual column based on model
      label: "Marca",
      options: {
        filter: false, // We'd need to pre-map it to filter easily
        sort: false,
        customBodyRender: (_, tableMeta) => {
           const rowData = products[tableMeta.dataIndex];
           return rowData ? getBrandName(rowData.product_model) : '—';
        }
      }
    },
    {
      name: "description",
      label: "Descripción",
      options: { filter: false, sort: true }
    },
    {
      name: "warehouse",
      label: "Bodega",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => getWarehouseName(value)
      }
    },
    {
      name: "stock_quantity",
      label: "Cantidad",
      options: { filter: true, sort: true }
    },
    {
      name: "base_price_usd",
      label: "Precio (USD)",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => `$${parseFloat(value).toFixed(2)}`
      }
    }
  ];

  // Configuración adicional para la tabla
  const tableOptions = {
    ...options,
    customToolbar: () => (
      <button 
        onClick={() => openModal()} 
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 ml-2"
      >
        + Nuevo Producto
      </button>
    ),
    onRowClick: (rowData, rowMeta) => {
      openModal(products[rowMeta.dataIndex]);
    }
  };

  return (
    <div className="w-full p-4">
      <ToastContainer 
        position="top-right"
        autoClose={15000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
          {error}
        </div>
      )}
      <p className="text-sm text-center text-gray-500">Haga click en un producto para editarlo</p>

      <MUIDataTable
        title="Inventario de Productos"
        data={products}
        columns={columns}
        options={tableOptions}
      />

      {/* Modal para crear/editar producto */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div className="space-y-1">
                <label className="block text-gray-700">Nombre *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Precio Base USD */}
              <div className="space-y-1">
                <label className="block text-gray-700">Precio (USD) *</label>
                <input
                  type="number"
                  name="base_price_usd"
                  value={formData.base_price_usd}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Modelo / Marca */}
              <div className="space-y-1">
                <label className="block text-gray-700">Modelo/Marca *</label>
                <BrandModelSelector 
                  onModelChange={handleModelChange} 
                  defaultValue={formData.product_model}
                  required
                />
              </div>

              {/* Bodega */}
              <div className="space-y-1">
                <label className="block text-gray-700">Bodega *</label>
                <select
                  name="warehouse"
                  value={formData.warehouse}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">Seleccione una bodega</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="block text-gray-700">Descripción *</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Cantidad (solo lectura en edición) */}
              {editingProduct && (
                <div className="space-y-1">
                  <label className="block text-gray-700">Cantidad en existencia</label>
                  <input
                    type="number"
                    value={editingProduct.stock_quantity}
                    readOnly
                    className={`w-full border border-gray-300 rounded-lg px-4 py-2 ${
                      editingProduct.stock_quantity < 10 ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}
                  />
                  {editingProduct.stock_quantity < 10 && (
                    <p className="text-sm text-yellow-700">
                      ¡Stock bajo! Este producto tiene stock limitado
                    </p>
                  )}
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-between pt-4">
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
