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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import MUIDataTable from 'mui-datatables';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { format, parseISO } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import FileDownloadIcon from '@mui/icons-material/FileDownload';


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
  print: false,
  download: false,
  elevation: 0,
  rowHover: true,
};

function TablaVentas({ data }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);
  const [clienteFilter, setClienteFilter] = useState('');
  const [empleadoFilter, setEmpleadoFilter] = useState('');
  const [metodoPagoFilter, setMetodoPagoFilter] = useState('');
  const [instalacionFilter, setInstalacionFilter] = useState('todos');
  const [clientesOptions, setClientesOptions] = useState([]);
  const [empleadosOptions, setEmpleadosOptions] = useState([]);
  const [metodosPagoOptions, setMetodosPagoOptions] = useState([]);

  // Extraer opciones únicas para los filtros
  useEffect(() => {
    if (Array.isArray(data)) {
      const clientesUnicos = [...new Set(data.map(item => item.ncliente))].filter(Boolean);
      const empleadosUnicos = [...new Set(data.map(item => item.nempleado))].filter(Boolean);
      const metodosPagoUnicos = [...new Set(data.map(item => item.metodo_de_pago))].filter(Boolean);
      
      setClientesOptions(clientesUnicos);
      setEmpleadosOptions(empleadosUnicos);
      setMetodosPagoOptions(metodosPagoUnicos);
    }
  }, [data]);

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

  const filtrarVentas = (rawData) => {
    if (!Array.isArray(rawData)) return [];

    return rawData.filter(item => {
      // Filtro por fechas
      const fechaItem = adjustDateToLocal(item.fecha);
      const fechaLocal = new Date(fechaItem);
      fechaLocal.setHours(12, 0, 0, 0);

      if (fechaDesde && fechaLocal < new Date(fechaDesde.setHours(0, 0, 0, 0))) return false;
      if (fechaHasta && fechaLocal > new Date(fechaHasta.setHours(23, 59, 59, 999))) return false;

      // Filtros adicionales
      if (clienteFilter && item.ncliente !== clienteFilter) return false;
      if (empleadoFilter && item.nempleado !== empleadoFilter) return false;
      if (metodoPagoFilter && item.metodo_de_pago !== metodoPagoFilter) return false;
      if (instalacionFilter !== 'todos') {
        const requiereInstalacion = instalacionFilter === 'si';
        if (item.instalacion !== requiereInstalacion) return false;
      }

      return true;
    });
  };

  const datosFiltrados = filtrarVentas(data);

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
        <td>C$${parseFloat(venta.total_a_pagar).toFixed(2)}</td>
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
        .filters { background-color: #f9f9f9; padding: 10px; margin-bottom: 15px; border-radius: 5px; }
        .filter-item { margin-bottom: 5px; }
      </style>
      </head><body>
        <h1>Historial de Ventas</h1>
        <div class="report-info">
          <p><strong>Fecha de generación:</strong> ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          <div class="filters">
            <p><strong>Filtros aplicados:</strong></p>
            <div class="filter-item"><strong>Período:</strong> ${fechaDesde ? format(fechaDesde, 'dd/MM/yyyy') : 'Todo'} - ${fechaHasta ? format(fechaHasta, 'dd/MM/yyyy') : 'Hoy'}</div>
            ${clienteFilter ? `<div class="filter-item"><strong>Cliente:</strong> ${clienteFilter}</div>` : ''}
            ${empleadoFilter ? `<div class="filter-item"><strong>Empleado:</strong> ${empleadoFilter}</div>` : ''}
            ${metodoPagoFilter ? `<div class="filter-item"><strong>Método de Pago:</strong> ${metodoPagoFilter}</div>` : ''}
            ${instalacionFilter !== 'todos' ? `<div class="filter-item"><strong>Instalación:</strong> ${instalacionFilter === 'si' ? 'Sí' : 'No'}</div>` : ''}
          </div>
          <p><strong>Cantidad de ventas:</strong> ${datosFiltrados.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Fecha</th><th>Cliente</th><th>Empleado</th><th>Método</th><th>Instalación</th><th>Total</th>
            </tr>
          </thead>
          <tbody>${tableRows}
            <tr><td colspan="6"><strong>Total General</strong></td><td><strong>C$${totalGeneral}</strong></td></tr>
          </tbody>
        </table>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

 // helper para cargar imagen remota y devolver su DataURL
const loadImageAsDataURL = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';         // importante para esquivar problemas de CORS
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });

