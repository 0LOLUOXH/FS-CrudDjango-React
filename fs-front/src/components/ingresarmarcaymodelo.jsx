import { useEffect, useState } from 'react'
import { createMarca, fetchMarcas } from '../api/marca_api'
import { createModelo } from '../api/modelo_api'
import { useForm } from 'react-hook-form'

export function IngresarMarca() {
    const { register, handleSubmit } = useForm();
    
    const onUp = handleSubmit(async (data) => {
            const response = await createMarca(data);
            console.log(response);
            location.reload();
        });

    return (
        <div>
            <h2>Ingresar Marca</h2>

            <form onSubmit={onUp}>
                <label htmlFor="nombre">Nombre:</label>
                <input type="text" 
                placeholder="Nombre"
                {...register('nombre', {required: true, minLength: 3, maxLength: 50})} 
                name="nombre"/>
                <br />
                <button type="submit">Crear</button>
            </form>
            <hr />
        </div>
    )
}               

export function IngresarModelo() {
    const [marcas, setMarcas] = useState([]);
    const { register, handleSubmit } = useForm();
    
    useEffect(() => {
        async function getMarcas() {
            const res = await fetchMarcas();
            setMarcas(res);
            console.log(res);
        }

        getMarcas();
    }, [])

    const onUpm = handleSubmit(async (data) => {
        console.log(data);
        const response = await createModelo(data);
        console.log(response);
        location.reload();
    });

    return (
        <div>
            <h2>Ingresar Modelo</h2>

            <form onSubmit={onUpm}>
                <label htmlFor="nombre">Nombre:</label>
                <input type="text" 
                placeholder="Nombre"
                {...register('nombre', {required: true, minLength: 3, maxLength: 50})} 
                name="nombre"/>
                <br />

                <label htmlFor="marca">Marca:</label>
                <select name="marca" 
                {...register('marca', {required: true})}>
                    <option value="">Selecciona una marca</option>
                    {marcas.map((marca) => (
                        <option key={Number(marca.id)} value={Number(marca.id)}>
                            {marca.nombre}
                        </option>
                    ))}
                </select>
                <br />
                <button type="submit">Crear</button>
            </form>
            <hr />
        </div>
    )
}