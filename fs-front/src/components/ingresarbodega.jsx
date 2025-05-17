import { useEffect, useState } from 'react'
import { fetchBodega, createBodega } from '../api/bodega_api'
import { fetchUsers } from '../api/user_api'
import { useForm } from 'react-hook-form'

export function Ingresar_Bodega (){
    const [Users, setUser] = useState([]);
    const { register, handleSubmit } = useForm();
    
    useEffect(() => {
        async function getUsers() {
            const res = await fetchUsers();
            setUser(res);
            console.log(res);
        }

        getUsers();
    }, [])

    const onUp = handleSubmit(async (data) => {
        const response = await createBodega(data);
        console.log(response);
        location.reload();
    });
    
    return (
        <div>
            <h2>Ingresar Bodega</h2>

            <form onSubmit={onUp}>
                <label htmlFor="nombre">Nombre:</label>
                <input  type="text" 
                placeholder="Nombre"
                {...register('nombre', {required: true, minLength: 3, maxLength: 50})} 
                name="nombre"/>
                <br />

                <label htmlFor="capacidad">Capacidad:</label>
                <input type="number" 
                placeholder="Capacidad"
                {...register('capacidad', {required: true, min: 1})}
                name="capacidad"/>
                <br />

                <label htmlFor="estado">Estado</label>
                <input type="checkbox"
                placeholder="Estado"
                {...register('estado')}
                name="estado" />
                <br />

                <label htmlFor="empleado">Empleado:</label>
                <select name="empleado" 
                {...register('empleado', {required: true})}>

                    <option value="">Selecciona un empleado</option>
                    {Users.map((user) => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                </select>

                <button type="submit">Confirmar</button>
            </form>
        </div>
    )
}