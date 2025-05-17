import {useEffect, useState} from 'react'
import { fetchBodega, fetchBodegas } from '../api/bodega_api'
import { Ingresar_Bodega } from '../components/ingresarbodega'


function bodega (){

    const [bodega, setBodega] = useState([]);

    useEffect(() => {
        async function getBodega() {
            const res = await fetchBodegas();
            setBodega(res);
            console.log(res);
        }

        getBodega();
    }, [])

    return (
        <div>
            <h1>
                Bodegas
            </h1>

            {bodega.map((bodega) => (
                <div key={bodega.id}>
                    <h2>Identificador: {bodega.id}</h2>
                    <h2>Nombre: {bodega.nombre}</h2>
                    <h2>Estado: {bodega.estado? 'Activo' : 'Inactivo'}</h2>
                    <h2>Capacidad: {bodega.capacidad}</h2>
                    <h2>Empleado: {bodega.empleado}</h2>
                    <hr />
                </div>
            ))}

            <Ingresar_Bodega />
        </div>
    )
}

export default bodega