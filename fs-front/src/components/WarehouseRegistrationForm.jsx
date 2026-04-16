import { useEffect, useState } from 'react'
import { createWarehouse } from '../api/inventory_api'
import { getAllUser } from '../api/auth_api'
import { useForm } from 'react-hook-form'

export function WarehouseRegistrationForm() {
    const [users, setUsers] = useState([]);
    const { register, handleSubmit } = useForm();
    
    useEffect(() => {
        async function getUsers() {
            try {
                const res = await getAllUser();
                setUsers(res.data);
                console.log(res.data);
            } catch (error) {
                console.error(error);
            }
        }

        getUsers();
    }, [])

    const onSubmitForm = handleSubmit(async (data) => {
        try {
            const payload = {
                name: data.name,
                capacity: data.capacity,
                is_active: data.is_active,
                manager: data.manager
            };
            const response = await createWarehouse(payload);
            console.log(response);
            location.reload();
        } catch (error) {
            console.error(error);
        }
    });
    
    return (
        <div>
            <h2>Ingresar Bodega</h2>

            <form onSubmit={onSubmitForm}>
                <label htmlFor="name">Nombre:</label>
                <input  type="text" 
                placeholder="Nombre"
                {...register('name', {required: true, minLength: 3, maxLength: 50})} 
                name="name"/>
                <br />

                <label htmlFor="capacity">Capacidad:</label>
                <input type="number" 
                placeholder="Capacidad"
                {...register('capacity', {required: true, min: 1})}
                name="capacity"/>
                <br />

                <label htmlFor="is_active">Estado</label>
                <input type="checkbox"
                placeholder="Estado"
                {...register('is_active')}
                name="is_active" />
                <br />

                <label htmlFor="manager">Manager:</label>
                <select name="manager" 
                {...register('manager', {required: true})}>

                    <option value="">Selecciona un usuario</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                </select>

                <button type="submit">Confirmar</button>
            </form>
        </div>
    )
}