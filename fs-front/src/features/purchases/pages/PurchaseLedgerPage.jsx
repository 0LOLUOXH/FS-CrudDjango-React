import { useState, useEffect } from 'react'
import PurchaseHistoryTable from '../../../components/PurchaseHistoryTable'
import { getAllPurchaseOrders, getAllPurchaseDetails } from '../../../api/purchases_api'
import { getAllSuppliers } from '../../../api/suppliers_api'
import { getAllProducts } from '../../../api/inventory_api'

function PurchaseLedgerPage() {
    const [purchaseData, setPurchaseData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                const [ordersRes, detailsRes, suppliersRes, productsRes] = await Promise.all([
                    getAllPurchaseOrders(),
                    getAllPurchaseDetails(),
                    getAllSuppliers(),
                    getAllProducts()
                ]);

                const orders = ordersRes.data;
                const details = detailsRes.data;
                const suppliers = suppliersRes.data;
                const products = productsRes.data;

                const supplierMap = {};
                suppliers.forEach(s => { supplierMap[s.id] = s.company_name; });

                const productMap = {};
                products.forEach(p => { productMap[p.id] = p.name; });

                const detailsByOrder = {};
                details.forEach(d => {
                    if (!detailsByOrder[d.purchase_order]) detailsByOrder[d.purchase_order] = [];
                    detailsByOrder[d.purchase_order].push(d);
                });

                const merged = orders.map(order => ({
                    ...order,
                    supplierName: supplierMap[order.supplier] || 'Proveedor desconocido',
                    products: (detailsByOrder[order.id] || []).map(d => ({
                        id: d.product,
                        name: productMap[d.product] || `Producto #${d.product}`,
                        quantity: d.quantity,
                        unitPrice: parseFloat(d.unit_price),
                        tax: parseFloat(d.unit_price) * 0.15,
                        total: (d.quantity * parseFloat(d.unit_price) * 1.15).toFixed(2)
                    }))
                })).sort((a, b) => b.id - a.id);

                setPurchaseData(merged);
            } catch (e) {
                console.error("Error cargando historial de compras:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6 animate-[fadeUp_0.4s_var(--ease-bounce)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
                        <i className="fa-solid fa-clock-rotate-left text-[var(--primary)]"></i>
                        Historial de Compras
                    </h1>
                    <p className="text-sm text-[var(--text-sec)] mt-1">
                        Libro de órdenes de compra a proveedores, comprobantes y exportaciones PDF/Excel.
                    </p>
                </div>
            </div>

            <div className="glass-card !p-6">
                {loading ? (
                    <div className="flex justify-center items-center h-64 gap-3 flex-col">
                        <i className="fa-solid fa-spinner fa-spin text-3xl text-[var(--primary)]"></i>
                        <span className="text-sm text-[var(--text-sec)] font-medium">Cargando libro de compras...</span>
                    </div>
                ) : (
                    <PurchaseHistoryTable data={purchaseData} />
                )}
            </div>
        </div>
    );
}

export default PurchaseLedgerPage;
