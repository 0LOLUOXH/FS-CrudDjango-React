import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { format, parseISO } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import FileDownloadIcon from '@mui/icons-material/FileDownload';


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
  print: false,
  download: false,
  elevation: 0,
  rowHover: true,
};

export function TablaCompras({ data }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState(null);
  const [productosDetalle, setProductosDetalle] = useState([]);
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);
  const [proveedorFilter, setProveedorFilter] = useState('');
  const [tipoComprobanteFilter, setTipoComprobanteFilter] = useState('');
  const [proveedoresOptions, setProveedoresOptions] = useState([]);
  const [tipoComprobanteOptions, setTipoComprobanteOptions] = useState([]);

  // Extraer opciones únicas de proveedores y tipos de comprobante
  useEffect(() => {
    if (Array.isArray(data)) {
      const proveedoresUnicos = [...new Set(data.map(item => item.nproveedor))].filter(Boolean);
      const tiposUnicos = [...new Set(data.map(item => item.tipo_comprobante))].filter(Boolean);
      
      setProveedoresOptions(proveedoresUnicos);
      setTipoComprobanteOptions(tiposUnicos);
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

  const procesarDatos = (rawData) => {
    if (!Array.isArray(rawData)) return [];

    const comprobantesUnicos = {};
    
    rawData.forEach(item => {
      // Aplicar filtros
      if (proveedorFilter && item.nproveedor !== proveedorFilter) return;
      if (tipoComprobanteFilter && item.tipo_comprobante !== tipoComprobanteFilter) return;
      
      const fechaItem = adjustDateToLocal(item.fecha);
      const fechaLocal = new Date(fechaItem);
      fechaLocal.setHours(12, 0, 0, 0);

      if (fechaDesde && fechaLocal < new Date(fechaDesde.setHours(0, 0, 0, 0))) return;
      if (fechaHasta && fechaLocal > new Date(fechaHasta.setHours(23, 59, 59, 999))) return;

      const comprobanteKey = item.numero_comprobante;
      
      if (!comprobantesUnicos[comprobanteKey]) {
        comprobantesUnicos[comprobanteKey] = {
          ...item,
          fecha: fechaLocal,
          total_a_pagar: parseFloat(item.total_a_pagar) || 0,
          productos: []
        };
      }
      
      const precio = parseFloat(item.precio_unitario) || 0;
      const cantidad = parseInt(item.cantidad) || 0;
      const iva = parseFloat(item.iva) || 0;
      const totalProducto = (cantidad * (precio + iva)).toFixed(2);
      
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

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    const tableData = datosProcesados.map(comprobante => ({
      tipo: comprobante.tipo_comprobante,
      numero: comprobante.numero_comprobante,
      fecha: format(comprobante.fecha, 'dd/MM/yyyy'),
      proveedor: comprobante.nproveedor,
      total: `C$${comprobante.total_a_pagar.toFixed(2)}`,
      productos: comprobante.productos.length
    }));

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte Completo de Compras</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            .report-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; }
            .footer { margin-top: 30px; font-size: 0.8em; text-align: right; }
            .filters { background-color: #f9f9f9; padding: 10px; margin-bottom: 15px; border-radius: 5px; }
            .filter-item { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h1>Reporte de Compras</h1>
          <div class="report-info">
            <p><strong>Fecha de generación:</strong> ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            <div class="filters">
              <p><strong>Filtros aplicados:</strong></p>
              <div class="filter-item"><strong>Período:</strong> ${fechaDesde ? format(fechaDesde, 'dd/MM/yyyy') : 'Todo'} - ${fechaHasta ? format(fechaHasta, 'dd/MM/yyyy') : 'Hoy'}</div>
              ${proveedorFilter ? `<div class="filter-item"><strong>Proveedor:</strong> ${proveedorFilter}</div>` : ''}
              ${tipoComprobanteFilter ? `<div class="filter-item"><strong>Tipo Comprobante:</strong> ${tipoComprobanteFilter}</div>` : ''}
            </div>
            <p><strong>Cantidad de comprobantes:</strong> ${tableData.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>N° Comprobante</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Productos</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${tableData.map(item => `
                <tr>
                  <td>${item.tipo}</td>
                  <td>${item.numero}</td>
                  <td>${item.fecha}</td>
                  <td>${item.proveedor}</td>
                  <td>${item.productos}</td>
                  <td>${item.total}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5">Total General</td>
                <td>C$${datosProcesados.reduce((sum, item) => sum + item.total_a_pagar, 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            <p>Sistema de Gestión de Inventario Fusion Solar</p>
            <p>${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  // helper para cargar imagen remota y devolver su DataURL
const loadImageAsDataURL = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
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

const handleExportPDF = async () => {
  const doc = new jsPDF();
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1) Marca de agua
  try {
    const watermarkUrl = '../public/logo.png'; // tu URL aquí
    const imgDataUrl   = await loadImageAsDataURL(watermarkUrl);
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    const props = doc.getImageProperties(imgDataUrl);
    const imgW  = pageWidth * 0.6; // 60% ancho
    const imgH  = (props.height * imgW) / props.width;
    const x     = (pageWidth  - imgW)  / 2;
    const y     = (pageHeight - imgH) / 2;
    doc.addImage(imgDataUrl, 'PNG', x, y, imgW, imgH);
    doc.setGState(new doc.GState({ opacity: 1 }));
  } catch (e) {
    console.warn('No se pudo cargar la marca de agua:', e);
  }

  // 2) Título del reporte
  doc.setFontSize(18);
  doc.text('Reporte de Compras', pageWidth / 2, 15, { align: 'center' });

  // 3) Información del reporte
  doc.setFontSize(10);
  doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 25);

  // 4) Filtros aplicados
  let filtersY = 30;
  doc.text(
    `Período: ${fechaDesde ? format(fechaDesde, 'dd/MM/yyyy') : 'Todo'} - ${fechaHasta ? format(fechaHasta, 'dd/MM/yyyy') : 'Hoy'}`,
    14,
    filtersY
  );
  filtersY += 5;
  if (proveedorFilter) {
    doc.text(`Proveedor: ${proveedorFilter}`, 14, filtersY);
    filtersY += 5;
  }
  if (tipoComprobanteFilter) {
    doc.text(`Tipo Comprobante: ${tipoComprobanteFilter}`, 14, filtersY);
    filtersY += 5;
  }
  doc.text(`Cantidad de comprobantes: ${datosProcesados.length}`, 14, filtersY + 5);

  // 5) Tabla de datos
  const tableData = datosProcesados.map(comprobante => [
    comprobante.tipo_comprobante,
    comprobante.numero_comprobante,
    format(comprobante.fecha, 'dd/MM/yyyy'),
    comprobante.nproveedor,
    comprobante.productos.length,
    `C$${comprobante.total_a_pagar.toFixed(2)}`
  ]);

  autoTable(doc, {
    head: [['Tipo', 'N° Comprobante', 'Fecha', 'Proveedor', 'Productos', 'Total']],
    body: tableData,
    startY: filtersY + 15,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [64, 64, 64], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { top: 40 }
  });

  // 6) Total general
  const totalGeneral = datosProcesados
    .reduce((sum, item) => sum + item.total_a_pagar, 0)
    .toFixed(2);

  autoTable(doc, {
    body: [['Total General', '', '', '', '', `C$${totalGeneral}`]],
    startY: doc.lastAutoTable.finalY + 5,
    styles: { fontSize: 9, fontStyle: 'bold', cellPadding: 3 },
    columnStyles: { 5: { fontStyle: 'bold' } }
  });

  // 7) Pie de página
  doc.setFontSize(8);
  doc.text('Sistema de Gestión de inventario Fusion Solar', 14, pageHeight - 10);
  doc.text(format(new Date(), 'dd/MM/yyyy HH:mm'), pageWidth - 14, pageHeight - 10, { align: 'right' });

  // 8) Guardar PDF
  doc.save(`reporte_compras_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
};


  const exportarComprasExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Compras');

  worksheet.columns = [
    { header: 'Tipo Comprobante', key: 'tipo', width: 20 },
    { header: 'N° Comprobante', key: 'numero', width: 20 },
    { header: 'Fecha', key: 'fecha', width: 15 },
    { header: 'Proveedor', key: 'proveedor', width: 25 },
    { header: 'Productos', key: 'productos', width: 70 },
    { header: 'Total a Pagar', key: 'total', width: 18 },
  ];

  datosProcesados.forEach((comprobante) => {
    const productos = comprobante.productos.map(p => {
      const nombre = p.nombre;
      const cantidad = p.cantidad;
      const precio = parseFloat(p.precio_unitario).toFixed(2);
      return `${nombre} x${cantidad} - C$${precio}`;
    }).join(', ');

    worksheet.addRow({
      tipo: comprobante.tipo_comprobante,
      numero: comprobante.numero_comprobante,
      fecha: format(comprobante.fecha, 'dd/MM/yyyy'),
      proveedor: comprobante.nproveedor,
      total: `C$${parseFloat(comprobante.total_a_pagar).toFixed(2)}`,
      productos
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `historial_compras_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
};


  const handleExportDetallePDF = (comprobante, productos) => {
    const doc = new jsPDF();
    
    // Título del reporte
    doc.setFontSize(16);
    doc.text(`Detalle de Compra: ${comprobante.numero_comprobante}`, 105, 15, { align: 'center' });
    
    // Información del comprobante
    doc.setFontSize(10);
    doc.text(`Tipo de comprobante: ${comprobante.tipo_comprobante}`, 14, 25);
    doc.text(`Proveedor: ${comprobante.nproveedor}`, 14, 30);
    doc.text(`Fecha: ${format(comprobante.fecha, 'dd/MM/yyyy')}`, 14, 35);
    
    // Datos de la tabla
    const tableData = productos.map(producto => [
      producto.id,
      producto.nombre,
      producto.cantidad,
      `C$${producto.precio_unitario.toFixed(2)}`,
      `C$${producto.iva.toFixed(2)}`,
      `C$${producto.total}`
    ]);
    
    // Añadir tabla
    autoTable(doc, {
      head: [['ID Producto', 'Nombre', 'Cantidad', 'Precio Unit.', 'IVA', 'Total']],
      body: tableData,
      startY: 45,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [64, 64, 64],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Total compra
    autoTable(doc, {
      body: [['Total Compra', '', '', '', '', `C$${comprobante.total_a_pagar.toFixed(2)}`]],
      startY: doc.lastAutoTable.finalY + 5,
      styles: {
        fontSize: 9,
        fontStyle: 'bold',
        cellPadding: 3,
      },
      columnStyles: {
        5: { halign: 'right', fontStyle: 'bold' }
      }
    });
    
    // Pie de página
    doc.setFontSize(8);
    doc.text('Sistema de Gestión de Inventario Fusion Solar', 14, doc.internal.pageSize.height - 10);
    doc.text(format(new Date(), 'dd/MM/yyyy HH:mm'), 190, doc.internal.pageSize.height - 10, { align: 'right' });
    
    doc.save(`detalle_compra_${comprobante.numero_comprobante}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const columns = [
    {
      name: "id",
      label: "ID",
      options: {
        filter: false,
        sort: false,
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
        filter: false,
        sort: false,
      }
    },
    {
      name: "fecha",
      label: "Fecha",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value) => format(value, 'dd/MM/yyyy')
      }
    },
    {
      name: "nproveedor",
      label: "Proveedor",
      options: {
        filter: true,
        sort: false,
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
          
          if (!comprobante?.productos) {
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
        filter: false,
        sort: false,
        customBodyRender: (value) => `C$${parseFloat(value).toFixed(2)}`
      }
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div>
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
            
            <FormControl size="small" style={{ width: 180 }}>
              <InputLabel>Proveedor</InputLabel>
              <Select
                value={proveedorFilter}
                onChange={(e) => setProveedorFilter(e.target.value)}
                label="Proveedor"
              >
                <MenuItem value="">Todos los proveedores</MenuItem>
                {proveedoresOptions.map((proveedor, index) => (
                  <MenuItem key={index} value={proveedor}>{proveedor}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" style={{ width: 180 }}>
              <InputLabel>Tipo Comprobante</InputLabel>
              <Select
                value={tipoComprobanteFilter}
                onChange={(e) => setTipoComprobanteFilter(e.target.value)}
                label="Tipo Comprobante"
              >
                <MenuItem value="">Todos los tipos</MenuItem>
                {tipoComprobanteOptions.map((tipo, index) => (
                  <MenuItem key={index} value={tipo}>{tipo}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Tooltip title="Imprimir reporte completo">
              <span>
                <IconButton 
                  onClick={handlePrintAll}
                  color="primary"
                  style={{ marginRight: 10 }}
                >
                  <PrintIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Exportar a PDF">
              <span>
                <IconButton 
                  onClick={handleExportPDF}
                  color="secondary"
                >
                  <PictureAsPdfIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Exportar a Excel">
              <span>
                <IconButton onClick={exportarComprasExcel} color="success">
                  <FileDownloadIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                Detalle de Compra: {selectedComprobante?.numero_comprobante} ({selectedComprobante?.tipo_comprobante})
              </span>
              <div>
                <Tooltip title="Imprimir">
                  <IconButton onClick={() => {
                    const content = `
                      <html>
                        <head>
                          <title>Detalle de Compra ${selectedComprobante?.numero_comprobante}</title>
                          <style>
                            body { font-family: Arial; margin: 20px; }
                            h1 { color: #333; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { border: 1px solid #ddd; padding: 8px; }
                            th { background-color: #f2f2f2; }
                          </style>
                        </head>
                        <body>
                          <h1>Detalle de Compra</h1>
                          <p><strong>Comprobante:</strong> ${selectedComprobante?.tipo_comprobante} ${selectedComprobante?.numero_comprobante}</p>
                          <p><strong>Proveedor:</strong> ${selectedComprobante?.nproveedor}</p>
                          <p><strong>Fecha:</strong> ${format(selectedComprobante?.fecha, 'dd/MM/yyyy')}</p>
                          <table>
                            <tr>
                              <th>Producto</th>
                              <th>Cantidad</th>
                              <th>Precio Unit.</th>
                              <th>IVA</th>
                              <th>Total</th>
                            </tr>
                            ${productosDetalle.map(p => `
                              <tr>
                                <td>${p.nombre}</td>
                                <td>${p.cantidad}</td>
                                <td>C$${p.precio_unitario.toFixed(2)}</td>
                                <td>C$${p.iva.toFixed(2)}</td>
                                <td>C$${p.total}</td>
                              </tr>
                            `).join('')}
                            <tr>
                              <td colspan="4"><strong>Total Compra:</strong></td>
                              <td><strong>C$${selectedComprobante?.total_a_pagar?.toFixed(2)}</strong></td>
                            </tr>
                          </table>
                        </body>
                      </html>
                    `;
                    const printWin = window.open('', '_blank');
                    printWin.document.write(content);
                    printWin.document.close();
                    setTimeout(() => printWin.print(), 500);
                  }} color="primary" style={{ marginRight: 8 }}>
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Exportar a PDF">
                  <IconButton 
                    onClick={() => handleExportDetallePDF(selectedComprobante, productosDetalle)} 
                    color="secondary"
                  >
                    <PictureAsPdfIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
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
                      <TableCell align="right">C${producto.precio_unitario.toFixed(2)}</TableCell>
                      <TableCell align="right">C${producto.iva.toFixed(2)}</TableCell>
                      <TableCell align="right">C${producto.total}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={5} align="right">
                      <strong>Total Compra:</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>C${selectedComprobante?.total_a_pagar?.toFixed(2)}</strong>
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
    </LocalizationProvider>
  );
}