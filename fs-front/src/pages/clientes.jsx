import {useEffect, useState} from 'react'
import { fetchClientes } from '../api/clientes_api'
import { Ingresar_Cliente } from '../components/ingresarcliente'

function clientes (){

    const [clientes, setClientes] = useState([]);

    useEffect(() => {
        async function getClientes() {
            const res = await fetchClientes();
            setClientes(res);
        }

        getClientes();
    }, [])

    return (
            <div>
                <h1>
                    Clientes
                </h1>
                
                {clientes.map((cliente) => (
                    <div key={cliente.id}>
                        <h2>{cliente.nombre}</h2>
                        <p>{cliente.direccion}</p>
                        <hr />
                    </div>
                ))} 

                <Ingresar_Cliente />
            </div>
    )
}

export default clientes