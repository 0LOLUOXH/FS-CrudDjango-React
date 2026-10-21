import React, { useState, useEffect, useCallback, useMemo } from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from '@mui/material/styles';
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
import { GlassCard, Modal, FloatingInput, FloatingSelect } from "../../../components/ui";
import { useTheme } from "../../../contexts/ThemeContext";

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
  serverSide: false,
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
  const { isDark } = useTheme();
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

  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: { main: '#F28C28' },
      secondary: { main: '#3B82F6' },
      background: {
        default: isDark ? '#22262B' : '#FFFFFF',
        paper: isDark ? '#22262B' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#E8EDF2' : '#1E1E24',
        secondary: isDark ? '#9AA6B2' : '#6B7280',
      },
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'transparent' : 'transparent',
            backgroundImage: 'none',
            boxShadow: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '12px 16px',
            fontSize: '0.875rem',
            borderColor: isDark ? '#3A4048' : '#E5E7EB',
            color: isDark ? '#E8EDF2' : '#1E1E24',
          },
        },
      },
    },
  }), [isDark]);

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

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (products.length > 0) {
      checkLowStock();
    }
  }, [products, checkLowStock]);

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        base_price_usd: product.base_price_usd,
        product_model: product.product_model || '',
        warehouse: product.warehouse || ''
      });
    } else {
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

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModelChange = modelId => {
    setFormData(prev => ({ ...prev, product_model: modelId }));
  };

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
        is_kit: false,
        minimum_stock: 5,
        warranty_months: 0
      };

      if (!editingProduct) {
        productData.stock_quantity = 0;
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success("Producto actualizado correctamente");
      } else {
        await createProduct(productData);
        toast.success("Producto creado exitosamente");
      }

      await loadData();
      setIsModalOpen(false);
      setNotificationShown(false);
    } catch (err) {
      console.error(err);
      setError(`Error: ${err.message || 'Error al guardar producto'}`);
      toast.error(`Error al guardar producto: ${err.message || 'Verifique los datos'}`);
    } finally {
      setLoading(false);
    }
  };

  // KPI Metrics
  const totalStockUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.stock_quantity || 0), 0);
  }, [products]);

  const estimatedInventoryValue = useMemo(() => {
    return products.reduce((acc, p) => acc + ((p.stock_quantity || 0) * (parseFloat(p.base_price_usd) || 0)), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => (p.stock_quantity || 0) < (p.minimum_stock || 5)).length;
  }, [products]);

  const columns = [
    {
      name: "id",
      label: "Código",
      options: { 
        filter: false, 
        sort: true,
        customBodyRender: (value) => (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-glass)]">
            #{value}
          </span>
        )
      }
    },
    {
      name: "name",
      label: "Nombre del Producto",
      options: { 
        filter: true, 
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const rowData = products[tableMeta.dataIndex];
          return (
            <div>
              <div className="font-semibold text-[var(--text-main)]">{value}</div>
              {rowData?.description && (
                <div className="text-xs text-[var(--text-muted)] truncate max-w-xs">{rowData.description}</div>
              )}
            </div>
          );
        }
      }
    },
    {
      name: "product_model",
      label: "Modelo",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <span className="text-sm text-[var(--text-main)] font-medium">
            {getModelName(value)}
          </span>
        )
      }
    },
    {
      name: "brand",
      label: "Marca",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (_, tableMeta) => {
           const rowData = products[tableMeta.dataIndex];
           return (
             <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
               <i className="fa-solid fa-tag text-[10px]"></i>
               {rowData ? getBrandName(rowData.product_model) : '—'}
             </span>
           );
        }
      }
    },
    {
      name: "warehouse",
      label: "Bodega",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <span className="text-sm text-[var(--text-muted)] flex items-center gap-1.5">
            <i className="fa-solid fa-warehouse text-xs text-[var(--primary)] opacity-70"></i>
            {getWarehouseName(value)}
          </span>
        )
      }
    },
    {
      name: "stock_quantity",
      label: "Existencias",
      options: { 
        filter: true, 
        sort: true,
        customBodyRender: (value, tableMeta) => {
          const rowData = products[tableMeta.dataIndex];
          const min = rowData?.minimum_stock || 5;
          const isCritical = (value || 0) < min;
          return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isCritical
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
            }`}>
              <i className={`fa-solid ${isCritical ? 'fa-triangle-exclamation' : 'fa-box'}`}></i>
              {value} un.
            </span>
          );
        }
      }
    },
    {
      name: "base_price_usd",
      label: "Precio (USD)",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            ${parseFloat(value || 0).toFixed(2)}
          </span>
        )
      }
    },
    {
      name: "actions",
      label: "Acción",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (_, tableMeta) => {
          const rowData = products[tableMeta.dataIndex];
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal(rowData);
              }}
              className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/15 transition-colors"
              title="Editar producto"
            >
              <i className="fa-solid fa-pen-to-square"></i>
            </button>
          );
        }
      }
    }
  ];

  const tableOptions = {
    ...options,
    onRowClick: (rowData, rowMeta) => {
      openModal(products[rowMeta.dataIndex]);
    }
  };

  return (
    <div className="w-full p-4 lg:p-6 space-y-6">
      <ToastContainer 
        position="top-right"
        autoClose={8000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Header View */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] flex items-center gap-2.5">
            <i className="fa-solid fa-boxes-stacked text-[var(--primary)]"></i>
            Catálogo de Productos
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Gestión de inventario físico, precios base, modelos y asignación en bodegas
          </p>
        </div>

        <button 
          onClick={() => openModal()} 
          className="btn btn-primary shadow-lg shadow-[var(--primary)]/20"
        >
          <i className="fa-solid fa-plus mr-1.5"></i>
          Nuevo Producto
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-3">
          <i className="fa-solid fa-circle-exclamation text-lg"></i>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Quick Metrics KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-boxes-stacked"></i>
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total Productos</span>
            <h3 className="text-2xl font-bold text-[var(--text-main)] mt-0.5">{products.length}</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-cubes-stacked"></i>
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Unidades en Stock</span>
            <h3 className="text-2xl font-bold text-[var(--text-main)] mt-0.5">{totalStockUnits.toLocaleString()}</h3>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-sack-dollar"></i>
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Valor Estimado USD</span>
            <h3 className="text-2xl font-bold text-[var(--text-main)] mt-0.5">
              ${estimatedInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
            lowStockCount > 0 ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-500'
          }`}>
            <i className={`fa-solid ${lowStockCount > 0 ? 'fa-triangle-exclamation' : 'fa-circle-check'}`}></i>
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Stock Crítico</span>
            <h3 className={`text-2xl font-bold mt-0.5 ${lowStockCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {lowStockCount} {lowStockCount === 1 ? 'alerta' : 'alertas'}
            </h3>
          </div>
        </GlassCard>
      </div>

      {/* Main Table Card */}
      <GlassCard className="overflow-hidden p-2 sm:p-4">
        <div className="mb-2 px-2 py-1 text-xs text-[var(--text-muted)] flex items-center gap-1.5">
          <i className="fa-solid fa-circle-info text-[var(--primary)]"></i>
          <span>Haga clic en cualquier fila para inspeccionar o editar el producto.</span>
        </div>

        <ThemeProvider theme={muiTheme}>
          <MUIDataTable
            title=""
            data={products}
            columns={columns}
            options={tableOptions}
          />
        </ThemeProvider>
      </GlassCard>

      {/* Modal Reutilizable para Crear / Editar Producto */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Editar Producto #${editingProduct.id}` : 'Nuevo Producto'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <FloatingInput
            label="Nombre del Producto"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            icon={<i className="fa-solid fa-box text-sm"></i>}
          />

          {/* Precio Base USD */}
          <FloatingInput
            label="Precio Base (USD)"
            type="number"
            name="base_price_usd"
            value={formData.base_price_usd}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            icon={<i className="fa-solid fa-dollar-sign text-sm"></i>}
          />

          {/* Selector de Marca / Modelo */}
          <div className="p-3.5 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-card-subtle)] space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
              <i className="fa-solid fa-layer-group"></i> Clasificación Técnica
            </span>
            <BrandModelSelector 
              onModelChange={handleModelChange} 
              defaultValue={formData.product_model}
              className="mt-1"
            />
          </div>

          {/* Bodega */}
          <FloatingSelect
            label="Bodega Asignada"
            name="warehouse"
            value={formData.warehouse}
            onChange={handleChange}
            required
            icon={<i className="fa-solid fa-warehouse text-sm"></i>}
          >
            <option value="">Seleccione una bodega</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </FloatingSelect>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Descripción detallada *
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Especificaciones técnicas o notas del producto..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-card)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all resize-none"
            />
          </div>

          {/* Indicador de Existencias en Edición */}
          {editingProduct && (
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              editingProduct.stock_quantity < (editingProduct.minimum_stock || 5)
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            }`}>
              <div className="flex items-center gap-3">
                <i className={`text-xl fa-solid ${
                  editingProduct.stock_quantity < (editingProduct.minimum_stock || 5)
                    ? 'fa-triangle-exclamation'
                    : 'fa-cubes'
                }`}></i>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider">Existencia actual en bodega</div>
                  <div className="text-lg font-bold">
                    {editingProduct.stock_quantity} unidades
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-glass)] text-[var(--text-muted)]">
                Solo lectura
              </span>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-glass)]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-1.5"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk mr-1.5"></i>
                  {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
