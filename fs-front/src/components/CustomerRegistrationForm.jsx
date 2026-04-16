import { useState } from 'react';
import { createCustomer, createIndividualCustomer, createCorporateCustomer } from '../api/customers_api'

export function CustomerRegistrationForm() {
    const [customerType, setCustomerType] = useState('individual');
    
    const initialIndividual = {
        first_name: '',
        last_name: '',
        identity_card: '',
        phone: ''
    };
    
    const initialCorporate = {
        company_name: '',
        tax_id: '',
        phone: ''
    };
    
    const [individual, setIndividual] = useState(initialIndividual);
    const [corporate, setCorporate] = useState(initialCorporate);

    const clearForms = () => {
        setIndividual(initialIndividual);
        setCorporate(initialCorporate);
    };

    const handleCustomerTypeChange = (e) => {
        setCustomerType(e.target.value);
        clearForms();
    };

    const handleIndividualChange = (e) => {
        const { name, value } = e.target;
        setIndividual({
            ...individual,
            [name]: value
        });
    };

    const handleCorporateChange = (e) => {
        const { name, value } = e.target;
        setCorporate({
            ...corporate,
            [name]: value
        });
    };

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (customerType === 'individual') {
            const res = await createCustomer({
                'customer_type': 'I',
                'phone': individual.phone
            });

            if (res && res.data) {
                await createIndividualCustomer({
                    'customer': res.data.id,
                    'first_name': individual.first_name,
                    'last_name': individual.last_name,
                    'identity_card': individual.identity_card,
                });
            }
            clearForms();
        } else {
            const res = await createCustomer({
                'customer_type': 'C',
                'phone': corporate.phone
            });

            if (res && res.data) {
                await createCorporateCustomer({
                    'customer': res.data.id,
                    'company_name': corporate.company_name,
                    'tax_id': corporate.tax_id,
                });
            }
            clearForms();
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">Ingresar Cliente</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-gray-700 mb-2">
                            Tipo de cliente
                        </label>
                        <select
                            name="customer_type"
                            value={customerType}
                            onChange={handleCustomerTypeChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="individual">Natural</option>
                            <option value="corporate">Jurídico</option>
                        </select>
                    </div>

                    {customerType === 'individual' ? (
                        <>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={individual.first_name}
                                    onChange={handleIndividualChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={individual.last_name}
                                    onChange={handleIndividualChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Cédula
                                </label>
                                <input
                                    type="text"
                                    name="identity_card"
                                    value={individual.identity_card}
                                    onChange={handleIndividualChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={individual.phone}
                                    onChange={handleIndividualChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="col-span-2">
                                <label className="block text-gray-700 mb-2">
                                    Razón Social
                                </label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={corporate.company_name}
                                    onChange={handleCorporateChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    RUC
                                </label>
                                <input
                                    type="text"
                                    name="tax_id"
                                    value={corporate.tax_id}
                                    onChange={handleCorporateChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={corporate.phone}
                                    onChange={handleCorporateChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-8">
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150"
                    >
                        Registrar Cliente
                    </button>
                </div>
            </form>
        </div>
    );
}