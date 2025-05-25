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
  Paper,
  IconButton,
  Tooltip,
  Box,
  TextField
} from '@mui/material';
import MUIDataTable from 'mui-datatables';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { format, parseISO } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const options = {
  textLabels: {
    body: { noMatch: "No se encontraron registros", toolTip: "Ordenar" },
    pagination: {
      next: "Siguiente", previous: "Anterior", rowsPerPage: "Filas por página:", displayRows: "de"
    },
    toolbar: {
      search: "Buscar", downloadCsv: "Descargar CSV", print: "Imprimir", viewColumns: "Columnas", filterTable: "Filtrar"
    },
    filter: { all: "Todos", title: "FILTROS", reset: "Reiniciar" },
    viewColumns: { title: "Mostrar Columnas", titleAria: "Mostrar/Ocultar Columnas" },
    selectedRows: { text: "fila(s) seleccionada(s)", delete: "Eliminar", deleteAria: "Eliminar Filas Seleccionadas" },
  },
  filterType: 'dropdown',
  responsive: 'standard',
  selectableRows: 'none',
  rowsPerPage: 10,
  rowsPerPageOptions: [10, 25, 50],
  downloadOptions: { filename: 'historial_compras.csv', separator: ',' },
  print: true,
  download: false,
  elevation: 0,
  rowHover: true,
};

