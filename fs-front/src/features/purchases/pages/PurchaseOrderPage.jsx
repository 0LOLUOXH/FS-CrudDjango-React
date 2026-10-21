import React, { useEffect, useState, useRef } from "react";
import {
  createPurchaseOrder,
  createPurchaseDetail,
} from "../../../api/purchases_api";
import {
  getAllProducts,
  partialUpdateProduct,
  getAllModels,
  getAllBrands,
} from "../../../api/inventory_api";
import { getAllSuppliers } from "../../../api/suppliers_api";
import { Badge } from "../../../components/ui/Badge";

function PurchaseOrderPage() {
  const TAX_RATE = 0.15; // 15% IVA

  const [formData, setFormData] = useState({
    payment_method: "",
    invoice_number: "",
    date: new Date().toISOString().split("T")[0],
    total_amount: 0,
    supplier: "",
  });

  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showProductList, setShowProductList] = useState(false);

  const productDropdownRef = useRef(null);

  // Click outside dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(event.target)
      ) {
        setShowProductList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [productsData, suppliersData, modelsData, brandsData] =
          await Promise.all([
            getAllProducts(),
            getAllSuppliers(),
            getAllModels(),
            getAllBrands(),
          ]);
        setProducts(productsData.data || []);
        setSuppliers(suppliersData.data || []);
        setModels(modelsData.data || []);
        setBrands(brandsData.data || []);
      } catch (err) {
        setError("Error al cargar los datos necesarios para compras");
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const getModelName = (modelId) => {
    const m = models.find((x) => x.id === modelId);
    return m ? m.name : "—";
  };

  const getBrandName = (modelId) => {
    const m = models.find((x) => x.id === modelId);
    if (!m) return "—";
    const b = brands.find((x) => x.id === m.brand);
    return b ? b.name : "—";
  };

  const filteredProducts = searchTerm
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description &&
            product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : products;

  const addToCart = (product) => {
    if (!product) return;

    const exists = cart.find((item) => item.product.id === product.id);

    if (exists) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: (item.quantity || 0) + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          stock: product.stock_quantity,
          product,
          quantity: 1,
          price: product.base_price_usd || "",
          tax: TAX_RATE,
        },
      ]);
    }

    setSearchTerm("");
    setShowProductList(false);
  };

  const updateQuantity = (productId, quantityStr) => {
    const quantity = quantityStr === "" ? "" : parseInt(quantityStr);
    if (quantity === "" || (!isNaN(quantity) && quantity >= 0)) {
      setCart(
        cart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const updatePrice = (productId, priceStr) => {
    const price = priceStr === "" ? "" : parseFloat(priceStr);
    if (price === "" || (!isNaN(price) && price >= 0)) {
      setCart(
        cart.map((item) =>
          item.product.id === productId ? { ...item, price } : item
        )
      );
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = item.price === "" ? 0 : parseFloat(item.price);
      const quantity = item.quantity === "" ? 0 : parseInt(item.quantity);
      return total + price * quantity;
    }, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * TAX_RATE;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.supplier) {
      setError("Por favor seleccione un proveedor.");
      return;
    }

    if (cart.length === 0) {
      setError("Debe agregar al menos un producto a la orden de compra.");
      return;
    }

    const invalidItems = cart.some(
      (item) =>
        item.quantity === "" ||
        isNaN(item.quantity) ||
        item.quantity <= 0 ||
        item.price === "" ||
        isNaN(item.price) ||
        item.price < 0
    );

    if (invalidItems) {
      setError("Complete correctamente todos los campos de cantidad y precio.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const orderRes = await createPurchaseOrder({
        supplier: parseInt(formData.supplier),
        invoice_number: formData.invoice_number,
        date: formData.date,
        payment_method: formData.payment_method,
        total_amount: calculateTotal(),
      });
      const order = orderRes.data;

      for (const item of cart) {
        await createPurchaseDetail({
          purchase_order: order.id,
          product: item.product.id,
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.price),
        });

        const newQuantity =
          Number(item.product.stock_quantity) + parseInt(item.quantity);
        await partialUpdateProduct(item.product.id, {
          stock_quantity: newQuantity,
        });
      }

      // Refresh products
      const updatedProducts = await getAllProducts();
      setProducts(updatedProducts.data || []);

      setFormData({
        payment_method: "",
        invoice_number: "",
        date: new Date().toISOString().split("T")[0],
        total_amount: 0,
        supplier: "",
      });
      setCart([]);
      setSearchTerm("");
      setSuccessMsg(`¡Orden de compra #${order.id} registrada exitosamente! Stock actualizado.`);
    } catch (err) {
      setError(
        "Error al registrar la compra: " +
          (err.response?.data?.message || err.message)
      );
      console.error("Error processing purchase:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  return (
    <div className="space-y-6 animate-[fadeUp_0.4s_var(--ease-bounce)]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
            <i className="fa-solid fa-cart-shopping text-[var(--primary)]"></i>
            Registrar Orden de Compra
          </h1>
          <p className="text-sm text-[var(--text-sec)] mt-1">
            Abastecimiento de inventario y recepción de suministros desde proveedores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge orange">
            <i className="fa-solid fa-boxes-stacked mr-1"></i>
            {cart.length} ítems en orden
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

      {/* Main 2-column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Product Search & Cart Items */}
        <div className="lg:col-span-7 space-y-6">
          {/* Product Search Card */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                <i className="fa-solid fa-magnifying-glass text-[var(--primary)] text-sm"></i>
                Seleccionar Producto a Comprar
              </h3>
              <span className="text-xs text-[var(--text-sec)]">
                {products.length} disponibles
              </span>
            </div>

            <div className="relative" ref={productDropdownRef}>
              <div className="float-group !mb-0">
                <input
                  type="text"
                  id="search-purchase-prod"
                  placeholder=" "
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowProductList(true);
                  }}
                  onFocus={() => setShowProductList(true)}
                  className="has-val"
                />
                <label htmlFor="search-purchase-prod">
                  Escribe nombre, código o descripción del producto...
                </label>
              </div>

              {/* Autocomplete Dropdown */}
              {showProductList && (
                <div className="absolute z-20 mt-2 w-full bg-[var(--bg-glass-dropdown)] backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-2xl max-h-72 overflow-y-auto p-2">
                  {filteredProducts
                    .filter((p) => !cart.some((c) => c.product.id === p.id))
                    .map((product) => (
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
                            Stock actual:{" "}
                            <strong className="text-[var(--text-main)]">
                              {product.stock_quantity}
                            </strong>{" "}
                            | Marca: {getBrandName(product.product_model)} | Modelo:{" "}
                            {getModelName(product.product_model)}
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
                    ))}

                  {filteredProducts.filter(
                    (p) => !cart.some((c) => c.product.id === p.id)
                  ).length === 0 && (
                    <div className="p-4 text-center text-xs text-[var(--text-sec)]">
                      {products.length === 0
                        ? "Cargando productos..."
                        : "Todos los productos coincidentes ya están en la orden."}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Items List */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                <i className="fa-solid fa-receipt text-[var(--primary)] text-sm"></i>
                Detalle de Productos en Orden ({cart.length})
              </h3>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs text-[var(--text-sec)] hover:text-red-500 transition-colors"
                >
                  Vaciar lista
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-[var(--text-sec)]">
                <i className="fa-solid fa-cart-arrow-down text-4xl mb-3 opacity-30 block"></i>
                <p className="text-sm">No has agregado productos a esta orden.</p>
                <p className="text-xs mt-1 opacity-70">
                  Usa el buscador superior para añadir paneles, inversores o componentes.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {cart.map((item) => {
                  const itemPrice =
                    item.price === "" ? 0 : parseFloat(item.price);
                  const itemQty =
                    item.quantity === "" ? 0 : parseInt(item.quantity);
                  const itemSubtotal = itemPrice * itemQty;
                  const itemTax = itemSubtotal * TAX_RATE;
                  const itemTotal = itemSubtotal + itemTax;

                  return (
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
                            Stock en almacén:{" "}
                            <span className="font-semibold text-[var(--text-main)]">
                              {item.product.stock_quantity} unid.
                            </span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="btn-icon text-red-500 hover:text-red-700 !p-1.5"
                          title="Eliminar de la orden"
                          aria-label={`Eliminar ${item.product.name}`}
                        >
                          <i className="fa-solid fa-trash-can text-sm"></i>
                        </button>
                      </div>

                      {/* Inputs Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                        <div className="float-group !mb-0">
                          <input
                            type="number"
                            min="1"
                            id={`qty-${item.product.id}`}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.product.id, e.target.value)
                            }
                            placeholder=" "
                            className="has-val text-center font-bold"
                          />
                          <label htmlFor={`qty-${item.product.id}`}>
                            Cantidad
                          </label>
                        </div>

                        <div className="float-group !mb-0">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            id={`price-${item.product.id}`}
                            value={item.price}
                            onChange={(e) =>
                              updatePrice(item.product.id, e.target.value)
                            }
                            placeholder=" "
                            className="has-val text-center font-bold"
                          />
                          <label htmlFor={`price-${item.product.id}`}>
                            Precio Unitario ($)
                          </label>
                        </div>

                        <div className="float-group !mb-0 opacity-80">
                          <input
                            type="text"
                            id={`tax-${item.product.id}`}
                            value={`$${itemTax.toFixed(2)}`}
                            readOnly
                            placeholder=" "
                            className="has-val text-center bg-[rgba(0,0,0,0.03)]"
                          />
                          <label htmlFor={`tax-${item.product.id}`}>
                            IVA (15%)
                          </label>
                        </div>
                      </div>

                      {/* Item Total Footer */}
                      <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex justify-between items-center text-xs">
                        <span className="text-[var(--text-sec)]">
                          Subtotal neto: ${itemSubtotal.toFixed(2)}
                        </span>
                        <span className="font-bold text-sm text-[var(--primary)]">
                          Total ítem: ${itemTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Purchase Order & Provider Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card">
            <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2 mb-6">
              <i className="fa-solid fa-file-invoice-dollar text-[var(--primary)] text-sm"></i>
              Datos de Facturación & Proveedor
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Proveedor */}
              <div className="float-group">
                <select
                  name="supplier"
                  id="order-supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  required
                  className="has-val"
                >
                  <option value="" disabled>
                    Seleccione un proveedor registrado
                  </option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.company_name}{" "}
                      {supplier.tax_id ? `| RUC: ${supplier.tax_id}` : ""}
                    </option>
                  ))}
                </select>
                <label htmlFor="order-supplier">Proveedor Suministrador</label>
              </div>

              {/* Factura / Comprobante */}
              <div className="float-group">
                <input
                  type="text"
                  id="order-invoice"
                  name="invoice_number"
                  placeholder=" "
                  value={formData.invoice_number}
                  onChange={handleChange}
                  required
                  className={formData.invoice_number ? "has-val" : ""}
                />
                <label htmlFor="order-invoice">
                  N° Comprobante / Factura del Proveedor
                </label>
              </div>

              {/* Fecha y Método de Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="float-group">
                  <input
                    type="date"
                    id="order-date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="has-val"
                  />
                  <label htmlFor="order-date">Fecha de Orden</label>
                </div>

                <div className="float-group">
                  <select
                    name="payment_method"
                    id="order-payment"
                    value={formData.payment_method}
                    onChange={handleChange}
                    required
                    className="has-val"
                  >
                    <option value="" disabled>
                      Seleccione método
                    </option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                    <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Crédito">Crédito Comercial</option>
                  </select>
                  <label htmlFor="order-payment">Condición de Pago</label>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] space-y-2.5 mt-6">
                <div className="flex justify-between text-xs text-[var(--text-sec)]">
                  <span>Subtotal Compra:</span>
                  <span className="font-semibold text-[var(--text-main)]">
                    ${calculateSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-sec)]">
                  <span>IVA Retenido (15%):</span>
                  <span className="font-semibold text-[var(--text-main)]">
                    ${calculateTax().toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[var(--border)] flex justify-between items-baseline">
                  <span className="font-bold text-sm text-[var(--text-main)]">
                    Total a Liquidar (USD):
                  </span>
                  <span className="font-extrabold text-2xl text-[var(--primary)]">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || cart.length === 0}
                className="btn btn-primary w-full !py-3 text-base justify-center mt-6 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Procesando compra...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-file-circle-check"></i>
                    <span>Registrar e Ingresar Stock</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseOrderPage;
