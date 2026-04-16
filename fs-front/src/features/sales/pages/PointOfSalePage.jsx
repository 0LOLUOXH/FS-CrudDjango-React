import { useState, useEffect, useRef } from 'react';
import { getAllCustomers, getAllIndividualCustomers, getAllCorporateCustomers } from '../../../api/customers_api';
import { createSale, createSaleDetail, createInstallationService } from '../../../api/sales_api';
import { getAllProducts, partialUpdateProduct } from '../../../api/inventory_api';
import { useUser } from '../../../contexts/UserContext';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';

// Apply the autoTable plugin to jsPDF
applyPlugin(jsPDF);

function PointOfSalePage() {
    const { user } = useUser();

    // Data States
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [individualCustomers, setIndividualCustomers] = useState([]);
    const [corporateCustomers, setCorporateCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

    // Refs for outside click handling
    const customerDropdownRef = useRef(null);
    const productDropdownRef = useRef(null);

    // Cart States
    const [cart, setCart] = useState([]);
    const [customerId, setCustomerId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [requiresInstallation, setRequiresInstallation] = useState(false);
    const [installationPrice, setInstallationPrice] = useState(0);
    const [installationAddress, setInstallationAddress] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');

    // Initial Data Load
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [productsData, customersData, individualData, corporateData] = await Promise.all([
                    getAllProducts(),
                    getAllCustomers(),
                    getAllIndividualCustomers(),
                    getAllCorporateCustomers()
                ]);
                
                setProducts(productsData.data);
                setCustomers(customersData.data);
                setIndividualCustomers(individualData.data);
                setCorporateCustomers(corporateData.data);
            } catch (error) {
                setError('Error al cargar datos iniciales');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // Outside Click Handler
    useEffect(() => {
        function handleClickOutside(event) {
            if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
                setIsCustomerDropdownOpen(false);
            }
            if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Get Full Customer by ID
    const getFullCustomer = (id) => {
        const customer = customers.find(c => c.id === id);
        if (!customer) return null;

        if (customer.customer_type === 'INDIVIDUAL') {
            const natural = individualCustomers.find(n => n.customer === id);
            return { ...customer, ...natural };
        } else {
            const corporate = corporateCustomers.find(j => j.customer === id);
            return { ...customer, ...corporate };
        }
    };

    // Filter Customers
    const filteredCustomers = customers.filter(customer => {
        if (customer.customer_type === 'INDIVIDUAL') {
            const natural = individualCustomers.find(n => n.customer === customer.id);
            if (!natural) return false;
            return (
                natural.first_name?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                natural.last_name?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                natural.identification_number?.toLowerCase().includes(customerSearchTerm.toLowerCase())
            );
        } else {
            const corporate = corporateCustomers.find(j => j.customer === customer.id);
            if (!corporate) return false;
            return (
                corporate.company_name?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                (corporate.tax_id && corporate.tax_id.toLowerCase().includes(customerSearchTerm.toLowerCase()))
            );
        }
    });

    // Filter Products
    const filteredProducts = products.filter(product =>
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        product.stock_quantity > 0
    );

    // Add to Cart
    const addToCart = (product) => {
        const exists = cart.find(item => item.product.id === product.id);
        const availableStock = product.stock_quantity;
        
        if (exists) {
            if (exists.quantity >= availableStock) {
                setError(`No hay suficiente stock de ${product.name}`);
                return;
            }
            setCart(cart.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            if (availableStock < 1) {
                setError(`No hay stock disponible de ${product.name}`);
                return;
            }
            setCart([...cart, {
                product,
                quantity: 1,
                price: parseFloat(product.base_price_usd)
            }]);
        }
        setError(null);
        setSearchTerm('');
        setIsDropdownOpen(false);
    };

    // Update Cart Quantity
    const updateQuantity = (productId, quantityStr) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        const quantity = parseInt(quantityStr) || 0;
        const availableStock = product.stock_quantity;
        
        if (quantity < 1) return;
        if (quantity > availableStock) {
            setError(`No hay suficiente stock (disponible: ${availableStock})`);
            return;
        }

        setCart(cart.map(item =>
            item.product.id === productId
                ? { ...item, quantity: quantity }
                : item
        ));
        setError(null);
    };

    // Remove from Cart
    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    // Calculate Total
    const calculateTotal = () => {
        const subtotal = cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        
        return subtotal + (requiresInstallation ? parseFloat(installationPrice) || 0 : 0);
    };

    // Select Customer
    const selectCustomer = (customer) => {
        setCustomerId(customer.id);
        setCustomerSearchTerm(
            customer.customer_type === 'INDIVIDUAL' ? 
            `${customer.first_name} ${customer.last_name}` : 
            customer.company_name
        );
        setIsCustomerDropdownOpen(false);
    };


    function generateProforma() {
      if (!customerId) {
        setError("Seleccione un cliente para generar la proforma");
        return;
      }
      if (cart.length === 0) {
        setError("Agregue productos al carrito para generar la proforma");
        return;
      }
      const customer = getFullCustomer(customerId);
      if (!customer) return;

      const lastNum = parseInt(localStorage.getItem("lastCotizacion") || "0", 10);
      const numeroCot = lastNum + 1;
      localStorage.setItem("lastCotizacion", String(numeroCot));

      const hoy   = new Date();
      const dia   = String(hoy.getDate()).padStart(2, "0");
      const mes   = String(hoy.getMonth() + 1).padStart(2, "0");
      const anio  = hoy.getFullYear();
      const fechaStr  = `${dia}/${mes}/${anio}`;
      const numeroStr = String(numeroCot).padStart(4, "0");

      const doc = new jsPDF({ unit: "mm", format: "letter" });
      const pageWidth   = doc.internal.pageSize.getWidth();
      const margin      = 14;
      const usableWidth = pageWidth - margin * 2;

      try {
           doc.addImage("../public/logo.png", "PNG", margin, margin, 24, 24);
      } catch (e) {
          console.warn("Logo not found or could not be loaded", e);
      }
      doc.setFont("helvetica", "bold").setFontSize(14);
      doc.text("FUSIÓN SOLAR", margin + 30, margin + 4);
      doc.setFont("helvetica", "normal").setFontSize(8);
      doc.text(
        "De frente donde fue la policía nacional, San Benito, Tipitapa, Nicaragua",
        margin + 30,
        margin + 8
      );
      doc.text(
        "Tel: 7745 1956   Email: solarelectricnic@gmail.com",
        margin + 30,
        margin + 12
      );
      doc.text("RUC: 0011110011046N", margin + 30, margin + 16);

      doc.setFont("helvetica", "bold").setFontSize(18);
      doc.text("COTIZACIÓN", pageWidth - margin, margin + 4, { align: "right" });
      const dateTableY = margin + 20;
      doc.autoTable({
        startY: dateTableY,
        margin: { left: pageWidth - margin - 50, right: margin },
        tableWidth: 50,
        theme: "grid",
        styles: { fontSize: 8, halign: "center", lineColor: 200, lineWidth: 0.3 },
        head: [["FECHA", "NÚMERO"]],
        body: [[fechaStr, numeroStr]],
      });

      const yCliente = doc.lastAutoTable.finalY + 8;
      doc.setFont("helvetica", "bold").setFontSize(10);
      doc.text("Preparado para:", margin, yCliente + 6);
      doc.setFont("helvetica", "normal").setFontSize(9);
      const customerName =
        customer.customer_type === "INDIVIDUAL"
          ? `${customer.first_name} ${customer.last_name}`
          : customer.company_name;
      doc.text(`Cliente: ${customerName}`, margin, yCliente + 12);
      doc.text(`Teléfono: ${customer.phone || 'N/A'}`, margin, yCliente + 18);
      doc.text(`Email: ${customer.email || 'N/A'}`, margin, yCliente + 24);
      doc.text(`Dirección: ${customer.address || installationAddress || ''}`, margin, yCliente + 30);

      const tableData = cart.map(item => {
        const total = Number(item.price) * item.quantity;
        return [
          item.quantity,
          item.product.name,
          `$${total.toFixed(2)}`
        ];
      });
      if (requiresInstallation) {
        const pi = Number(installationPrice);
        tableData.push([1, "Instalación", `$${pi.toFixed(2)}`]);
      }

      doc.autoTable({
        startY: yCliente + 36,
        margin: { left: margin, right: margin },
        head: [["CANT.", "DESCRIPCIÓN", "TOTAL"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2, lineColor: 200, lineWidth: 0.2 },
        headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: usableWidth * 0.10, halign: "center" },
          1: { cellWidth: usableWidth * 0.70 },
          2: { cellWidth: usableWidth * 0.20, halign: "right" },
        },
      });

      const yTotal = doc.lastAutoTable.finalY + 10;
      const total = tableData.reduce(
        (sum, row) => sum + Number(row[2].replace(/[^0-9.-]+/g, "")),
        0
      );
      doc.setFont("helvetica", "bold").setFontSize(14);
      doc.text("TOTAL:", pageWidth - margin - 40, yTotal, { align: "right" });
      doc.text(`$${total.toFixed(2)}`, pageWidth - margin, yTotal, { align: "right" });

      const firmaY = yTotal + 20;
      doc.setFontSize(8);
      doc.text("Esta cotización es válida por 7 días.", margin, firmaY - 10);
      doc.setLineWidth(0.3);
      doc.line(margin, firmaY, margin + 46, firmaY);
      doc.setFontSize(9).text("Recibido:", margin, firmaY + 5);
      doc.line(pageWidth - margin - 46, firmaY, pageWidth - margin, firmaY);
      doc.text("Aprobado:", pageWidth - margin - 46, firmaY + 5);

      const safeName = customerName.replace(/\s+/g, "_");
      doc.save(`Cotizacion_${safeName}_${fechaStr.replace(/\//g, "")}.pdf`);
    }

    // Process Sale
    const processSale = async () => {
        if (cart.length === 0) {
            setError('Agregue productos al carrito');
            return;
        }

        if (!customerId) {
            setError('Seleccione un cliente');
            return;
        }

        if (requiresInstallation && (!installationPrice || isNaN(installationPrice))) {
            setError('Ingrese un precio válido para la instalación');
            return;
        }

        if (requiresInstallation && (!installationAddress || !scheduledDate)) {
            setError('Ingrese la dirección de instalación y la fecha programada');
            return;
        }

        // Validate stock before proceeding
        for (const item of cart) {
            const product = products.find(p => p.id === item.product.id);
            if (!product || product.stock_quantity < item.quantity) {
                setError(`No hay suficiente stock de ${item.product.name}`);
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Create main Sale
            const saleData = {
                customer: customerId,
                seller: user?.user_id || 1, // Assuming user_id exists in UserContext
                currency: 'USD',
                exchange_rate: 1.0,
                discount_amount: 0.0,
                total_amount: calculateTotal(),
                payment_method: paymentMethod,
                status: 'COMPLETED'
            };

            const saleResponse = await createSale(saleData);
            const sale = saleResponse.data;

            // 2. Create Sale Details & Update Stock
            for (const item of cart) {
                await createSaleDetail({
                    sale: sale.id,
                    product: item.product.id,
                    quantity: item.quantity,
                    unit_price: item.price
                });

                const currentProduct = products.find(p => p.id === item.product.id);
                if (currentProduct) {
                    const newStock = currentProduct.stock_quantity - item.quantity;
                    await partialUpdateProduct(item.product.id, {
                        stock_quantity: newStock
                    });
                }
            }

            // 3. Create Installation Service if required
            if (requiresInstallation) {
               await createInstallationService({
                   sale: sale.id,
                   scheduled_date: scheduledDate,
                   address: installationAddress,
                   cost: parseFloat(installationPrice),
                   is_completed: false
               });
            }

            // Refresh state
            const updatedProducts = await getAllProducts();
            setProducts(updatedProducts.data);
            
            setCart([]);
            setCustomerId('');
            setCustomerSearchTerm('');
            setInstallationPrice(0);
            setInstallationAddress('');
            setScheduledDate('');
            setRequiresInstallation(false);

            alert('Venta registrada exitosamente!');
        } catch (error) {
            setError('Error al procesar la venta: ' + (error.response?.data?.message || error.message));
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">            
            {error && (
                <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Search & Products */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Productos Disponibles</h2>
                    
                    <div className="mb-4 relative" ref={productDropdownRef}>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Buscar Producto</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                placeholder="Buscar producto..."
                            />
                            {isDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map(product => (
                                            <div
                                                key={product.id}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                                                onClick={() => addToCart(product)}
                                            >
                                                <div>
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-sm text-gray-600">
                                                        Stock: {product.stock_quantity} | 
                                                        Precio: ${product.base_price_usd}
                                                    </div>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                    Agregar
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-gray-500">No se encontraron productos disponibles</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-2">Productos en Carrito</h3>
                    
                    {cart.length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay productos en el carrito</p>
                    ) : (
                        <div className="carrito-list mb-4 max-h-64 overflow-y-auto">
                            {cart.map(item => (
                                <div key={item.product.id} className="border-b pb-4 mb-4 px-4 bg-white rounded-lg shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800">{item.product.name}</h4>
                                            <p className="text-sm text-gray-500">
                                                Precio unitario: <span className="text-gray-700 font-medium">${item.price.toFixed(2)}</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.product.id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Eliminar
                                        </button>
                                    </div>

                                    <div className="flex items-center mt-3">
                                        <label className="mr-2 text-sm font-medium text-gray-700">Cantidad:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={item.product.stock_quantity + item.quantity}
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.product.id, e.target.value)}
                                            className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-500 ml-3">
                                            (Disponible: {item.product.stock_quantity})
                                        </span>
                                    </div>

                                    <div className="mt-2 text-sm text-gray-700">
                                        Subtotal: <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart & Sale Details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Detalles de Venta</h2>
                    
                    <div className="mb-4 relative" ref={customerDropdownRef}>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Cliente</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={customerSearchTerm}
                                onChange={(e) => {
                                    setCustomerSearchTerm(e.target.value);
                                    setIsCustomerDropdownOpen(true);
                                }}
                                onFocus={() => setIsCustomerDropdownOpen(true)}
                                placeholder="Buscar cliente..."
                            />
                            <input type="hidden" name="customerId" value={customerId} />
                            {isCustomerDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {filteredCustomers.length > 0 ? (
                                        filteredCustomers.map(customer => {
                                            const fullCustomer = getFullCustomer(customer.id);
                                            if (!fullCustomer) return null;
                                            
                                            return (
                                                <div
                                                    key={customer.id}
                                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                                                    onClick={() => selectCustomer(fullCustomer)}
                                                >
                                                    {customer.customer_type === 'INDIVIDUAL' ? (
                                                        <div>
                                                            <div className="text-sm text-gray-600">Tipo: Natural</div> 
                                                            <div className="font-medium">{fullCustomer.first_name} {fullCustomer.last_name}</div>
                                                            <div className="text-sm text-gray-600">Cédula: {fullCustomer.identification_number}</div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="text-sm text-gray-600">Tipo: Juridico</div> 
                                                            <div className="font-medium">{fullCustomer.company_name}</div>
                                                            <div className="text-sm text-gray-600">RUC: {fullCustomer.tax_id || 'No especificado'}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="px-4 py-2 text-gray-500">No se encontraron clientes</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Método de Pago</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Transferencia">Transferencia</option>
                        </select>
                    </div>

                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            id="requiresInstallation"
                            className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500"
                            checked={requiresInstallation}
                            onChange={(e) => setRequiresInstallation(e.target.checked)}
                        />
                        <label htmlFor="requiresInstallation" className="text-sm font-medium text-gray-700">
                            ¿Requiere instalación?
                        </label>
                    </div>

                    {requiresInstallation && (
                        <>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Precio Instalación ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={installationPrice}
                                    onChange={(e) => setInstallationPrice(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Dirección de Instalación *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={installationAddress}
                                    onChange={(e) => setInstallationAddress(e.target.value)}
                                    placeholder="Dirección completa"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Fecha Programada *</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}       

                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between font-medium text-lg">
                            <span>Subtotal:</span>
                            <span>${cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}</span>
                        </div>
                        {requiresInstallation && (
                            <div className="flex justify-between mt-2">
                                <span className="text-sm">Instalación:</span>
                                <span className="text-sm">${parseFloat(installationPrice || 0).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 font-bold text-lg">
                            <span>Total:</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">* Precios en USD</p>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button
                            type="button"
                            onClick={generateProforma}
                            disabled={cart.length === 0 || !customerId}
                            className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${cart.length === 0 || !customerId ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                        >
                            Proforma
                        </button>
                        <button
                            onClick={processSale}
                            disabled={cart.length === 0 || isLoading || !customerId || (requiresInstallation && (!installationAddress || !scheduledDate))}
                            className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${cart.length === 0 || isLoading || !customerId || (requiresInstallation && (!installationAddress || !scheduledDate)) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {isLoading ? 'Procesando...' : 'Finalizar Venta'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PointOfSalePage;