const exportarReportePDF = async () => {
  // 1) crear doc
  const doc = new jsPDF();
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 2) cargar logo remoto y convertir a DataURL
  const watermarkUrl = '../public/logo.png';  // <-- tu URL aquí
  let imgDataUrl;
  try {
    imgDataUrl = await loadImageAsDataURL(watermarkUrl);
  } catch (e) {
    console.warn('No se pudo cargar la marca de agua:', e);
  }

  // 3) si lo cargó, dibujar marca de agua
  if (imgDataUrl) {
    doc.setGState(new doc.GState({ opacity: 0.1 }));  // baja opacidad
    const imgProps = doc.getImageProperties(imgDataUrl);
    const imgWidth  = pageWidth * 0.6;  // 60% del ancho de la página
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    const x = (pageWidth  - imgWidth)  / 2;
    const y = (pageHeight - imgHeight) / 2;
    doc.addImage(imgDataUrl, 'PNG', x, y, imgWidth, imgHeight);
    doc.setGState(new doc.GState({ opacity: 1 }));    // restaurar opacidad
  }

  // 4) título
  doc.setFontSize(18);
  doc.text('Historial de Ventas', pageWidth / 2, 15, { align: 'center' });

  // 5) info y filtros
  doc.setFontSize(10);
  doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 25);
  let filtersY = 30;
  doc.text(
    `Período: ${fechaDesde ? format(fechaDesde, 'dd/MM/yyyy') : 'Todo'} - ${fechaHasta ? format(fechaHasta, 'dd/MM/yyyy') : 'Hoy'}`,
    14,
    filtersY
  );
  filtersY += 5;
  if (clienteFilter) {
    doc.text(`Cliente: ${clienteFilter}`, 14, filtersY);
    filtersY += 5;
  }
  if (empleadoFilter) {
    doc.text(`Empleado: ${empleadoFilter}`, 14, filtersY);
    filtersY += 5;
  }
  if (metodoPagoFilter) {
    doc.text(`Método de Pago: ${metodoPagoFilter}`, 14, filtersY);
    filtersY += 5;
  }
  if (instalacionFilter !== 'todos') {
    doc.text(`Instalación: ${instalacionFilter === 'si' ? 'Sí' : 'No'}`, 14, filtersY);
    filtersY += 5;
  }
  doc.text(`Cantidad de ventas: ${datosFiltrados.length}`, 14, filtersY + 5);

  // 6) tabla con autoTable
  const tableData = datosFiltrados.map(v => [
    v.id,
    format(new Date(v.fecha), 'dd/MM/yyyy'),
    v.ncliente,
    v.nempleado,
    v.metodo_de_pago,
    v.instalacion ? 'Sí' : 'No',
    `C$${parseFloat(v.total_a_pagar).toFixed(2)}`
  ]);

  autoTable(doc, {
    head: [['ID', 'Fecha', 'Cliente', 'Empleado', 'Método de Pago', 'Instalación', 'Total']],
    body: tableData,
    startY: filtersY + 15,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [64, 64, 64], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { top: 40 }
  });

  // 7) fila de total general
  const totalGeneral = datosFiltrados
    .reduce((sum, v) => sum + parseFloat(v.total_a_pagar), 0)
    .toFixed(2);

  autoTable(doc, {
    body: [['Total General', '', '', '', '', '', `C$${totalGeneral}`]],
    startY: doc.lastAutoTable.finalY + 5,
    styles: { fontStyle: 'bold' },
    columnStyles: { 6: { halign: 'right' } }
  });

  // 8) guardar
  doc.save(`reporte_ventas_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
};


  const exportarExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Ventas');

  worksheet.columns = [
    { header: 'ID Venta', key: 'id', width: 10 },
    { header: 'Fecha', key: 'fecha', width: 15 },
    { header: 'Cliente', key: 'cliente', width: 25 },
    { header: 'Empleado', key: 'empleado', width: 25 },
    { header: 'Método de Pago', key: 'metodo', width: 20 },
    { header: 'Instalación', key: 'instalacion', width: 15 },
    { header: 'Precio Instalación', key: 'precio_instalacion', width: 20 },
    { header: 'Dirección', key: 'direccion', width: 30 },
    { header: 'Total a Pagar', key: 'total', width: 18 },
    { header: 'Productos', key: 'productos', width: 60 }
  ];

  datosFiltrados.forEach((venta) => {
    const productos = venta.detalles.map(p => {
      const nombre = p.nproducto;
      const cantidad = p.cantidad_por_producto;
      const precio = parseFloat(p.preciodelproducto).toFixed(2);
      return `${nombre} x${cantidad} - C$${precio}`;
    }).join(', ');

    worksheet.addRow({
      id: venta.id,
      fecha: format(new Date(venta.fecha), 'dd/MM/yyyy'),
      cliente: venta.ncliente,
      empleado: venta.nempleado,
      metodo: venta.metodo_de_pago,
      instalacion: venta.instalacion ? 'Sí' : 'No',
      precio_instalacion: parseFloat(venta.precio_instalacion).toFixed(2),
      direccion: venta.direccion,
      total: `C$${parseFloat(venta.total_a_pagar).toFixed(2)}`,
      productos
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `reporte_ventas_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
};


  const imprimirDetalleVenta = () => {
    if (!ventaSeleccionada) return;
    const productos = ventaSeleccionada.detalles.map(d => `
      <tr>
        <td>${d.nproducto}</td>
        <td>${d.cantidad_por_producto}</td>
        <td>C$${parseFloat(d.preciodelproducto).toFixed(2)}</td>
        <td>C$${(d.cantidad_por_producto * d.preciodelproducto).toFixed(2)}</td>
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
            <tr><th>Producto</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th></tr>
          </thead>
          <tbody>${productos}
            <tr><td colspan="3"><strong>Total:</strong></td><td><strong>C$${ventaSeleccionada.total_a_pagar}</strong></td></tr>
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

  const exportarDetalleVentaPDF = async () => {
  if (!ventaSeleccionada) return;

  // 1) crear doc
  const doc = new jsPDF();
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 2) cargar y dibujar la marca de agua
  const watermarkUrl = '../public/logo.png'; // sustituye por tu URL
  try {
    const imgDataUrl = await loadImageAsDataURL(watermarkUrl);
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    const imgProps = doc.getImageProperties(imgDataUrl);
    const imgWidth  = pageWidth * 0.5; // 50% del ancho de la página
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    const x = (pageWidth  - imgWidth)  / 2;
    const y = (pageHeight - imgHeight) / 2;
    doc.addImage(imgDataUrl, 'PNG', x, y, imgWidth, imgHeight);
    doc.setGState(new doc.GState({ opacity: 1 }));
  } catch (e) {
    console.warn('No se pudo cargar la marca de agua:', e);
  }

  // 3) título y cabecera
  doc.setFontSize(16);
  doc.text(`Detalle de Venta: ${ventaSeleccionada.id}`, pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Cliente: ${ventaSeleccionada.ncliente}`, 14, 25);
  doc.text(`Fecha: ${format(new Date(ventaSeleccionada.fecha), 'dd/MM/yyyy')}`, 14, 30);

  // 4) tabla de detalle con autoTable
  const tableData = ventaSeleccionada.detalles.map(detalle => [
    detalle.nproducto,
    detalle.cantidad_por_producto,
    `C$${parseFloat(detalle.preciodelproducto).toFixed(2)}`,
    `C$${(detalle.cantidad_por_producto * detalle.preciodelproducto).toFixed(2)}`
  ]);

  autoTable(doc, {
    head: [['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [64, 64, 64], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  // 5) total al final
  autoTable(doc, {
    body: [['Total', '', '', `C$${ventaSeleccionada.total_a_pagar}`]],
    startY: doc.lastAutoTable.finalY + 5,
    styles: { fontStyle: 'bold' },
    columnStyles: { 3: { halign: 'right' } }
  });

  // 6) guardar PDF
  doc.save(`detalle_venta_${ventaSeleccionada.id}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
};

  const columnas = [
    { name: 'id', label: 'ID Venta', options: { filter: false, sort: true } },
    { name: 'fecha', label: 'Fecha', options: { filter: false, sort: true, customBodyRender: val => format(new Date(val), 'dd/MM/yyyy') } },
    { name: 'ncliente', label: 'Cliente', options: { filter: true, sort: true } },
    { name: 'nempleado', label: 'Empleado', options: { filter: true, sort: true } },
    { name: 'metodo_de_pago', label: 'Método de Pago', options: { filter: true, sort: true } },
    { name: 'instalacion', label: 'Instalación', options: { filter: true, sort: true, customBodyRender: val => (val ? 'Sí' : 'No') } },
    { name: 'precio_instalacion', label: 'Precio Instalación', options: { filter: false, sort: true, customBodyRender: (value) => `C$${parseFloat(value).toFixed(2)}` } },
    { name: 'direccion', label: 'Dirección', options: { filter: false, sort: true } },
    { name: 'total_a_pagar', label: 'Total', options: { filter: false, sort: true, customBodyRender: (value) => `C$${parseFloat(value).toFixed(2)}`} },
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
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
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
            
            <FormControl size="small" style={{ width: 180 }}>
              <InputLabel>Cliente</InputLabel>
              <Select
                value={clienteFilter}
                onChange={(e) => setClienteFilter(e.target.value)}
                label="Cliente"
              >
                <MenuItem value="">Todos los clientes</MenuItem>
                {clientesOptions.map((cliente, index) => (
                  <MenuItem key={index} value={cliente}>{cliente}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" style={{ width: 180 }}>
              <InputLabel>Empleado</InputLabel>
              <Select
                value={empleadoFilter}
                onChange={(e) => setEmpleadoFilter(e.target.value)}
                label="Empleado"
              >
                <MenuItem value="">Todos los empleados</MenuItem>
                {empleadosOptions.map((empleado, index) => (
                  <MenuItem key={index} value={empleado}>{empleado}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" style={{ width: 180 }}>
              <InputLabel>Método de Pago</InputLabel>
              <Select
                value={metodoPagoFilter}
                onChange={(e) => setMetodoPagoFilter(e.target.value)}
                label="Método de Pago"
              >
                <MenuItem value="">Todos los métodos</MenuItem>
                {metodosPagoOptions.map((metodo, index) => (
                  <MenuItem key={index} value={metodo}>{metodo}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" style={{ width: 180 }}>
              <InputLabel>Instalación</InputLabel>
              <Select
                value={instalacionFilter}
                onChange={(e) => setInstalacionFilter(e.target.value)}
                label="Instalación"
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="si">Con instalación</MenuItem>
                <MenuItem value="no">Sin instalación</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Tooltip title="Imprimir reporte completo">
              <IconButton onClick={imprimirVentas} color="primary" style={{ marginRight: 5 }}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar a PDF">
              <IconButton onClick={exportarReportePDF} color="secondary">
                <PictureAsPdfIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar a Excel">
              <IconButton onClick={exportarExcel} color="success">
                <FileDownloadIcon />
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
                        <TableCell>Precio Unitario</TableCell>
                        <TableCell>Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ventaSeleccionada.detalles.map((detalle) => (
                        <TableRow key={detalle.id}>
                          <TableCell>{detalle.nproducto}</TableCell>
                          <TableCell>{detalle.cantidad_por_producto}</TableCell>
                          <TableCell>C${parseFloat(detalle.preciodelproducto).toFixed(2)}</TableCell>
                          <TableCell>C${(detalle.cantidad_por_producto * detalle.preciodelproducto).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right"><strong>Total:</strong></TableCell>
                        <TableCell><strong>C${ventaSeleccionada.total_a_pagar}</strong></TableCell>
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