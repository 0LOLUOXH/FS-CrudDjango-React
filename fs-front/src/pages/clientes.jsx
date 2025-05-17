import {useEffect, useState} from 'react'
import { fetchClientesNaturales, fetchClientesJuridicos } from '../api/clientes_api'
import { Ingresar_Cliente } from '../components/ingresarcliente'

function clientes (){

    const [clientes, setClientes] = useState([]);
    const [clientes2, setClientes2] = useState([]);

    useEffect(() => {
        async function getClientes() {
            const res = await fetchClientesNaturales();
            const res2 = await fetchClientesJuridicos();
            setClientes(res);
            setClientes2(res2);
            console.log(res);
            console.log(res2);

        }

        getClientes();
    }, [])

    return (
            <div>
                <h1>
                    Clientes
                </h1>
                
                {clientes.map((cliente) => (
                    <div key={cliente.cliente}>
                        <h2>Identificador: {cliente.cliente}</h2>
                        <h2>Cliente: {cliente.nombre} {cliente.apellido}</h2>
                        <p>Cedula: {cliente.cedula}</p>
                        <p>Teléfono: {cliente.telefono}</p>                        
                        <hr />
                    </div>
                ))} 
                {clientes2.map((cliente) => (
                    <div key={cliente.cliente}>
                        <h2>Identificador: {cliente.cliente}</h2>
                        <h2>razon_social: {cliente.razon_social}</h2>
                        <h2>ruc: {cliente.ruc}</h2>
                        <p>Teléfono: {cliente.telefono}</p>                        
                        <hr />
                    </div>
                ))} 

                <Ingresar_Cliente />
            </div>
    )
}

export default clientes