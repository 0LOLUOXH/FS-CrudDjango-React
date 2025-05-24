import { useState, useEffect } from 'react'
import { fetchVentas } from '../api/venta_api'
import { fetchDetalleVentas } from '../api/detalleventa_api'
import { fetchPrecioProveedorProductos } from '../api/precioproveedorproducto_api'
import TablaVentas from '../components/tabla_ventas'

function historialventa() {
  const [ventasConDetalles, setVentasConDetalles] = useState([])

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [ventas, detalles, precios] = await Promise.all([
          fetchVentas(),
          fetchDetalleVentas(),
          fetchPrecioProveedorProductos()
        ])

        // Crear un diccionario de precios por producto
        const preciosPorProducto = {}
        precios.forEach(precio => {
          const idProducto = precio.producto
          // solo tomamos el primer precio encontrado si hay varios
          if (!preciosPorProducto[idProducto]) {
            preciosPorProducto[idProducto] = precio.precio
          }
        })

        // Agrupar detalles por venta
        const detallesPorVenta = {}
        detalles.forEach(detalle => {
          const idVenta = detalle.venta
          if (!detallesPorVenta[idVenta]) {
            detallesPorVenta[idVenta] = []
          }

          const precioUnitario = preciosPorProducto[detalle.producto] || 0
          detallesPorVenta[idVenta].push({
            ...detalle,
            precio_unitario: precioUnitario
          })
        })

        // Unir ventas con sus detalles
        const ventasUnidas = ventas
          .map(venta => ({
            ...venta,
            detalles: detallesPorVenta[venta.id] || []
          }))
          .sort((a, b) => a.id - b.id)

        setVentasConDetalles(ventasUnidas)
      } catch (error) {
        console.error('Error al cargar ventas, detalles o precios:', error)
      }
    }

    cargarDatos()
  }, [])

  return (
    <div>
      <h1>Historial de Ventas</h1>
      {ventasConDetalles.map(venta => (
        <TablaVentas key={venta.id} data={venta} />
      ))}
    </div>
  )
}

export default historialventa
