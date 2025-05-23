import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";
import { fetchDetalleProveedors, updateDetalleProveedor, deleteDetalleProveedor } from "../api/detalleproveedor_api";
import { fetchProveedores } from "../api/proveedor_api";
import { fetchProductos } from "../api/producto_api";

const columns = [
  {
    name: "id",
    label: "ID",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "tipo_comprobante",
    label: "Tipo Comprobante",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "numero_comprobante",
    label: "N° Comprobante",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "fecha",
    label: "Fecha",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "proveedor",
    label: "Proveedor",
    options: {
      filter: true,
      sort: false,
    }
  },
  {
    name: "producto",
    label: "Producto",
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
  {
    name: "total_a_pagar",
    label: "Total",
    options: {
      filter: true,
      sort: false,
    }
  },
];

const options = {
  textLabels: { 
    body: {
      noMatch: "Lo sentimos, no se encontraron registros coincidentes",
      toolTip: "Ordenar",
      columnHeaderTooltip: column => `Ordenar por ${column.label}`
    },
    pagination: {
      next: "Siguiente página",
      previous: "Página anterior",
      rowsPerPage: "Filas por página",
      displayRows: "de",
      jumpToPage: "Ir a la página",
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
  filterType: 'checkbox',
  selectableRows: 'none',
  serverSide: true,
  serverSideFilterList: true,
  download: true,
  print: true,
  downloadOptions: {
    filename: 'compras.csv',
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

export function TablaCompras({ data, onUpdate }) {    
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [compra, setCompra] = useState({
    tipo_comprobante: '',
    numero_comprobante: '',
    fecha: '',
    metodo_de_pago: '',
    cantidad: '',
    total_a_pagar: '',
    proveedor: '',
    producto: '',
  });

  // Cargar datos iniciales
  useEffect(() => {
    (async () => {
      try {
        const [provRes, prodRes] = await Promise.all([
          fetchProveedores(),
          fetchProductos()
        ]);
        setProveedores(provRes);
        setProductos(prodRes);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handleRowClick = (rowData, rowMeta) => {
    const selected = data[rowMeta.dataIndex];
    setSelectedCompra(selected);
    setCompra({
      tipo_comprobante: selected.tipo_comprobante,
      numero_comprobante: selected.numero_comprobante,
      fecha: selected.fecha,
      metodo_de_pago: selected.metodo_de_pago,
      cantidad: selected.cantidad,
      total_a_pagar: selected.total_a_pagar,
      proveedor: selected.proveedor,
      producto: selected.producto,
    });
    setShowPopup(true);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setCompra(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await updateDetalleProveedor(selectedCompra.id, {
        ...compra,
        cantidad: Number(compra.cantidad),
        total_a_pagar: Number(compra.total_a_pagar),
        proveedor: Number(compra.proveedor),
        producto: Number(compra.producto),
      });
      setShowPopup(false);
      if (onUpdate) onUpdate(); // Notificar al componente padre para actualizar los datos
    } catch (e) {
      console.error(e);
      setError('Hubo un error al actualizar la compra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta compra?')) {
      try {
        await deleteDetalleProveedor(selectedCompra.id);
        setShowPopup(false);
        if (onUpdate) onUpdate(); // Notificar al componente padre para actualizar los datos
      } catch (e) {
        console.error(e);
        setError('Hubo un error al eliminar la compra');
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
        title={"Historial de Compras"}
        data={data}
        columns={columns}
        options={tableOptions}
      />

      {/* Popup de edición/eliminación */}
      {showPopup && selectedCompra && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                Editar Compra
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
              {/* Tipo de Comprobante */}
              <div className="space-y-1">
                <label className="block text-gray-700">Tipo de Comprobante</label>
                <select
                  name="tipo_comprobante"
                  value={compra.tipo_comprobante}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">Seleccione tipo</option>
                  <option value="Factura">Factura</option>
                  <option value="Boleta">Boleta</option>
                  <option value="Nota de Crédito">Nota de Crédito</option>
                  <option value="Nota de Débito">Nota de Débito</option>
                </select>
              </div>

              {/* Número de Comprobante */}
              <div className="space-y-1">
                <label className="block text-gray-700">N° Comprobante</label>
                <input
                  type="text"
                  name="numero_comprobante"
                  value={compra.numero_comprobante}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Fecha */}
              <div className="space-y-1">
                <label className="block text-gray-700">Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  value={compra.fecha}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Método de Pago */}
              <div className="space-y-1">
                <label className="block text-gray-700">Método de Pago</label>
                <select
                  name="metodo_de_pago"
                  value={compra.metodo_de_pago}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">Seleccione método</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {/* Cantidad */}
              <div className="space-y-1">
                <label className="block text-gray-700">Cantidad</label>
                <input
                  type="number"
                  name="cantidad"
                  value={compra.cantidad}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Total a Pagar */}
              <div className="space-y-1">
                <label className="block text-gray-700">Total a Pagar</label>
                <input
                  type="number"
                  name="total_a_pagar"
                  value={compra.total_a_pagar}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Proveedor */}
              <div className="space-y-1">
                <label className="block text-gray-700">Proveedor</label>
                <select
                  name="proveedor"
                  value={compra.proveedor}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.apellido}
                    </option>
                  ))}
                </select>
              </div>

              {/* Producto */}
              <div className="space-y-1">
                <label className="block text-gray-700">Producto</label>
                <select
                  name="producto"
                  value={compra.producto}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">Seleccione un producto</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
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