function TablaVentas({ data }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);

  const adjustDateToLocal = (dateString) => {
    try {
      if (typeof dateString === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return new Date(`${dateString}T12:00:00`);
        }
        return parseISO(dateString);
      }
      return dateString;
    } catch (e) {
      console.error("Error ajustando fecha:", dateString, e);
      return new Date();
    }
  };

  const filtrarPorFechas = (rawData) => {
    if (!Array.isArray(rawData)) return [];

    return rawData.filter(item => {
      const fechaItem = adjustDateToLocal(item.fecha);
      const fechaLocal = new Date(fechaItem);
      fechaLocal.setHours(12, 0, 0, 0);

      if (fechaDesde && fechaLocal < new Date(fechaDesde.setHours(0, 0, 0, 0))) return false;
      if (fechaHasta && fechaLocal > new Date(fechaHasta.setHours(23, 59, 59, 999))) return false;

      return true;
    });
  };

  const datosFiltrados = filtrarPorFechas(data);

  const manejarDialogo = (venta) => {
    setVentaSeleccionada(venta);
    setOpenDialog(true);
  };

  const cerrarDialogo = () => {
    setVentaSeleccionada(null);
    setOpenDialog(false);
  };

  const imprimirVentas = () => {
    const printWindow = window.open('', '_blank');
    const tableRows = datosFiltrados.map(venta => `
      <tr>
        <td>${venta.id}</td>
        <td>${format(new Date(venta.fecha), 'dd/MM/yyyy')}</td>
        <td>${venta.ncliente}</td>
        <td>${venta.nempleado}</td>
        <td>${venta.metodo_de_pago}</td>
        <td>${venta.instalacion ? 'Sí' : 'No'}</td>
        <td>$${parseFloat(venta.total_a_pagar).toFixed(2)}</td>
      </tr>
    `).join('');

    const totalGeneral = datosFiltrados.reduce((sum, v) => sum + parseFloat(v.total_a_pagar), 0).toFixed(2);

    printWindow.document.write(`
      <html><head><title>Historial de Ventas</title>
      <style>
        body { font-family: Arial; margin: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
      </style>
      </head><body>
        <h1>Historial de Ventas</h1>
        <div class="report-info">
          <p><strong>Fecha de generación:</strong> ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          <p><strong>Período:</strong> ${fechaDesde ? format(fechaDesde, 'dd/MM/yyyy') : 'Todo'} - ${fechaHasta ? format(fechaHasta, 'dd/MM/yyyy') : 'Hoy'}</p>
          <p><strong>Cantidad de ventas:</strong> ${datosFiltrados.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Fecha</th><th>Cliente</th><th>Empleado</th><th>Método</th><th>Instalación</th><th>Total</th>
            </tr>
          </thead>
          <tbody>${tableRows}
            <tr><td colspan="6"><strong>Total General</strong></td><td><strong>$${totalGeneral}</strong></td></tr>
          </tbody>
        </table>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const exportarReportePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Historial de Ventas', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 25);
    doc.text(`Período: ${fechaDesde ? format(fechaDesde, 'dd/MM/yyyy') : 'Todo'} - ${fechaHasta ? format(fechaHasta, 'dd/MM/yyyy') : 'Hoy'}`, 14, 30);
    doc.text(`Cantidad de ventas: ${datosFiltrados.length}`, 14, 35);

    const tableData = datosFiltrados.map(venta => [
      venta.id,
      format(new Date(venta.fecha), 'dd/MM/yyyy'),
      venta.ncliente,
      venta.nempleado,
      venta.metodo_de_pago,
      venta.instalacion ? 'Sí' : 'No',
      `$${parseFloat(venta.total_a_pagar).toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['ID', 'Fecha', 'Cliente', 'Empleado', 'Método de Pago', 'Instalación', 'Total']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [64, 64, 64], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 40 }
    });

    const totalGeneral = datosFiltrados.reduce((sum, v) => sum + parseFloat(v.total_a_pagar), 0).toFixed(2);
    autoTable(doc, {
      body: [['Total General', '', '', '', '', '', `$${totalGeneral}`]],
      startY: doc.lastAutoTable.finalY + 5,
      styles: { fontStyle: 'bold' },
      columnStyles: { 6: { halign: 'right' } }
    });

    doc.save(`reporte_ventas_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
  };

  const imprimirDetalleVenta = () => {
    if (!ventaSeleccionada) return;
    const productos = ventaSeleccionada.detalles.map(d => `
      <tr>
        <td>${d.nproducto}</td>
        <td>${d.cantidad_por_producto}</td>
        <td>$${parseFloat(d.preciodelproducto).toFixed(2)}</td>
        <td>$${(d.cantidad_por_producto * d.preciodelproducto).toFixed(2)}</td>
      </tr>`).join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>Detalle de Venta</title>
      <style>
        body { font-family: Arial; margin: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
      </style>
      </head><body>
        <h1>Detalle de Venta</h1>
        <p><strong>Cliente:</strong> ${ventaSeleccionada.ncliente}</p>
        <p><strong>Fecha:</strong> ${format(new Date(ventaSeleccionada.fecha), 'dd/MM/yyyy')}</p>
        <table>
          <thead>
            <tr><th>Producto</th><th>Cantidad</th><th>Precio Unitario ($)</th><th>Subtotal ($)</th></tr>
          </thead>
          <tbody>${productos}
            <tr><td colspan="3"><strong>Total:</strong></td><td><strong>$${ventaSeleccionada.total_a_pagar}</strong></td></tr>
          </tbody>
        </table>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const theme = createTheme({
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '7px 10px',
            fontSize: '0.85rem',
          }
        }
      }
    }
  });

  const exportarDetalleVentaPDF = () => {
    if (!ventaSeleccionada) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Detalle de Venta: ${ventaSeleccionada.id}`, 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Cliente: ${ventaSeleccionada.ncliente}`, 14, 25);
    doc.text(`Fecha: ${format(new Date(ventaSeleccionada.fecha), 'dd/MM/yyyy')}`, 14, 30);

    const tableData = ventaSeleccionada.detalles.map((detalle) => [
      detalle.nproducto,
      detalle.cantidad_por_producto,
      `$${parseFloat(detalle.preciodelproducto).toFixed(2)}`,
      `$${(detalle.cantidad_por_producto * detalle.preciodelproducto).toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['Producto', 'Cantidad', 'Precio Unitario ($)', 'Subtotal ($)']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [64, 64, 64], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    autoTable(doc, {
      body: [['Total', '', '', `$${ventaSeleccionada.total_a_pagar}`]],
      startY: doc.lastAutoTable.finalY + 5,
      styles: { fontStyle: 'bold' },
      columnStyles: { 3: { halign: 'right' } }
    });

    doc.save(`detalle_venta_${ventaSeleccionada.id}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
  };

  const columnas = [
    { name: 'id', label: 'ID Venta', options: { filter: false, sort: true } },
    { name: 'fecha', label: 'Fecha', options: { filter: false, sort: true, customBodyRender: val => format(new Date(val), 'dd/MM/yyyy') } },
    { name: 'ncliente', label: 'Cliente', options: { filter: true, sort: true } },
    { name: 'nempleado', label: 'Empleado', options: { filter: true, sort: true } },
    { name: 'metodo_de_pago', label: 'Método de Pago', options: { filter: true, sort: true } },
    { name: 'instalacion', label: 'Instalación', options: { filter: true, sort: true, customBodyRender: val => (val ? 'Sí' : 'No') } },
    { name: 'precio_instalacion', label: 'Precio Instalación ($)', options: { filter: false, sort: true } },
    { name: 'direccion', label: 'Dirección', options: { filter: false, sort: true } },
    { name: 'total_a_pagar', label: 'Total ($)', options: { filter: false, sort: true } },
    {
      name: 'detalles',
      label: 'Carrito de Ventas',
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const venta = datosFiltrados[dataIndex];
          const cantidad = venta.detalles.length;
          return (
            <Tooltip title="Ver productos">
              <Box
                border={1}
                borderRadius={2}
                paddingX={1.5}
                paddingY={0.5}
                display="inline-block"
                borderColor="primary.main"
                onClick={() => manejarDialogo(venta)}
                sx={{ cursor: 'pointer', userSelect: 'none', fontSize: '0.85rem', color: 'primary.main' }}
              >
                Ver productos ({cantidad})
              </Box>
            </Tooltip>
          );
        }
      }
    }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <DatePicker
              label="Desde"
              value={fechaDesde}
              onChange={(newValue) => {
                if (newValue) {
                  const adjustedDate = new Date(newValue);
                  adjustedDate.setHours(0, 0, 0, 0);
                  setFechaDesde(adjustedDate);
                } else {
                  setFechaDesde(null);
                }
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  style: { width: 150 }
                }
              }}
            />
            <DatePicker
              label="Hasta"
              value={fechaHasta}
              onChange={(newValue) => {
                if (newValue) {
                  const adjustedDate = new Date(newValue);
                  adjustedDate.setHours(23, 59, 59, 999);
                  setFechaHasta(adjustedDate);
                } else {
                  setFechaHasta(null);
                }
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  style: { width: 150 }
                }
              }}
            />
          </Box>
          <Box>
            <Tooltip title="Imprimir reporte completo">
              <IconButton onClick={imprimirVentas} color="primary" style={{ marginRight: 10 }}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar a PDF">
              <IconButton onClick={exportarReportePDF} color="secondary">
                <PictureAsPdfIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <ThemeProvider theme={theme}>
          <MUIDataTable
            title={'Ventas Realizadas'}
            data={datosFiltrados}
            columns={columnas}
            options={options}
          />
        </ThemeProvider>
        <Dialog open={openDialog} onClose={cerrarDialogo} maxWidth="md" fullWidth>
          <DialogTitle>Productos Vendidos</DialogTitle>
          <DialogContent>
            {ventaSeleccionada && (
              <>
                <Box display="flex" justifyContent="flex-end" mb={1} gap={1}>
                  <Tooltip title="Imprimir Detalle">
                    <IconButton onClick={imprimirDetalleVenta} color="primary">
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Exportar Detalle a PDF">
                    <IconButton onClick={exportarDetalleVentaPDF} color="secondary">
                      <PictureAsPdfIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell>Cantidad</TableCell>
                        <TableCell>Precio Unitario ($)</TableCell>
                        <TableCell>Subtotal ($)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ventaSeleccionada.detalles.map((detalle) => (
                        <TableRow key={detalle.id}>
                          <TableCell>{detalle.nproducto}</TableCell>
                          <TableCell>{detalle.cantidad_por_producto}</TableCell>
                          <TableCell>${parseFloat(detalle.preciodelproducto).toFixed(2)}</TableCell>
                          <TableCell>${(detalle.cantidad_por_producto * detalle.preciodelproducto).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right"><strong>Total:</strong></TableCell>
                        <TableCell><strong>${ventaSeleccionada.total_a_pagar}</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={cerrarDialogo} variant="contained" color="primary">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </LocalizationProvider>
  );
}

export default TablaVentas;