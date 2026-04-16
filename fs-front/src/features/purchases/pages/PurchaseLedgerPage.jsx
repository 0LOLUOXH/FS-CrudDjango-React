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
        <div>
            <div className="w-full mx-auto container mt-10">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <PurchaseHistoryTable data={purchaseData} />
                )}
            </div>
        </div>
    )
}

export default PurchaseLedgerPage;
