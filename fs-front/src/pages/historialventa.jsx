import { useState, useEffect } from 'react'
import { fetchVentas } from '../api/venta_api'
import { fetchDetalleVentas } from '../api/detalleventa_api'
import { fetchClientesNaturales, fetchClientesJuridicos } from '../api/clientes_api'
import TablaVentas from '../components/tabla_ventas'
import { Box } from '@mui/material'

function historialventa() {
    const [ventasConDetalles, setVentasConDetalles] = useState([])

    useEffect(() => {
        const cargarDatos = async () => {
        try {
            const [ventas, detalles, naturales, juridicos] = await Promise.all([
            fetchVentas(),
            fetchDetalleVentas(),
            fetchClientesNaturales(),
            fetchClientesJuridicos()
            ])

            const clienteNaturalPorId = {}
            naturales.forEach(nat => {
            clienteNaturalPorId[nat.cliente] = `${nat.nombre} ${nat.apellido}`
            })

            const clienteJuridicoPorId = {}
            juridicos.forEach(jur => {
            clienteJuridicoPorId[jur.cliente] = jur.razon_social
            })

            const detallesPorVenta = {}
            detalles.forEach(detalle => {
            const idVenta = detalle.venta
            if (!detallesPorVenta[idVenta]) detallesPorVenta[idVenta] = []
            detallesPorVenta[idVenta].push(detalle)
            })

            const ventasUnidas = ventas
            .map(venta => {
                const idCliente = venta.cliente
                const tipo = venta.tcliente
                const nombreCliente =
                tipo === 'N'
                    ? clienteNaturalPorId[idCliente] || 'Cliente Natural desconocido'
                    : clienteJuridicoPorId[idCliente] || 'Cliente Jurídico desconocido'

                return {
                ...venta,
                ncliente: nombreCliente,
                detalles: detallesPorVenta[venta.id] || []
                }
            })
            .sort((a, b) => a.id - b.id)

            setVentasConDetalles(ventasUnidas)
        } catch (error) {
            console.error('Error al cargar ventas:', error)
        }
        }

        cargarDatos()
    }, [])

    return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
        <Box width="90%" minWidth="300px">
            <TablaVentas data={ventasConDetalles} />
        </Box>
    </Box>
    )
}

export default historialventa
