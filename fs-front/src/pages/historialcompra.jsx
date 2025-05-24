import { useState, useEffect } from 'react'
import { TablaCompras } from '../components/tabla_compras'
import { fetchDetalleProveedors } from '../api/detalleproveedor_api'
import { fetchPrecioProveedorProductos } from '../api/precioproveedorproducto_api'

function HistorialCompra() {
    const [detalleProveedor, setDetalleProveedor] = useState([]);
    const [precios, setPrecios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                const [detallesRes, preciosRes] = await Promise.all([
                    fetchDetalleProveedors(),
                    fetchPrecioProveedorProductos()
                ]);

                setPrecios(preciosRes);
                
                const detallesConPrecios = detallesRes.map(detalle => {
                    // Buscar el precio que coincida con producto, proveedor Y número de comprobante
                    const precioEncontrado = preciosRes.find(
                        precio => 
                            precio.producto === detalle.producto && 
                            precio.proveedor === detalle.proveedor &&
                            precio.numero_comprobante === detalle.numero_comprobante
                    );
                    
                    // Si no encontramos precio exacto, buscar solo por producto y proveedor
                    const precioAlternativo = !precioEncontrado 
                        ? preciosRes.find(
                            precio => 
                                precio.producto === detalle.producto && 
                                precio.proveedor === detalle.proveedor
                          )
                        : null;

                    const precioFinal = precioEncontrado || precioAlternativo;
                    const precioUnitario = precioFinal ? parseFloat(precioFinal.precio) : 0;
                    const ivaCalculado = precioUnitario * 0.15;
                    const total = detalle.total_a_pagar || (detalle.cantidad * (precioUnitario + ivaCalculado));

                    return {
                        ...detalle,
                        precio_unitario: precioUnitario,
                        iva: ivaCalculado,
                        total_a_pagar: total
                    };
                });

                setDetalleProveedor(detallesConPrecios);
                console.log("Detalles con precios:", detallesConPrecios);
            } catch (e) {
                console.error("Error cargando datos:", e);
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
                    <TablaCompras data={detalleProveedor} />
                )}
            </div>
        </div>
    )
}

export default HistorialCompra;