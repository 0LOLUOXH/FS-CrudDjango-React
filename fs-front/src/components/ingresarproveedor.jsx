import { useEffect, useState } from 'react'
import { fetchProveedores, createProveedor } from '../api/proveedor_api'
import { useForm } from 'react-hook-form'

export function Ingresar_Proveedor (){
    const [Proveedores, setProveedor] = useState([]);
    const { register, handleSubmit } = useForm();
    
    useEffect(() => {
        async function getProveedores() {
            const res = await fetchProveedores();
            setProveedor(res);
            console.log(res);
        }

        getProveedores();
    }, []);
    
    const onUp = handleSubmit(async (data) => {
        const response = await createProveedor(data);
        console.log(response);
        location.reload();
    });
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Ingresar Proveedor</h2>

            <form onSubmit={onUp}>
                <label htmlFor="cedula">Cedula:</label>
                <input  type="text" 
                placeholder="Cedula"
                {...register('cedula', {required: true, minLength: 16, maxLength: 16})} 
                name="cedula"/>
                <br />

                <label htmlFor="nombre">Nombre:</label>
                <input  type="text" 
                placeholder="Nombre"
                {...register('nombre', {required: true, minLength: 3, maxLength: 50})} 
                name="nombre"/>
                <br />

                <label htmlFor="apellido">Apellido:</label>
                <input  type="text" 
                placeholder="Apellido"
                {...register('apellido', {required: true, minLength: 4, maxLength: 50})} 
                name="apellido"/>
                <br />

                <label htmlFor="telefono">Telefono:</label>
                <input  type="text" 
                placeholder="Telefono"
                {...register('telefono', {required: true, minLength: 8, maxLength: 8})} 
                name="telefono"/>
                <br />

                <button type="submit">Confirmar</button>
            </form>
        </div>
    )
}   