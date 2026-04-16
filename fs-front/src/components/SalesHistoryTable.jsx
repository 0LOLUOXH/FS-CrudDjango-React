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
  MenuItem
} from '@mui/material';
import MUIDataTable from 'mui-datatables';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, useEffect, useCallback } from 'react';
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
  downloadOptions: { filename: 'historial_ventas.csv', separator: ',' },
  print: false,
  download: false,
  elevation: 0,
  rowHover: true,
};

export function SalesHistoryTable({ data }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [customerFilter, setCustomerFilter] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [installationFilter, setInstallationFilter] = useState('todos');
  const [customersOptions, setCustomersOptions] = useState([]);
  const [sellersOptions, setSellersOptions] = useState([]);
  const [paymentMethodsOptions, setPaymentMethodsOptions] = useState([]);

  useEffect(() => {
    if (Array.isArray(data)) {
      const uniqueCustomers = [...new Set(data.map(item => item.customerName))].filter(Boolean);
      const uniqueSellers = [...new Set(data.map(item => item.seller))].filter(Boolean);
      const uniquePaymentMethods = [...new Set(data.map(item => item.payment_method))].filter(Boolean);
      
      setCustomersOptions(uniqueCustomers);
      setSellersOptions(uniqueSellers);
      setPaymentMethodsOptions(uniquePaymentMethods);
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
      console.error("Error adjusting date:", dateString, e);
      return new Date();
    }
  };

  const filterSales = useCallback((rawData) => {
    if (!Array.isArray(rawData)) return [];

    return rawData.filter(item => {
      const itemDate = adjustDateToLocal(item.date);
      const localDate = new Date(itemDate);
      localDate.setHours(12, 0, 0, 0);

      if (dateFrom && localDate < new Date(dateFrom.setHours(0, 0, 0, 0))) return false;
      if (dateTo && localDate > new Date(dateTo.setHours(23, 59, 59, 999))) return false;

      if (customerFilter && item.customerName !== customerFilter) return false;
      if (sellerFilter && item.seller !== sellerFilter) return false;
      if (paymentMethodFilter && item.payment_method !== paymentMethodFilter) return false;
      
      return true;
    });
  }, [dateFrom, dateTo, customerFilter, sellerFilter, paymentMethodFilter]);

  const filteredData = filterSales(data);

  const handleOpenDialog = (sale) => {
    setSelectedSale(sale);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedSale(null);
    setOpenDialog(false);
  };

  const printSales = () => {
    const printWindow = window.open('', '_blank');
    const tableRows = filteredData.map(sale => `
      <tr>
        <td>${sale.id}</td>
        <td>${format(new Date(sale.date), 'dd/MM/yyyy')}</td>
        <td>${sale.customerName}</td>
        <td>${sale.seller}</td>
        <td>${sale.payment_method}</td>
        <td>${sale.status}</td>
        <td>$${parseFloat(sale.total_amount).toFixed(2)}</td>
      </tr>
    `).join('');

    const grandTotal = filteredData.reduce((sum, v) => sum + parseFloat(v.total_amount), 0).toFixed(2);

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
            <div class="filter-item"><strong>Período:</strong> ${dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'Todo'} - ${dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Hoy'}</div>
            ${customerFilter ? `<div class="filter-item"><strong>Cliente:</strong> ${customerFilter}</div>` : ''}
            ${sellerFilter ? `<div class="filter-item"><strong>Empleado:</strong> ${sellerFilter}</div>` : ''}
            ${paymentMethodFilter ? `<div class="filter-item"><strong>Método de Pago:</strong> ${paymentMethodFilter}</div>` : ''}
          </div>
          <p><strong>Cantidad de ventas:</strong> ${filteredData.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Date</th><th>Customer</th><th>Seller</th><th>Method</th><th>Status</th><th>Total</th>
            </tr>
          </thead>
          <tbody>${tableRows}
              <tr><td colspan="6"><strong>Grand Total</strong></td><td><strong>$${grandTotal}</strong></td></tr>
          </tbody>
        </table>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

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

  const exportPDF = async () => {
    const doc = new jsPDF();
    const pageWidth  = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const watermarkUrl = '/logo.png';
    let imgDataUrl;
    try {
      imgDataUrl = await loadImageAsDataURL(watermarkUrl);
    } catch (e) {
      console.warn('No se pudo cargar la marca de agua:', e);
    }

    if (imgDataUrl) {
      doc.setGState(new doc.GState({ opacity: 0.1 }));
      const imgProps = doc.getImageProperties(imgDataUrl);
      const imgWidth  = pageWidth * 0.6;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      const x = (pageWidth  - imgWidth)  / 2;
      const y = (pageHeight - imgHeight) / 2;
      doc.addImage(imgDataUrl, 'PNG', x, y, imgWidth, imgHeight);
      doc.setGState(new doc.GState({ opacity: 1 }));
    }

    doc.setFontSize(18);
    doc.text('Historial de Ventas', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 25);
    let filtersY = 30;
    doc.text(
      `Período: ${dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'Todo'} - ${dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Hoy'}`,
      14,
      filtersY
    );
    filtersY += 5;
    if (customerFilter) {
      doc.text(`Cliente: ${customerFilter}`, 14, filtersY);
      filtersY += 5;
    }
    if (sellerFilter) {
      doc.text(`Empleado: ${sellerFilter}`, 14, filtersY);
      filtersY += 5;
    }
    if (paymentMethodFilter) {
      doc.text(`Método de Pago: ${paymentMethodFilter}`, 14, filtersY);
      filtersY += 5;
    }
    doc.text(`Cantidad de ventas: ${filteredData.length}`, 14, filtersY + 5);

    const tableData = filteredData.map(v => [
      v.id,
      format(new Date(v.date), 'dd/MM/yyyy'),
      v.customerName,
      v.seller,
      v.payment_method,
      v.status,
      `$${parseFloat(v.total_amount).toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['ID', 'Fecha', 'Cliente', 'Empleado', 'Método de Pago', 'Estado', 'Total']],
      body: tableData,
      startY: filtersY + 15,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [64, 64, 64], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 40 }
    });

    const grandTotal = filteredData
      .reduce((sum, v) => sum + parseFloat(v.total_amount), 0)
      .toFixed(2);

    autoTable(doc, {
      body: [['Total General', '', '', '', '', '', `$${grandTotal}`]],
      startY: doc.lastAutoTable.finalY + 5,
      styles: { fontStyle: 'bold' },
      columnStyles: { 6: { halign: 'right' } }
    });

    doc.save(`sales_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ventas');

    worksheet.columns = [
      { header: 'ID Venta', key: 'id', width: 10 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Empleado', key: 'empleado', width: 25 },
      { header: 'Método de Pago', key: 'metodo', width: 20 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Total a Pagar', key: 'total', width: 18 },
      { header: 'Productos', key: 'productos', width: 60 }
    ];

    filteredData.forEach((sale) => {
      const productsStr = (sale.details || []).map(p => {
        const prodId = p.product;
        const quantity = p.quantity;
        const price = parseFloat(p.unit_price).toFixed(2);
        return `Prod#${prodId} x${quantity} - $${price}`;
      }).join(', ');

      worksheet.addRow({
        id: sale.id,
        fecha: format(new Date(sale.date), 'dd/MM/yyyy'),
        cliente: sale.customerName,
        empleado: sale.seller,
        metodo: sale.payment_method,
        status: sale.status,
        total: `$${parseFloat(sale.total_amount).toFixed(2)}`,
        productos: productsStr
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `sales_history_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
  };

  const printSaleDetail = () => {
    if (!selectedSale) return;
    const productsRows = (selectedSale.details || []).map(d => `
      <tr>
        <td>${d.product}</td>
        <td>${d.quantity}</td>
        <td>$${parseFloat(d.unit_price).toFixed(2)}</td>
        <td>$${(d.quantity * parseFloat(d.unit_price)).toFixed(2)}</td>
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
        <p><strong>Cliente:</strong> ${selectedSale.customerName}</p>
        <p><strong>Fecha:</strong> ${format(new Date(selectedSale.date), 'dd/MM/yyyy')}</p>
        <table>
          <thead>
            <tr><th>Producto</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th></tr>
          </thead>
          <tbody>${productsRows}
            <tr><td colspan="3"><strong>Total:</strong></td><td><strong>$${selectedSale.total_amount}</strong></td></tr>
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

  const exportSaleDetailPDF = async () => {
    if (!selectedSale) return;

    const doc = new jsPDF();
    const pageWidth  = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const watermarkUrl = '/logo.png';
    try {
      const imgDataUrl = await loadImageAsDataURL(watermarkUrl);
      doc.setGState(new doc.GState({ opacity: 0.1 }));
      const imgProps = doc.getImageProperties(imgDataUrl);
      const imgWidth  = pageWidth * 0.5;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      const x = (pageWidth  - imgWidth)  / 2;
      const y = (pageHeight - imgHeight) / 2;
      doc.addImage(imgDataUrl, 'PNG', x, y, imgWidth, imgHeight);
      doc.setGState(new doc.GState({ opacity: 1 }));
    } catch (e) {
      console.warn('No se pudo cargar la marca de agua:', e);
    }

    doc.setFontSize(16);
    doc.text(`Detalle de Venta: ${selectedSale.id}`, pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Cliente: ${selectedSale.customerName}`, 14, 25);
    doc.text(`Fecha: ${format(new Date(selectedSale.date), 'dd/MM/yyyy')}`, 14, 30);

    const tableData = (selectedSale.details || []).map(detalle => [
      detalle.product,
      detalle.quantity,
      `$${parseFloat(detalle.unit_price).toFixed(2)}`,
      `$${(detalle.quantity * parseFloat(detalle.unit_price)).toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [64, 64, 64], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    autoTable(doc, {
      body: [['Total', '', '', `$${selectedSale.total_amount}`]],
      startY: doc.lastAutoTable.finalY + 5,
      styles: { fontStyle: 'bold' },
      columnStyles: { 3: { halign: 'right' } }
    });

    doc.save(`sale_detail_${selectedSale.id}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
  };

  const columns = [
    { name: 'id', label: 'ID Venta', options: { filter: false, sort: true } },
    { name: 'date', label: 'Fecha', options: { filter: false, sort: true, customBodyRender: val => format(new Date(val), 'dd/MM/yyyy') } },
    { name: 'customerName', label: 'Cliente', options: { filter: true, sort: true } },
    { name: 'seller', label: 'Vendedor', options: { filter: true, sort: true } },
    { name: 'payment_method', label: 'Método de Pago', options: { filter: true, sort: true } },
    { name: 'status', label: 'Estado', options: { filter: true, sort: true } },
    { name: 'total_amount', label: 'Total', options: { filter: false, sort: true, customBodyRender: (value) => `$${parseFloat(value).toFixed(2)}`} },
    {
      name: 'details',
      label: 'Carrito de Ventas',
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const sale = filteredData[dataIndex];
          const quantity = (sale.details || []).length;
          return (
            <Tooltip title="Ver productos">
              <Box
                border={1}
                borderRadius={2}
                paddingX={1.5}
                paddingY={0.5}
                display="inline-block"
                borderColor="primary.main"
                onClick={() => handleOpenDialog(sale)}
                sx={{ cursor: 'pointer', userSelect: 'none', fontSize: '0.85rem', color: 'primary.main' }}
              >
                Ver productos ({quantity})
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
              value={dateFrom}
              onChange={(newValue) => {
                if (newValue) {
                  const adjustedDate = new Date(newValue);
                  adjustedDate.setHours(0, 0, 0, 0);
                  setDateFrom(adjustedDate);
                } else {
                  setDateFrom(null);
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
              value={dateTo}
              onChange={(newValue) => {
                if (newValue) {
                  const adjustedDate = new Date(newValue);
                  adjustedDate.setHours(23, 59, 59, 999);
                  setDateTo(adjustedDate);
                } else {
                  setDateTo(null);
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
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                label="Cliente"
              >
                <MenuItem value="">Todos los clientes</MenuItem>
                {customersOptions.map((cliente, index) => (
                  <MenuItem key={index} value={cliente}>{cliente}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" style={{ width: 180 }}>
              <InputLabel>Empleado</InputLabel>
              <Select
                value={sellerFilter}
                onChange={(e) => setSellerFilter(e.target.value)}
                label="Empleado"
              >
                <MenuItem value="">Todos los empleados</MenuItem>
                {sellersOptions.map((empleado, index) => (
                  <MenuItem key={index} value={empleado}>{empleado}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" style={{ width: 180 }}>
              <InputLabel>Método de Pago</InputLabel>
              <Select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                label="Método de Pago"
              >
                <MenuItem value="">Todos los métodos</MenuItem>
                {paymentMethodsOptions.map((metodo, index) => (
                  <MenuItem key={index} value={metodo}>{metodo}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" style={{ width: 180 }}>
              <InputLabel>Instalación</InputLabel>
              <Select
                value={installationFilter}
                onChange={(e) => setInstallationFilter(e.target.value)}
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
              <IconButton onClick={printSales} color="primary" style={{ marginRight: 5 }}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar a PDF">
              <IconButton onClick={exportPDF} color="secondary">
                <PictureAsPdfIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar a Excel">
              <IconButton onClick={exportExcel} color="success">
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <ThemeProvider theme={theme}>
          <MUIDataTable
            title={'Ventas Realizadas'}
            data={filteredData}
            columns={columns}
            options={options}
          />
        </ThemeProvider>
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>Productos Vendidos</DialogTitle>
          <DialogContent>
            {selectedSale && (
              <>
                <Box display="flex" justifyContent="flex-end" mb={1} gap={1}>
                  <Tooltip title="Imprimir Detalle">
                    <IconButton onClick={printSaleDetail} color="primary">
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Exportar Detalle a PDF">
                    <IconButton onClick={exportSaleDetailPDF} color="secondary">
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
                      {(selectedSale.details || []).map((detalle) => (
                        <TableRow key={detalle.id}>
                          <TableCell>{detalle.product}</TableCell>
                          <TableCell>{detalle.quantity}</TableCell>
                          <TableCell>${parseFloat(detalle.unit_price).toFixed(2)}</TableCell>
                          <TableCell>${(detalle.quantity * parseFloat(detalle.unit_price)).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right"><strong>Total:</strong></TableCell>
                        <TableCell><strong>${selectedSale.total_amount}</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} variant="contained" color="primary">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </LocalizationProvider>
  );
}

export default SalesHistoryTable;