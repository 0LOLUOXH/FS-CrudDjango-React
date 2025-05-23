import { useState, useEffect } from 'react'
import { TablaCompras } from '../components/tabla_compras'
import { fetchDetalleProveedors, updateDetalleProveedor, deleteDetalleProveedor } from '../api/detalleproveedor_api'

function historialcompra (){
    const [detallperoveedor, setDetalleProveedor] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const res = fetchDetalleProveedors();
                setDetalleProveedor(detallperoveedor);
                console.log(detallperoveedor);
                console.log(res);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [])
    return (
        <div>

            <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-slate-200 flex flex-col items-center justify-center px-6 py-12">

                <h1 className='text-2xl font-bold text-gray-800 text-center mb-4'>Historial de compras</h1>
                    
                {/* Logo */}
                <img
                    src="https://ik.imagekit.io/jfcrjyrcq/fusion_solar_logo.jpg?updatedAt=1747926845910"
                    alt="Logo Fusión Solar"
                    className="w-52 md:w-64 rounded-xl shadow-lg mb-8"
                />

                {/* Título y bienvenida */}
                <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">
                    Modulo en proceso
                </h1>
                <p className="text-lg text-gray-600 text-center max-w-2xl mb-10">
                    Gracias por su comprension
                </p>
            </div>
            {/* <div className="w-full mx-auto">
                <TablaCompras data={detallperoveedor} onUpdate={async () => {
                    const res = await fetchDetalleProveedors();
                    setProductos(res);
                }} />
            </div> */}
        </div>
    )
}

export default historialcompra