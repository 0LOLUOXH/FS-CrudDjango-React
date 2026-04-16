import React, { useState, useEffect, useCallback } from 'react';
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

export function PurchaseHistoryTable({ data }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [productDetails, setProductDetails] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [supplierFilter, setSupplierFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [suppliersOptions, setSuppliersOptions] = useState([]);
  const [paymentMethodsOptions, setPaymentMethodsOptions] = useState([]);

  // Extract unique options for suppliers and payment methods
  useEffect(() => {
    if (Array.isArray(data)) {
      const uniqueSuppliers = [...new Set(data.map(item => item.supplierName))].filter(Boolean);
      const uniqueMethods = [...new Set(data.map(item => item.payment_method))].filter(Boolean);

      setSuppliersOptions(uniqueSuppliers);
      setPaymentMethodsOptions(uniqueMethods);
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

  const processData = useCallback((rawData) => {
    if (!Array.isArray(rawData)) return [];

    const uniqueOrders = {};

    rawData.forEach(item => {
      // Apply filters
      if (supplierFilter && item.supplierName !== supplierFilter) return;
      if (paymentMethodFilter && item.payment_method !== paymentMethodFilter) return;

      const itemDate = adjustDateToLocal(item.date);
      const localDate = new Date(itemDate);
      localDate.setHours(12, 0, 0, 0);

      if (dateFrom && localDate < new Date(dateFrom.setHours(0, 0, 0, 0))) return;
      if (dateTo && localDate > new Date(dateTo.setHours(23, 59, 59, 999))) return;

      const orderKey = item.invoice_number;

      if (!uniqueOrders[orderKey]) {
        uniqueOrders[orderKey] = {
          ...item,
          date: localDate,
          total_to_pay: parseFloat(item.total_amount) || 0,
          products: []
        };
      }

      // Check for product data within item if available, assuming structure from parent
      if (item.products && Array.isArray(item.products)) {
          uniqueOrders[orderKey].products = item.products;
      }
    });

    return Object.values(uniqueOrders);
  }, [supplierFilter, paymentMethodFilter, dateFrom, dateTo]);

  const processedData = processData(data);

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    const tableData = processedData.map(order => ({
      type: order.payment_method, // Assuming this is used for type
      number: order.invoice_number,
      date: format(order.date, 'dd/MM/yyyy'),
      supplier: order.supplierName,
      total: `C$${order.total_to_pay.toFixed(2)}`,
      productsCount: (order.products || []).length
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
              <div class="filter-item"><strong>Período:</strong> ${dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'Todo'} - ${dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Hoy'}</div>
              ${supplierFilter ? `<div class="filter-item"><strong>Proveedor:</strong> ${supplierFilter}</div>` : ''}
              ${paymentMethodFilter ? `<div class="filter-item"><strong>Método de Pago:</strong> ${paymentMethodFilter}</div>` : ''}
            </div>
            <p><strong>Cantidad de comprobantes:</strong> ${tableData.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Método</th>
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
                  <td>${item.type}</td>
                  <td>${item.number}</td>
                  <td>${item.date}</td>
                  <td>${item.supplier}</td>
                  <td>${item.productsCount}</td>
                  <td>${item.total}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5">Total General</td>
                <td>C$${processedData.reduce((sum, item) => sum + item.total_to_pay, 0).toFixed(2)}</td>
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
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    try {
      const watermarkUrl = '/logo.png'; 
      const imgDataUrl = await loadImageAsDataURL(watermarkUrl);
      doc.setGState(new doc.GState({ opacity: 0.1 }));
      const props = doc.getImageProperties(imgDataUrl);
      const imgW = pageWidth * 0.6; 
      const imgH = (props.height * imgW) / props.width;
      const x = (pageWidth - imgW) / 2;
      const y = (pageHeight - imgH) / 2;
      doc.addImage(imgDataUrl, 'PNG', x, y, imgW, imgH);
      doc.setGState(new doc.GState({ opacity: 1 }));
    } catch (e) {
      console.warn('No se pudo cargar la marca de agua:', e);
    }

    doc.setFontSize(18);
    doc.text('Reporte de Compras', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 25);

    let filtersY = 30;
    doc.text(
      `Período: ${dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'Todo'} - ${dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Hoy'}`,
      14,
      filtersY
    );
    filtersY += 5;
    if (supplierFilter) {
      doc.text(`Proveedor: ${supplierFilter}`, 14, filtersY);
      filtersY += 5;
    }
    if (paymentMethodFilter) {
      doc.text(`Método de Pago: ${paymentMethodFilter}`, 14, filtersY);
      filtersY += 5;
    }
    doc.text(`Cantidad de comprobantes: ${processedData.length}`, 14, filtersY + 5);

    const tableData = processedData.map(order => [
      order.payment_method,
      order.invoice_number,
      format(order.date, 'dd/MM/yyyy'),
      order.supplierName,
      (order.products || []).length,
      `C$${order.total_to_pay.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['Método', 'N° Comprobante', 'Fecha', 'Proveedor', 'Productos', 'Total']],
      body: tableData,
      startY: filtersY + 15,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [64, 64, 64], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 40 }
    });

    const totalGeneral = processedData
      .reduce((sum, item) => sum + item.total_to_pay, 0)
      .toFixed(2);

    autoTable(doc, {
      body: [['Total General', '', '', '', '', `C$${totalGeneral}`]],
      startY: doc.lastAutoTable.finalY + 5,
      styles: { fontSize: 9, fontStyle: 'bold', cellPadding: 3 },
      columnStyles: { 5: { fontStyle: 'bold' } }
    });

    doc.setFontSize(8);
    doc.text('Sistema de Gestión de inventario Fusion Solar', 14, pageHeight - 10);
    doc.text(format(new Date(), 'dd/MM/yyyy HH:mm'), pageWidth - 14, pageHeight - 10, { align: 'right' });

    doc.save(`purchase_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
  };


  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Compras');

    worksheet.columns = [
      { header: 'Método de Pago', key: 'payment_method', width: 20 },
      { header: 'N° Comprobante', key: 'invoice_number', width: 20 },
      { header: 'Fecha', key: 'date', width: 15 },
      { header: 'Proveedor', key: 'supplier', width: 25 },
      { header: 'Productos', key: 'products', width: 70 },
      { header: 'Total a Pagar', key: 'total', width: 18 },
    ];

    processedData.forEach((order) => {
      const productsStr = (order.products || []).map(p => {
        return `${p.name} x${p.quantity} - C$${parseFloat(p.unitPrice).toFixed(2)}`;
      }).join(', ');

      worksheet.addRow({
        payment_method: order.payment_method,
        invoice_number: order.invoice_number,
        date: format(order.date, 'dd/MM/yyyy'),
        supplier: order.supplierName,
        total: `C$${parseFloat(order.total_to_pay).toFixed(2)}`,
        products: productsStr
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `purchase_history_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
  };


  const handleExportDetailPDF = (order, products) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Detalle de Compra: ${order.invoice_number}`, 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Método de pago: ${order.payment_method}`, 14, 25);
    doc.text(`Proveedor: ${order.supplierName}`, 14, 30);
    doc.text(`Fecha: ${format(order.date, 'dd/MM/yyyy')}`, 14, 35);

    const tableData = products.map(product => [
      product.id,
      product.name,
      product.quantity,
      `C$${parseFloat(product.unitPrice).toFixed(2)}`,
      `C$${parseFloat(product.tax).toFixed(2)}`,
      `C$${parseFloat(product.total).toFixed(2)}`
    ]);

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

    autoTable(doc, {
      body: [['Total Compra', '', '', '', '', `C$${order.total_to_pay.toFixed(2)}`]],
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

    doc.setFontSize(8);
    doc.text('Sistema de Gestión de Inventario Fusion Solar', 14, doc.internal.pageSize.height - 10);
    doc.text(format(new Date(), 'dd/MM/yyyy HH:mm'), 190, doc.internal.pageSize.height - 10, { align: 'right' });

    doc.save(`purchase_detail_${order.invoice_number}_${format(new Date(), 'yyyyMMdd')}.pdf`);
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
      name: "payment_method",
      label: "Método de Pago",
      options: {
        filter: true,
        sort: true,
      }
    },
    {
      name: "invoice_number",
      label: "N° Comprobante",
      options: {
        filter: false,
        sort: false,
      }
    },
    {
      name: "date",
      label: "Fecha",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => value ? format(new Date(value), 'dd/MM/yyyy') : 'N/A'
      }
    },
    {
      name: "supplierName",
      label: "Proveedor",
      options: {
        filter: true,
        sort: false,
      }
    },
    {
      name: "products",
      label: "Carrito de Compras",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (products, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          const order = processedData[rowIndex];

          if (!products || products.length === 0) {
            return <Button disabled>Sin productos</Button>;
          }

          return (
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOrder(order);
                setProductDetails(products);
                setOpenDialog(true);
              }}
            >
              Ver Productos ({products.length})
            </Button>
          );
        }
      }
    },
    {
      name: "total_amount",
      label: "Total",
      options: {
        filter: false,
        sort: true,
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
              <InputLabel>Proveedor</InputLabel>
              <Select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                label="Proveedor"
              >
                <MenuItem value="">Todos los proveedores</MenuItem>
                {suppliersOptions.map((supplier, index) => (
                  <MenuItem key={index} value={supplier}>{supplier}</MenuItem>
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
                {paymentMethodsOptions.map((method, index) => (
                  <MenuItem key={index} value={method}>{method}</MenuItem>
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
                <IconButton onClick={handleExportExcel} color="success">
                  <FileDownloadIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
        <MUIDataTable
          title={"Historial de Compras"}
          data={processedData}
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
                Detalle de Compra: {selectedOrder?.invoice_number} ({selectedOrder?.payment_method})
              </span>
              <div>
                <Tooltip title="Imprimir">
                  <IconButton onClick={() => {
                    const content = `
                      <html>
                        <head>
                          <title>Detalle de Compra ${selectedOrder?.invoice_number}</title>
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
                          <p><strong>Comprobante:</strong> ${selectedOrder?.payment_method} ${selectedOrder?.invoice_number}</p>
                          <p><strong>Proveedor:</strong> ${selectedOrder?.supplierName}</p>
                          <p><strong>Fecha:</strong> ${format(selectedOrder?.date, 'dd/MM/yyyy')}</p>
                          <table>
                            <tr>
                              <th>Producto</th>
                              <th>Cantidad</th>
                              <th>Precio Unit.</th>
                              <th>IVA</th>
                              <th>Total</th>
                            </tr>
                            ${productDetails.map(p => `
                              <tr>
                                <td>${p.name}</td>
                                <td>${p.quantity}</td>
                                <td>C$${parseFloat(p.unitPrice).toFixed(2)}</td>
                                <td>C$${parseFloat(p.tax).toFixed(2)}</td>
                                <td>C$${parseFloat(p.total).toFixed(2)}</td>
                              </tr>
                            `).join('')}
                            <tr>
                              <td colspan="4"><strong>Total Compra:</strong></td>
                              <td><strong>C$${selectedOrder?.total_to_pay?.toFixed(2)}</strong></td>
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
                    onClick={() => handleExportDetailPDF(selectedOrder, productDetails)}
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
                  {productDetails?.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell align="right">C${parseFloat(product.unitPrice).toFixed(2)}</TableCell>
                      <TableCell align="right">C${parseFloat(product.tax).toFixed(2)}</TableCell>
                      <TableCell align="right">C${parseFloat(product.total).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={5} align="right">
                      <strong>Total Compra:</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>C${selectedOrder?.total_to_pay?.toFixed(2)}</strong>
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

export default PurchaseHistoryTable;