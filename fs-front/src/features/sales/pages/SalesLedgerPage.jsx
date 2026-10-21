import { useState, useEffect } from 'react'
import { getAllSales } from '../../../api/sales_api'
import { getAllSaleDetails } from '../../../api/sales_api'
import { getAllIndividualCustomers, getAllCorporateCustomers } from '../../../api/customers_api'
import SalesHistoryTable from '../../../components/SalesHistoryTable'
import { Box } from '@mui/material'

function SalesLedgerPage() {
    const [salesWithDetails, setSalesWithDetails] = useState([])

    useEffect(() => {
        const loadData = async () => {
        try {
            const [salesRes, detailsRes, individualsRes, corporatesRes] = await Promise.all([
                getAllSales(),
                getAllSaleDetails(),
                getAllIndividualCustomers(),
                getAllCorporateCustomers()
            ])

            const sales = salesRes.data;
            const details = detailsRes.data;
            const individuals = individualsRes.data;
            const corporates = corporatesRes.data;

            const individualByCustomerId = {}
            individuals.forEach(ind => {
                individualByCustomerId[ind.customer] = `${ind.first_name} ${ind.last_name}`
            })

            const corporateByCustomerId = {}
            corporates.forEach(corp => {
                corporateByCustomerId[corp.customer] = corp.company_name
            })

            const detailsBySale = {}
            details.forEach(detail => {
                const saleId = detail.sale
                if (!detailsBySale[saleId]) detailsBySale[saleId] = []
                detailsBySale[saleId].push(detail)
            })

            const joined = sales
            .map(sale => {
                const customerId = sale.customer
                const customerName =
                    individualByCustomerId[customerId] ||
                    corporateByCustomerId[customerId] ||
                    'Cliente desconocido'

                return {
                    ...sale,
                    customerName: customerName,
                    details: detailsBySale[sale.id] || []
                }
            })
            .sort((a, b) => b.id - a.id) // Descending order to show latest first

            setSalesWithDetails(joined)
        } catch (error) {
            console.error('Error loading sales ledger:', error)
        }
        }

        loadData()
    }, [])

    return (
        <div className="space-y-6 animate-[fadeUp_0.4s_var(--ease-bounce)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
                        <i className="fa-solid fa-receipt text-[var(--primary)]"></i>
                        Historial de Ventas
                    </h1>
                    <p className="text-sm text-[var(--text-sec)] mt-1">
                        Libro de facturación, emisión de comprobantes, proformas y exportación PDF/Excel.
                    </p>
                </div>
            </div>

            <div className="glass-card !p-6">
                <SalesHistoryTable data={salesWithDetails} />
            </div>
        </div>
    );
}

export default SalesLedgerPage
