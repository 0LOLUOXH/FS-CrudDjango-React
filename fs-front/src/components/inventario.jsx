import {useEffect, useState} from 'react'
import { fetchProductos } from '../api/producto_api'

export function Inventario (){

    const [productos, setProductos] = useState([]);

    useEffect(() => {
        async function getProductos() {
            const res = await fetchProductos();
            setProductos(res);
        }

        getProductos();
    }, [])

    return (
        <div>
            <h1>
                Inventario
            </h1>
            
            {productos.map((producto) => (
                <div key={producto.id}>
                    <h2>{producto.nombre}</h2>
                    <p>{producto.preciounitario}</p>
                    <hr />
                </div>
            ))}

        </div>
    )
}