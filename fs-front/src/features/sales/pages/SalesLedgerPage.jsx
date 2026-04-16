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
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
        <Box width="90%" minWidth="300px">
            <SalesHistoryTable data={salesWithDetails} />
        </Box>
    </Box>
    )
}

export default SalesLedgerPage
