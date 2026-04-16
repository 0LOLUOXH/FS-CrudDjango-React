import { createSupplier } from '../api/suppliers_api'
import { useForm } from 'react-hook-form'

export function SupplierRegistrationForm (){
    const { register, handleSubmit } = useForm();
    
    const onSubmitForm = handleSubmit(async (data) => {
        try {
            const payload = {
                tax_id: data.tax_id,
                company_name: data.company_name,
                representative: data.representative || '',
                phone: data.phone
            };
            const response = await createSupplier(payload);
            console.log(response);
            location.reload();
        } catch (error) {
            console.error(error);
        }
    });
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Ingresar Proveedor</h2>

            <form onSubmit={onSubmitForm}>
                <label htmlFor="tax_id">RUC:</label>
                <input  type="text" 
                placeholder="RUC"
                {...register('tax_id', {required: true})} 
                name="tax_id"/>
                <br />

                <label htmlFor="company_name">Razón Social:</label>
                <input  type="text" 
                placeholder="Razón Social"
                {...register('company_name', {required: true, minLength: 3, maxLength: 100})} 
                name="company_name"/>
                <br />

                <label htmlFor="representative">Representante:</label>
                <input  type="text" 
                placeholder="Representante"
                {...register('representative')} 
                name="representative"/>
                <br />

                <label htmlFor="phone">Teléfono:</label>
                <input  type="text" 
                placeholder="Teléfono"
                {...register('phone', {required: true, minLength: 8, maxLength: 20})} 
                name="phone"/>
                <br />

                <button type="submit">Confirmar</button>
            </form>
        </div>
    )
}   