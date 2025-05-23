import React, { useState } from "react";
import MUIDataTable from "mui-datatables";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";

const options = {
  textLabels: {
    body: {
      noMatch: "No se encontraron registros",
      toolTip: "Ordenar",
    },
    pagination: {
      next: "Siguiente",
      previous: "Anterior",
      rowsPerPage: "Filas por página:",
      displayRows: "de",
    },
    toolbar: {
      search: "Buscar",
      downloadCsv: "Descargar CSV",
      print: "Imprimir",
      viewColumns: "Columnas",
      filterTable: "Filtrar",
    },
    filter: {
      all: "Todos",
      title: "FILTROS",
      reset: "Reiniciar",
    },
    viewColumns: {
      title: "Mostrar Columnas",
      titleAria: "Mostrar/Ocultar Columnas",
    },
    selectedRows: {
      text: "fila(s) seleccionada(s)",
      delete: "Eliminar",
      deleteAria: "Eliminar Filas Seleccionadas",
    },
  },
  filterType: 'dropdown',
  responsive: 'standard',
  selectableRows: 'none',
  rowsPerPage: 10,
  rowsPerPageOptions: [10, 25, 50],
  downloadOptions: {
    filename: 'historial_compras.csv',
    separator: ',',
  },
  print: false,
  elevation: 0,
};

export function TablaCompras({ data }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState(null);
  const [productosDetalle, setProductosDetalle] = useState([]);

  const procesarDatos = (rawData) => {
    if (!Array.isArray(rawData)) return [];

    const comprobantesUnicos = {};
    
    rawData.forEach(item => {
      const comprobanteKey = item.numero_comprobante;
      
      if (!comprobantesUnicos[comprobanteKey]) {
        comprobantesUnicos[comprobanteKey] = {
          id: item.id,
          tipo_comprobante: item.tipo_comprobante,
          numero_comprobante: item.numero_comprobante,
          fecha: item.fecha,
          nproveedor: item.nproveedor,
          total_a_pagar: parseFloat(item.total_a_pagar) || 0,
          productos: []
        };
      }
      
      const precio = parseFloat(item.precio_unitario) || 0;
      const cantidad = parseInt(item.cantidad) || 0;
      const iva = parseFloat(item.iva) || 0;
      const totalProducto = (cantidad * (precio+iva)).toFixed(2);
      
      comprobantesUnicos[comprobanteKey].productos.push({
        id: item.producto,
        nombre: item.nproducto || 'N/A',
        cantidad: cantidad,
        precio_unitario: precio,
        iva: iva,
        total: totalProducto
      });
    });

    return Object.values(comprobantesUnicos);
  };

  const datosProcesados = procesarDatos(data);

  const columns = [
    {
      name: "id",
      label: "ID",
      options: {
        filter: true,
        sort: true,
        display: false
      }
    },
    {
      name: "tipo_comprobante",
      label: "Tipo Comprobante",
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "numero_comprobante",
      label: "N° Comprobante",
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "fecha",
      label: "Fecha",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => new Date(value).toLocaleDateString()
      }
    },
    {
      name: "nproveedor",
      label: "Proveedor",
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "carrito_compras",
      label: "Carrito de Compras",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (_, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const comprobante = datosProcesados[rowIndex];
          
          if (!comprobante || !comprobante.productos) {
            console.error("Datos no disponibles para el comprobante:", comprobante);
            return <Button disabled>Sin productos</Button>;
          }

          return (
            <Button 
              variant="outlined" 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedComprobante(comprobante);
                setProductosDetalle(comprobante.productos);
                setOpenDialog(true);
              }}
            >
              Ver Productos ({comprobante.productos.length})
            </Button>
          );
        }
      }
    },
    {
      name: "total_a_pagar",
      label: "Total",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => `$${parseFloat(value).toFixed(2)}`
      }
    },
  ];

  return (
    <div>
      <MUIDataTable
        title={"Historial de Compras"}
        data={datosProcesados}
        columns={columns}
        options={options}
      />

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalle de Compra: {selectedComprobante?.numero_comprobante} ({selectedComprobante?.tipo_comprobante})
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID Producto</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio Unit.</TableCell>
                  <TableCell align="right">IVA</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productosDetalle?.map((producto, index) => (
                  <TableRow key={index}>
                    <TableCell>{producto.id}</TableCell>
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell align="right">{producto.cantidad}</TableCell>
                    <TableCell align="right">${producto.precio_unitario.toFixed(2)}</TableCell>
                    <TableCell align="right">${producto.iva.toFixed(2)}</TableCell>
                    <TableCell align="right">${producto.total}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} align="right">
                    <strong>Total Compra:</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>${selectedComprobante?.total_a_pagar?.toFixed(2)}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}