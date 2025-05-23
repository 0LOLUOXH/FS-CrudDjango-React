import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { fetchProductos, updateProducto, deleteProducto } from "../api/producto_api";
import { fetchBodegas } from "../api/bodega_api";
import { fetchModelos } from "../api/modelo_api";
import { fetchMarcas } from "../api/marca_api";
import { ModeloSelect } from "./modelosandmarca";

const columns = [
  {
    name: "id",
    label: "Codigo",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "nombre",
    label: "Nombre",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "nmodelo",
    label: "Modelo",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "nmarca",
    label: "Marca",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "descripcion",
    label: "Descripcion",
    options: {
      filter: false,
      sort: false,
    }
  },
  {
    name: "bodega",
    label: "Bodega",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "cantidad",
    label: "Cantidad",
    options: {
      filter: true,
      sort: false,
    }
  }, 
];

const options = {
  textLabels: { 
    body: {
      noMatch: "Sorry, no matching records found",
      toolTip: "Sort",
      columnHeaderTooltip: column => `Sort for ${column.label}`
    },
    pagination: {
      next: "Siguiente pagina",
      previous: "Pagina anterior",
      rowsPerPage: "Filas por página",
      displayRows: "de",
      jumpToPage: "Saltar a la pagina",
    },
    toolbar: {
      search: "Busqueda",
      downloadCsv: "Descargar CSV",
      print: "Imprimir",
      viewColumns: "Ver columnas",
      filterTable: "Filtrar tabla",
    },
    filter: {
      all: "Todos",
      title: "Filtros",
      reset: "Restablecer",
    },
    viewColumns: {
      title: "Mostrar Columnas",
      titleAria: "mostrar/ocultar columnas",
    },
    selectedRows: {
      text: "Fila(s) selected",
      delete: "Eliminar",
      deleteAria: "Eliminar fila seleccionada",
    },
  },
  selectableRows: 'none',
  serverSide: true,
  serverSideFilterKey: true,
  download: true,
  print: true,
  downloadOptions: {
    filename: 'inventario.csv',
    separator: ',',
    filterOptions: {
      useDisplayedRowsOnly: true,
      useDisplayedColumnsOnly: true,
    },
  },
  elevation: 3,
  filterType: 'dropdown',
  responsive: 'standard',
  fixedHeader: true,  
  jumpToPage: true,
  rowHover: true,
};

export function Tabla({ data, onUpdate }) {    
  const [showPopup, setShowPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bodegas, setBodegas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [producto, setProducto] = useState({
    nombre: '',
    modelo: '',
    descripcion: '',
    cantidad: '',
    bodega: '',
  });

  // Carga bodegas
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchBodegas();
        setBodegas(res);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handleRowClick = (rowData, rowMeta) => {
    const selected = data[rowMeta.dataIndex];
    setSelectedProduct(selected);
    setProducto({
      nombre: selected.nombre,
      modelo: selected.modelo,
      descripcion: selected.descripcion,
      cantidad: selected.cantidad,
      bodega: selected.codigobodega,
    });
    setShowPopup(true);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setProducto(p => ({ ...p, [name]: value }));
  };

  const handleModeloChange = modeloId => {
    setProducto(p => ({ ...p, modelo: modeloId }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!producto.modelo) {
      alert('Por favor seleccione un modelo');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await updateProducto(selectedProduct.id, {
        ...producto,
        cantidad: Number(producto.cantidad),
        modeloandmarca: Number(producto.modelo),
        codigobodega: Number(producto.bodega),
      });
      setShowPopup(false);
      if (onUpdate) onUpdate(); // Notificar al componente padre para actualizar los datos
    } catch (e) {
      console.error(e);
      setError('Hubo un error al actualizar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await deleteProducto(selectedProduct.id);
        setShowPopup(false);
        if (onUpdate) onUpdate(); // Notificar al componente padre para actualizar los datos
      } catch (e) {
        console.error(e);
        setError('Hubo un error al eliminar el producto');
      }
    }
  };

  // Actualizar las opciones para incluir el handleRowClick
  const tableOptions = {
    ...options,
    onRowClick: handleRowClick
  };

  return (
    <div>
      <MUIDataTable
        title={"Inventario de productos"}
        data={data}
        columns={columns}
        options={tableOptions}
      />

      {/* Popup de edición/eliminación */}
      {showPopup && selectedProduct && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                Editar Producto
              </h2>
              <button
                onClick={() => setShowPopup(false)}
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

            {error && (
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div className="space-y-1">
                <label className="block text-gray-700">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={producto.nombre}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Cantidad */}
              <div className="space-y-1">
                <label className="block text-gray-700">Cantidad</label>
                <input
                  type="number"
                  name="cantidad"
                  value={producto.cantidad}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Modelo / Marca */}
              <div className="space-y-1">
                <label className="block text-gray-700">Marca / Modelo</label>
                <div className="border border-gray-300 rounded-lg focus-within:ring-blue-400 p-1">
                  <ModeloSelect 
                    onModeloChange={handleModeloChange} 
                    defaultValue={producto.modelo}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="block text-gray-700">Descripción</label>
                <textarea
                  name="descripcion"
                  rows="3"
                  value={producto.descripcion}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Bodega */}
              <div className="space-y-1">
                <label className="block text-gray-700">Bodega</label>
                <select
                  name="bodega"
                  value={producto.bodega}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">Seleccione una bodega</option>
                  {bodegas.map(b =>
                    b.estado && (
                      <option key={b.id} value={b.id}>
                        {b.nombre}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Botones */}
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-3 py-3 rounded-lg hover:bg-red-700 transition"
                >
                  Eliminar
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPopup(false)}
                    className="bg-gray-500 text-white px-3 py-3 rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-3 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
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