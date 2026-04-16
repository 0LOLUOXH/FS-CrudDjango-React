import { useEffect, useState } from 'react'
import { getAllBrands, createBrand } from '../api/inventory_api'
import { createModel } from '../api/inventory_api'
import { useForm } from 'react-hook-form'

export function BrandRegistrationForm() {
    const { register, handleSubmit } = useForm();
    
    const onSubmitForm = handleSubmit(async (data) => {
            const payload = { name: data.name };
            const response = await createBrand(payload);
            console.log(response);
            location.reload();
        });

    return (
        <div>
            <h2>Ingresar Marca</h2>

            <form onSubmit={onSubmitForm}>
                <label htmlFor="name">Nombre:</label>
                <input type="text" 
                placeholder="Nombre"
                {...register('name', {required: true, minLength: 3, maxLength: 50})} 
                name="name"/>
                <br />
                <button type="submit">Crear</button>
            </form>
            <hr />
        </div>
    )
}               

export function ModelRegistrationForm() {
    const [brands, setBrands] = useState([]);
    const { register, handleSubmit } = useForm();
    
    useEffect(() => {
        async function getBrands() {
            try {
                const res = await getAllBrands();
                setBrands(res.data);
            } catch (error) {
                console.error(error);
            }
        }

        getBrands();
    }, [])

    const onSubmitForm = handleSubmit(async (data) => {
        const payload = { name: data.name, brand: data.brand };
        const response = await createModel(payload);
        console.log(response);
        location.reload();
    });

    return (
        <div>
            <h2>Ingresar Modelo</h2>

            <form onSubmit={onSubmitForm}>
                <label htmlFor="name">Nombre:</label>
                <input type="text" 
                placeholder="Nombre"
                {...register('name', {required: true, minLength: 3, maxLength: 50})} 
                name="name"/>
                <br />

                <label htmlFor="brand">Marca:</label>
                <select name="brand" 
                {...register('brand', {required: true})}>
                    <option value="">Selecciona una marca</option>
                    {brands.map((brand) => (
                        <option key={Number(brand.id)} value={Number(brand.id)}>
                            {brand.name}
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