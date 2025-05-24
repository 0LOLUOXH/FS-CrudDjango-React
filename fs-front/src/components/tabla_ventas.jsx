import React, { useState } from 'react'
import MUIDataTable from 'mui-datatables'

const options = {
  textLabels: {
    body: {
      noMatch: 'No se encontraron registros',
      toolTip: 'Ordenar',
    },
    pagination: {
      next: 'Siguiente',
      previous: 'Anterior',
      rowsPerPage: 'Filas por página:',
      displayRows: 'de',
    },
    toolbar: {
      search: 'Buscar',
      downloadCsv: 'Descargar CSV',
      print: 'Imprimir',
      viewColumns: 'Ver columnas',
      filterTable: 'Filtrar tabla',
    },
    filter: {
      all: 'Todos',
      title: 'Filtros',
      reset: 'Restablecer',
    },
    viewColumns: {
      title: 'Mostrar Columnas',
      titleAria: 'Mostrar/Ocultar Columnas',
    },
    selectedRows: {
      text: 'Fila(s) seleccionada(s)',
      delete: 'Eliminar',
      deleteAria: 'Eliminar Filas Seleccionadas',
    },
  },
  filterType: 'dropdown',
  responsive: 'standard',
  selectableRows: 'none',
  rowsPerPage: 10,
  rowsPerPageOptions: [10, 25, 50],
  download: false,
  print: false,
  elevation: 0,
}

function TablaVentas({ data }) {
  const {
    id,
    fecha,
    cliente,
    total_a_pagar,
    metodo_de_pago,
    instalacion,
    direccion,
    precio_instalacion,
    detalles
  } = data

  return (
    <div style={{ border: '1px solid #ccc', marginBottom: '20px', padding: '10px' }}>
      <h2>Venta #{id}</h2>
      <p><strong>Fecha:</strong> {new Date(fecha).toLocaleString()}</p>
      <p><strong>Cliente:</strong> {cliente}</p>
      <p><strong>Total a pagar:</strong> ${total_a_pagar}</p>
      <p><strong>Método de pago:</strong> {metodo_de_pago}</p>
      <p><strong>Instalación:</strong> {instalacion ? 'Sí' : 'No'}</p>
      <p><strong>Dirección:</strong> {direccion}</p>
      <p><strong>Precio de instalación:</strong> ${precio_instalacion}</p>

      <h3>Detalles de la venta:</h3>
      {detalles.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid black' }}>Producto</th>
              <th style={{ borderBottom: '1px solid black' }}>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map(detalle => (
              <tr key={detalle.id}>
                <td>{detalle.nproducto}</td>
                <td>{detalle.cantidad_por_producto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay detalles para esta venta.</p>
      )}
    </div>
  )
}

export default TablaVentas
