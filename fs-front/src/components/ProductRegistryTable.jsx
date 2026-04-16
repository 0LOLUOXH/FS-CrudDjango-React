import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getAllWarehouses
} from "../api/inventory_api";
import { BrandModelSelector } from "./BrandModelSelector";

const columns = [
  {
    name: "id",
    label: "Código",
    options: {
      filter: false,
      sort: true,
    }
  },
  {
    name: "name",
    label: "Nombre",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "product_model",
    label: "Modelo",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "description",
    label: "Descripción",
    options: {
      filter: false,
      sort: true,
    }
  },
  {
    name: "warehouse",
    label: "Bodega",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "stock_quantity",
    label: "Cantidad",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "base_price_usd",
    label: "Precio Venta (USD)",
    options: {
      filter: true,
      sort: true,
      customBodyRender: (value) => `$${parseFloat(value).toFixed(2)}`
    }
  }
];

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
  serverSide: true,
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

export default function ProductRegistryTable() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, warehousesRes] = await Promise.all([
        getAllProducts(),
        getAllWarehouses()
      ]);
      setProducts(productsRes.data);
      setWarehouses(warehousesRes.data.filter(w => w.is_active));
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        base_price_usd: product.base_price_usd,
        product_model: product.product_model,
        warehouse: product.warehouse
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
        ...formData,
        base_price_usd: parseFloat(formData.base_price_usd),
        stock_quantity: 0
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(`Error: ${err.response?.data?.message || err.message || 'Error al guardar producto'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    setLoading(true);
    try {
      await deleteProduct(editingProduct.id);
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setError('Error al eliminar producto');
    } finally {
      setLoading(false);
    }
  };

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
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <MUIDataTable
        title="Inventario de Productos"
        data={products}
        columns={columns}
        options={tableOptions}
      />

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

              <div className="space-y-1">
                <label className="block text-gray-700">Precio Venta (USD) *</label>
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

              <div className="space-y-1">
                <label className="block text-gray-700">Modelo/Marca *</label>
                <BrandModelSelector 
                  onModelChange={handleModelChange} 
                  defaultValue={formData.product_model}
                  required
                />
              </div>

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
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name}
                    </option>
                  ))}
                </select>
              </div>

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

              {editingProduct && (
                <div className="space-y-1">
                  <label className="block text-gray-700">Cantidad en existencia</label>
                  <input
                    type="number"
                    value={editingProduct.stock_quantity}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100"
                  />
                  <p className="text-sm text-gray-500">La cantidad solo se modifica con ventas/compras</p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                {editingProduct && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Eliminar
                  </button>
                )}
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