import React, { useState, useEffect, useRef } from "react";
import {
  getAllCustomers,
  getAllIndividualCustomers,
  getAllCorporateCustomers,
} from "../../../api/customers_api";
import { api } from "../../../api/axiosInstance";
import { getAllProducts } from "../../../api/inventory_api";
import { useUser } from "../../../contexts/UserContext";
import { Badge } from "../../../components/ui/Badge";
import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";

applyPlugin(jsPDF);

function PointOfSalePage() {
  const { user } = useUser();

  // Data States
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [individualCustomers, setIndividualCustomers] = useState([]);
  const [corporateCustomers, setCorporateCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // Refs for outside click handling
  const customerDropdownRef = useRef(null);
  const productDropdownRef = useRef(null);

  // Cart States
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [requiresInstallation, setRequiresInstallation] = useState(false);
  const [installationPrice, setInstallationPrice] = useState(0);
  const [installationAddress, setInstallationAddress] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  // Initial Data Load
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [productsData, customersData, individualData, corporateData] =
          await Promise.all([
            getAllProducts(),
            getAllCustomers(),
            getAllIndividualCustomers(),
            getAllCorporateCustomers(),
          ]);

        setProducts(productsData.data || []);
        setCustomers(customersData.data || []);
        setIndividualCustomers(individualData.data || []);
        setCorporateCustomers(corporateData.data || []);
      } catch (err) {
        setError("Error al cargar datos iniciales del catálogo o clientes");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Outside Click Handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target)
      ) {
        setIsCustomerDropdownOpen(false);
      }
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get Full Customer by ID
  const getFullCustomer = (id) => {
    const customer = customers.find((c) => c.id === id);
    if (!customer) return null;

    if (customer.customer_type === "I") {
      const natural = individualCustomers.find((n) => n.customer === id);
      return { ...customer, ...natural };
    } else {
      const corporate = corporateCustomers.find((j) => j.customer === id);
      return { ...customer, ...corporate };
    }
  };

  // Filter Customers
  const filteredCustomers = customers.filter((customer) => {
    if (customer.customer_type === "I") {
      const natural = individualCustomers.find(
        (n) => n.customer === customer.id
      );
      if (!natural) return false;
      return (
        natural.first_name
          ?.toLowerCase()
          .includes(customerSearchTerm.toLowerCase()) ||
        natural.last_name
          ?.toLowerCase()
          .includes(customerSearchTerm.toLowerCase()) ||
        natural.identity_card
          ?.toLowerCase()
          .includes(customerSearchTerm.toLowerCase())
      );
    } else {
      const corporate = corporateCustomers.find(
        (j) => j.customer === customer.id
      );
      if (!corporate) return false;
      return (
        corporate.company_name
          ?.toLowerCase()
          .includes(customerSearchTerm.toLowerCase()) ||
        (corporate.tax_id &&
          corporate.tax_id
            .toLowerCase()
            .includes(customerSearchTerm.toLowerCase()))
      );
    }
  });

  // Filter Products
  const filteredProducts = products.filter(
    (product) =>
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      product.stock_quantity > 0
  );

  // Add to Cart
  const addToCart = (product) => {
    const exists = cart.find((item) => item.product.id === product.id);
    const availableStock = product.stock_quantity;

    if (exists) {
      if (exists.quantity >= availableStock) {
        setError(`No hay suficiente stock de ${product.name}`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (availableStock < 1) {
        setError(`No hay stock disponible de ${product.name}`);
        return;
      }
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          price: parseFloat(product.base_price_usd),
        },
      ]);
    }
    setError(null);
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  // Update Cart Quantity
  const updateQuantity = (productId, quantityStr) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const quantity = parseInt(quantityStr) || 0;
    const availableStock = product.stock_quantity;

    if (quantity < 1) return;
    if (quantity > availableStock) {
      setError(`No hay suficiente stock (disponible: ${availableStock})`);
      return;
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, quantity: quantity } : item
      )
    );
    setError(null);
  };

  // Remove from Cart
  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  // Calculate Subtotal and Total
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return (
      subtotal +
      (requiresInstallation ? parseFloat(installationPrice) || 0 : 0)
    );
  };

  // Select Customer
  const selectCustomer = (customer) => {
    setCustomerId(customer.id);
    setCustomerSearchTerm(
      customer.customer_type === "I"
        ? `${customer.first_name} ${customer.last_name}`
        : customer.company_name
    );
    setIsCustomerDropdownOpen(false);
  };

  // Generate Proforma PDF
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

    const lastNum = parseInt(
      localStorage.getItem("lastCotizacion") || "0",
      10
    );
    const numeroCot = lastNum + 1;
    localStorage.setItem("lastCotizacion", String(numeroCot));

    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, "0");
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaStr = `${dia}/${mes}/${anio}`;
    const numeroStr = String(numeroCot).padStart(4, "0");

    const doc = new jsPDF({ unit: "mm", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const usableWidth = pageWidth - margin * 2;

    doc.setFont("helvetica", "bold").setFontSize(16);
    doc.setTextColor(242, 140, 40);
    doc.text("FUSIÓN SOLAR ERP", margin, margin + 4);

    doc.setFont("helvetica", "normal").setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(
      "Soluciones Solares Integrales - San Benito, Tipitapa, Nicaragua",
      margin,
      margin + 9
    );
    doc.text(
      "Tel: +505 7745-1956 | Email: solarelectricnic@gmail.com | RUC: 0011110011046N",
      margin,
      margin + 13
    );

    doc.setFont("helvetica", "bold").setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text("COTIZACIÓN", pageWidth - margin, margin + 4, { align: "right" });

    const dateTableY = margin + 18;
    doc.autoTable({
      startY: dateTableY,
      margin: { left: pageWidth - margin - 50, right: margin },
      tableWidth: 50,
      theme: "grid",
      styles: {
        fontSize: 8,
        halign: "center",
        lineColor: 200,
        lineWidth: 0.3,
      },
      head: [["FECHA", "NÚMERO"]],
      body: [[fechaStr, numeroStr]],
    });

    const yCliente = doc.lastAutoTable.finalY + 8;
    doc.setFont("helvetica", "bold").setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text("Preparado para el Cliente:", margin, yCliente + 6);

    doc.setFont("helvetica", "normal").setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const customerName =
      customer.customer_type === "I"
        ? `${customer.first_name} ${customer.last_name}`
        : customer.company_name;

    doc.text(`Cliente: ${customerName}`, margin, yCliente + 12);
    doc.text(`Teléfono: ${customer.phone || "N/A"}`, margin, yCliente + 17);
    doc.text(`Email: ${customer.email || "N/A"}`, margin, yCliente + 22);
    doc.text(
      `Dirección: ${customer.address || installationAddress || "Managua"}`,
      margin,
      yCliente + 27
    );

    const tableData = cart.map((item) => {
      const total = Number(item.price) * item.quantity;
      return [item.quantity, item.product.name, `$${total.toFixed(2)}`];
    });
    if (requiresInstallation) {
      const pi = Number(installationPrice);
      tableData.push([1, "Servicio de Instalación y Montaje", `$${pi.toFixed(2)}`]);
    }

    doc.autoTable({
      startY: yCliente + 33,
      margin: { left: margin, right: margin },
      head: [["CANT.", "DESCRIPCIÓN DEL EQUIPO / SERVICIO", "TOTAL (USD)"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2.5, lineColor: 200, lineWidth: 0.2 },
      headStyles: {
        fillColor: [242, 140, 40],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: usableWidth * 0.12, halign: "center" },
        1: { cellWidth: usableWidth * 0.68 },
        2: { cellWidth: usableWidth * 0.2, halign: "right" },
      },
    });

    const yTotal = doc.lastAutoTable.finalY + 8;
    const total = tableData.reduce(
      (sum, row) => sum + Number(row[2].replace(/[^0-9.-]+/g, "")),
      0
    );
    doc.setFont("helvetica", "bold").setFontSize(13);
    doc.text("TOTAL COTIZADO:", pageWidth - margin - 40, yTotal, {
      align: "right",
    });
    doc.setTextColor(242, 140, 40);
    doc.text(`$${total.toFixed(2)} USD`, pageWidth - margin, yTotal, {
      align: "right",
    });

    const firmaY = yTotal + 20;
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8);
    doc.text(
      "Esta cotización/proforma es válida por 15 días calendario a partir de su emisión.",
      margin,
      firmaY - 8
    );
    doc.setLineWidth(0.3);
    doc.line(margin, firmaY, margin + 46, firmaY);
    doc.setFontSize(9).text("Firma Cliente:", margin, firmaY + 5);
    doc.line(pageWidth - margin - 46, firmaY, pageWidth - margin, firmaY);
    doc.text("Autorizado Fusión Solar:", pageWidth - margin - 46, firmaY + 5);

    const safeName = customerName.replace(/\s+/g, "_");
    doc.save(`Proforma_${safeName}_${fechaStr.replace(/\//g, "")}.pdf`);
    setSuccessMsg(`Proforma oficial para ${customerName} descargada correctamente en PDF.`);
  }

  // Process Sale
  const processSale = async () => {
    if (cart.length === 0) {
      setError("Agregue productos al carrito antes de procesar.");
      return;
    }

    if (!customerId) {
      setError("Seleccione un cliente para la venta.");
      return;
    }

    if (
      requiresInstallation &&
      (!installationPrice || isNaN(installationPrice))
    ) {
      setError("Ingrese un precio válido para el servicio de instalación.");
      return;
    }

    if (requiresInstallation && (!installationAddress || !scheduledDate)) {
      setError("Ingrese la dirección de instalación y la fecha programada.");
      return;
    }

    for (const item of cart) {
      const product = products.find((p) => p.id === item.product.id);
      if (!product || product.stock_quantity < item.quantity) {
        setError(`No hay suficiente stock de ${item.product.name}`);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        customer_id: customerId,
        currency: "USD",
        exchange_rate: "1.0000",
        payment_method: paymentMethod,
        discount_amount: "0.00",
        requires_installation: requiresInstallation,
        installation_price: requiresInstallation
          ? String(parseFloat(installationPrice || 0).toFixed(2))
          : null,
        installation_address: requiresInstallation ? installationAddress : "",
        scheduled_date: requiresInstallation ? scheduledDate : null,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: String(parseFloat(item.price).toFixed(2)),
        })),
      };

      const response = await api.post("/process_sale/", payload);

      const updatedProducts = await getAllProducts();
      setProducts(updatedProducts.data || []);

      setCart([]);
      setCustomerId("");
      setCustomerSearchTerm("");
      setInstallationPrice(0);
      setInstallationAddress("");
      setScheduledDate("");
      setRequiresInstallation(false);

      setSuccessMsg(
        `¡Venta registrada exitosamente! Factura #${response.data.sale_id}. Stock descontado.`
      );
    } catch (err) {
      const backendError =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Error al procesar la venta";

      setError(backendError);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-[fadeUp_0.4s_var(--ease-bounce)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
            <i className="fa-solid fa-cash-register text-[var(--primary)]"></i>
            Punto de Venta & Proformas
          </h1>
          <p className="text-sm text-[var(--text-sec)] mt-1">
            Facturación en línea, generación de cotizaciones en PDF y agenda de instalaciones solares.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge green">
            <i className="fa-solid fa-boxes-stacked mr-1"></i>
            {cart.length} productos en carrito
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3">
          <i className="fa-solid fa-triangle-exclamation text-lg"></i>
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center gap-3">
          <i className="fa-solid fa-circle-check text-lg"></i>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col (7): Products & Cart */}
        <div className="lg:col-span-7 space-y-6">
          {/* Product Search */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                <i className="fa-solid fa-boxes-stacked text-[var(--primary)] text-sm"></i>
                Catálogo de Productos para Venta
              </h3>
              <span className="text-xs text-[var(--text-sec)]">
                {products.filter((p) => p.stock_quantity > 0).length} con stock
              </span>
            </div>

            <div className="relative" ref={productDropdownRef}>
              <div className="float-group !mb-0">
                <input
                  type="text"
                  id="search-sale-product"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder=" "
                  className="has-val"
                />
                <label htmlFor="search-sale-product">
                  Buscar producto por nombre o descripción...
                </label>
              </div>

              {isDropdownOpen && (
                <div className="absolute z-20 mt-2 w-full bg-[var(--bg-glass-dropdown)] backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-2xl max-h-72 overflow-y-auto p-2">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-3 hover:bg-[rgba(242,140,40,0.1)] rounded-lg cursor-pointer flex justify-between items-center transition-colors group mb-1"
                        onClick={() => addToCart(product)}
                      >
                        <div>
                          <div className="font-semibold text-sm text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">
                            {product.name}
                          </div>
                          <div className="text-xs text-[var(--text-sec)] mt-0.5">
                            Stock disponible:{" "}
                            <strong className="text-emerald-500">
                              {product.stock_quantity}
                            </strong>{" "}
                            | Precio:{" "}
                            <span className="font-semibold text-[var(--text-main)]">
                              ${parseFloat(product.base_price_usd).toFixed(2)} USD
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline text-xs !py-1 !px-2.5"
                        >
                          <i className="fa-solid fa-plus mr-1"></i>
                          Agregar
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-[var(--text-sec)]">
                      No se encontraron productos disponibles con stock.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart List */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                <i className="fa-solid fa-cart-shopping text-[var(--primary)] text-sm"></i>
                Productos en Carrito ({cart.length})
              </h3>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs text-[var(--text-sec)] hover:text-red-500 transition-colors"
                >
                  Vaciar carrito
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-[var(--text-sec)]">
                <i className="fa-solid fa-basket-shopping text-4xl mb-3 opacity-30 block"></i>
                <p className="text-sm">El carrito de compras está vacío.</p>
                <p className="text-xs mt-1 opacity-70">
                  Selecciona productos arriba para agregarlos a la cotización o venta.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] hover:border-[var(--primary)] transition-all"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-[var(--text-main)]">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-[var(--text-sec)] mt-0.5">
                          Precio unitario:{" "}
                          <span className="font-semibold text-[var(--text-main)]">
                            ${item.price.toFixed(2)} USD
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="btn-icon text-red-500 hover:text-red-700 !p-1.5"
                        title="Quitar ítem"
                      >
                        <i className="fa-solid fa-trash-can text-sm"></i>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-[var(--text-sec)]">
                          Cantidad:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={item.product.stock_quantity + item.quantity}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.product.id, e.target.value)
                          }
                          className="w-20 px-2 py-1 text-center font-bold text-sm border border-[var(--border)] rounded-lg bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                        <span className="text-xs text-[var(--text-sec)] ml-1">
                          (Stock: {item.product.stock_quantity})
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-[var(--text-sec)] block">
                          Subtotal ítem
                        </span>
                        <span className="font-extrabold text-base text-[var(--primary)]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col (5): Customer & Sale Checkout */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card">
            <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2 mb-6">
              <i className="fa-solid fa-file-invoice text-[var(--primary)] text-sm"></i>
              Comprobante & Cliente
            </h3>

            {/* Customer Search Dropdown */}
            <div className="relative mb-4" ref={customerDropdownRef}>
              <div className="float-group !mb-0">
                <input
                  type="text"
                  id="checkout-customer"
                  value={customerSearchTerm}
                  onChange={(e) => {
                    setCustomerSearchTerm(e.target.value);
                    setIsCustomerDropdownOpen(true);
                  }}
                  onFocus={() => setIsCustomerDropdownOpen(true)}
                  placeholder=" "
                  className="has-val"
                />
                <label htmlFor="checkout-customer">
                  Seleccionar o Buscar Cliente...
                </label>
              </div>

              {isCustomerDropdownOpen && (
                <div className="absolute z-20 mt-2 w-full bg-[var(--bg-glass-dropdown)] backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-2xl max-h-60 overflow-y-auto p-2">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => {
                      const fullCustomer = getFullCustomer(customer.id);
                      if (!fullCustomer) return null;

                      return (
                        <div
                          key={customer.id}
                          className="p-3 hover:bg-[rgba(242,140,40,0.1)] rounded-lg cursor-pointer transition-colors mb-1"
                          onClick={() => selectCustomer(fullCustomer)}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm text-[var(--text-main)]">
                              {customer.customer_type === "I"
                                ? `${fullCustomer.first_name} ${fullCustomer.last_name}`
                                : fullCustomer.company_name}
                            </span>
                            {customer.customer_type === "I" ? (
                              <Badge color="orange">Natural</Badge>
                            ) : (
                              <Badge color="yellow">Jurídico</Badge>
                            )}
                          </div>
                          <div className="text-xs text-[var(--text-sec)]">
                            {customer.customer_type === "I"
                              ? `Cédula: ${fullCustomer.identity_card || "N/A"}`
                              : `RUC: ${fullCustomer.tax_id || "N/A"}`}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-[var(--text-sec)]">
                      No se encontraron clientes coincidentes.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="float-group">
              <select
                id="checkout-payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="has-val"
              >
                <option value="Efectivo">Efectivo (Dólares / Córdobas)</option>
                <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                <option value="Transferencia">Transferencia Bancaria</option>
              </select>
              <label htmlFor="checkout-payment">Método de Pago</label>
            </div>

            {/* Requires Installation Checkbox */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="requiresInstallation"
                  checked={requiresInstallation}
                  onChange={(e) => setRequiresInstallation(e.target.checked)}
                  className="w-4 h-4 text-[var(--primary)] rounded focus:ring-[var(--primary)] accent-[var(--primary)] cursor-pointer"
                />
                <label
                  htmlFor="requiresInstallation"
                  className="text-sm font-semibold text-[var(--text-main)] cursor-pointer flex items-center gap-2"
                >
                  <i className="fa-solid fa-solar-panel text-[var(--primary)]"></i>
                  ¿Requiere servicio de instalación técnica?
                </label>
              </div>

              {requiresInstallation && (
                <div className="space-y-4 mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="float-group !mb-0">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      id="installation-price"
                      value={installationPrice}
                      onChange={(e) => setInstallationPrice(e.target.value)}
                      placeholder=" "
                      className="has-val"
                    />
                    <label htmlFor="installation-price">
                      Costo del Servicio de Instalación ($)
                    </label>
                  </div>

                  <div className="float-group !mb-0">
                    <input
                      type="text"
                      id="installation-address"
                      value={installationAddress}
                      onChange={(e) => setInstallationAddress(e.target.value)}
                      placeholder=" "
                      className={installationAddress ? "has-val" : ""}
                      required
                    />
                    <label htmlFor="installation-address">
                      Dirección del Proyecto Solar *
                    </label>
                  </div>

                  <div className="float-group !mb-0">
                    <input
                      type="date"
                      id="installation-date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      required
                      className="has-val"
                    />
                    <label htmlFor="installation-date">
                      Fecha Programada de Montaje *
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Total Summary */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] space-y-2 mt-4">
              <div className="flex justify-between text-xs text-[var(--text-sec)]">
                <span>Subtotal Equipos Solares:</span>
                <span className="font-semibold text-[var(--text-main)]">
                  ${calculateSubtotal().toFixed(2)}
                </span>
              </div>
              {requiresInstallation && (
                <div className="flex justify-between text-xs text-[var(--text-sec)]">
                  <span>Servicio de Instalación:</span>
                  <span className="font-semibold text-blue-500">
                    ${parseFloat(installationPrice || 0).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-[var(--border)] flex justify-between items-baseline">
                <span className="font-bold text-sm text-[var(--text-main)]">
                  Total Final (USD):
                </span>
                <span className="font-extrabold text-2xl text-[var(--primary)]">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={generateProforma}
                disabled={cart.length === 0 || !customerId}
                className="btn btn-outline justify-center !py-3 text-sm font-semibold"
                title="Descargar proforma en formato PDF oficial"
              >
                <i className="fa-solid fa-file-pdf mr-1.5 text-red-500"></i>
                Proforma PDF
              </button>
              <button
                type="button"
                onClick={processSale}
                disabled={
                  cart.length === 0 ||
                  isLoading ||
                  !customerId ||
                  (requiresInstallation &&
                    (!installationAddress || !scheduledDate))
                }
                className="btn btn-primary justify-center !py-3 text-sm font-semibold"
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check-double mr-1.5"></i>
                    <span>Finalizar Venta</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PointOfSalePage;
