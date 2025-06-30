import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { 
  fetchProductos, 
  createProducto, 
  updateProducto, 
  deleteProducto 
} from "../api/producto_api";
import { fetchBodegas } from "../api/bodega_api";
import { ModeloSelect } from "../components/modelosandmarca";

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
    name: "nombre",
    label: "Nombre",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "nmodelo",
    label: "Modelo",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "nmarca",
    label: "Marca",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "descripcion",
    label: "Descripción",
    options: {
      filter: false,
      sort: true,
    }
  },
  {
    name: "bodega",
    label: "Bodega",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "cantidad",
    label: "Cantidad",
    options: {
      filter: true,
      sort: true,
    }
  },
  {
    name: "precio_venta",
    label: "Precio Venta",
    options: {
      filter: true,
      sort: true,
      customBodyRender: (value) => `C$${parseFloat(value).toFixed(2)}`
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

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_venta: '',
    modelo: '',
    codigobodega: ''
  });

  // Carga inicial de datos
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productosRes, bodegasRes] = await Promise.all([
        fetchProductos(),
        fetchBodegas()
      ]);
      setProductos(productosRes);
      setBodegas(bodegasRes.filter(b => b.estado));
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear o editar
  const openModal = (producto = null) => {
    if (producto) {
      // Modo edición
      setEditingProducto(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio_venta: producto.precio_venta,
        modelo: producto.modelo,
        codigobodega: producto.codigobodega
      });
    } else {
      // Modo creación
      setFormData({
        nombre: '',
        descripcion: '',
        precio_venta: '',
        modelo: '',
        codigobodega: ''
      });
      setEditingProducto(null);
    }
    setIsModalOpen(true);
  };

  // Manejar cambios en el formulario
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambio de modelo
  const handleModeloChange = modeloId => {
    setFormData(prev => ({ ...prev, modelo: modeloId }));
  };

  // Manejar envío del formulario
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const productoData = {
        ...formData,
        precio_venta: parseFloat(formData.precio_venta),
        modeloandmarca: formData.modelo,
        cantidad: 0 // Siempre 0 para nuevos productos
      };
      const productoData1 = {
        ...formData,
        precio_venta: parseFloat(formData.precio_venta),
        modeloandmarca: formData.modelo,
      };

      if (editingProducto) {
        await updateProducto(editingProducto.id, productoData1);
      } else {
        await createProducto(productoData);
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
      openModal(productos[rowMeta.dataIndex]);
    }
  };

  return (
    <div className="w-full p-4">
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
          {error}
        </div>
      )}
      <p className="text-sm text-center text-gray-500">Haga click en un producto para editarlo</p>

      <MUIDataTable
        title="Inventario de Productos"
        data={productos}
        columns={columns}
        options={tableOptions}
      />

      {/* Modal para crear/editar producto */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
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
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Precio Venta */}
              <div className="space-y-1">
                <label className="block text-gray-700">Precio Venta *</label>
                <input
                  type="number"
                  name="precio_venta"
                  value={formData.precio_venta}
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
                <ModeloSelect 
                  onModeloChange={handleModeloChange} 
                  defaultValue={formData.modelo}
                  required
                />
              </div>

              {/* Bodega */}
              <div className="space-y-1">
                <label className="block text-gray-700">Bodega *</label>
                <select
                  name="codigobodega"
                  value={formData.codigobodega}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">Seleccione una bodega</option>
                  {bodegas.map(bodega => (
                    <option key={bodega.id} value={bodega.id}>
                      {bodega.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="block text-gray-700">Descripción *</label>
                <textarea
                  name="descripcion"
                  rows="3"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Cantidad (solo lectura en edición) */}
              {editingProducto && (
                <div className="space-y-1">
                  <label className="block text-gray-700">Cantidad en existencia</label>
                  <input
                    type="number"
                    value={editingProducto.cantidad}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100"
                  />
                  <p className="text-sm text-gray-500">La cantidad no puede ser modificada</p>
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