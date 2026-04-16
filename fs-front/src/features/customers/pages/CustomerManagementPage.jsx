import React, { useEffect, useState } from 'react';
import {
  getAllIndividualCustomers,
  getAllCorporateCustomers,
  updateIndividualCustomer,
  updateCorporateCustomer,
  updateCustomer,
  createCustomer,
  createIndividualCustomer,
  createCorporateCustomer
} from '../../../api/customers_api';

export default function CustomerManagementPage() {
  const [individuals, setIndividuals] = useState([]);
  const [corporates, setCorporates] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    type: 'Individual',
    first_name: '',
    last_name: '',
    identity_card: '',
    phone: '',
    email: '',
    is_active: true,
    company_name: '',
    tax_id: '',
    representative: ''
  });
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const [indRes, corpRes] = await Promise.all([
        getAllIndividualCustomers(),
        getAllCorporateCustomers()
      ]);
      setIndividuals(indRes.data);
      setCorporates(corpRes.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const allClients = [
    ...individuals.map(c => ({
      type: 'Individual',
      id: c.customer,
      name: c.first_name,
      lastName: c.last_name,
      document: c.identity_card,
      email: c.email,
      is_active: c.is_active,
      representative: ''
    })),
    ...corporates.map(c => ({
      type: 'Corporate',
      id: c.customer,
      name: c.company_name,
      document: c.tax_id,
      email: c.email,
      is_active: c.is_active,
      representative: c.representative
    }))
  ].filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.document || '').includes(search) ||
    (c.representative && c.representative.toLowerCase().includes(search.toLowerCase()))
  );

  const openModal = (customer = null) => {
    if (customer) {
      setEditing(customer);
      if (customer.type === 'Individual') {
        setFormData({
          type: 'Individual',
          first_name: customer.name,
          last_name: customer.lastName,
          identity_card: customer.document,
          phone: '',
          email: customer.email || '',
          is_active: customer.is_active,
          company_name: '',
          tax_id: '',
          representative: ''
        });
      } else {
        setFormData({
          type: 'Corporate',
          first_name: '',
          last_name: '',
          identity_card: '',
          phone: '',
          email: customer.email || '',
          is_active: customer.is_active,
          company_name: customer.name,
          tax_id: customer.document,
          representative: customer.representative
        });
      }
      setIsCreating(false);
    } else {
      setFormData({
        type: 'Individual',
        first_name: '',
        last_name: '',
        identity_card: '',
        phone: '',
        email: '',
        is_active: true,
        company_name: '',
        tax_id: '',
        representative: ''
      });
      setEditing(null);
      setIsCreating(true);
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(d => ({ 
      ...d, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (isCreating) {
        const customerRes = await createCustomer({
          phone: formData.phone,
          customer_type: formData.type === 'Individual' ? 'I' : 'C'
        });

        if (formData.type === 'Individual') {
          await createIndividualCustomer({
            first_name: formData.first_name,
            last_name: formData.last_name,
            identity_card: formData.identity_card,
            customer: customerRes.data.id,
            email: formData.email,
            is_active: formData.is_active
          });
        } else {
          await createCorporateCustomer({
            company_name: formData.company_name,
            tax_id: formData.tax_id,
            customer: customerRes.data.id,
            email: formData.email,
            is_active: formData.is_active,
            representative: formData.representative
          });
        }
      } else {
        if (formData.type === 'Individual') {
          await updateCustomer(editing.id, {
            phone: formData.phone,
            customer_type: 'I'
          });
          
          await updateIndividualCustomer(editing.id, {
            first_name: formData.first_name,
            last_name: formData.last_name,
            identity_card: formData.identity_card,
            customer: editing.id,
            email: formData.email,
            is_active: formData.is_active
          });
        } else {
          await updateCustomer(editing.id, {
            phone: formData.phone,
            customer_type: 'C'
          });
          
          await updateCorporateCustomer(editing.id, {
            company_name: formData.company_name,
            tax_id: formData.tax_id,
            customer: editing.id,
            email: formData.email,
            is_active: formData.is_active,
            representative: formData.representative
          });
        }
      }
      
      await loadCustomers();
      setIsModalOpen(false);
      
    } catch (err) {
      console.error('Error completo:', {
        message: err.message,
        response: err.response,
        request: err.request,
        config: err.config
      });
      setError(`Error: ${err.response?.data?.message || err.message || 'Verifica los datos'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 inline-block mr-2 mb-1`}>
              <path d="M10 5a3 3 0 11-6 0 3 3 0 016 0ZM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572ZM16.25 5.75a.75.75 0 10-1.5 0v2h-2a.75.75 0 000 1.5h2v2a.75.75 0 001.5 0v-2h2a.75.75 0 000-1.5h-2v-2Z" />
            </svg>
            Nuevo Cliente
          </button>
        </div>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar cliente por nombre, documento o representante..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
          />
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['ID', 'Tipo', 'Nombre/Razón', 'Documento', 'Email', 'Representante', 'Estado', 'Acciones'].map(h => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allClients.map(c => (
              <tr key={`${c.type}-${c.id}`} className={!c.is_active ? 'bg-gray-100' : ''}>
                <td className="px-6 py-4 text-sm text-gray-700">{c.id}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.type === 'Individual' ? 'Natural' : 'Jurídico'}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {c.type === 'Individual' ? `${c.name} ${c.lastName || ''}` : c.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.document}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.email}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {c.type === 'Corporate' ? c.representative : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <span className={`px-2 py-1 rounded-full text-xs ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {c.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => openModal(c)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {allClients.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl text-[#081A2D] mb-4">
              {isCreating ? 'Nuevo Cliente' : 'Editar Cliente'}
            </h3>
            {error && (
              <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-gray-700">Tipo de Cliente</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                  disabled={!isCreating}
                >
                  <option value="Individual">Natural</option>
                  <option value="Corporate">Jurídico</option>
                </select>
              </div>

              {formData.type === 'Individual' ? (
                <>
                  <div className="space-y-1">
                    <label className="block text-gray-700">Nombre</label>
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-700">Apellido</label>
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-700">Cédula</label>
                    <input
                      name="identity_card"
                      value={formData.identity_card}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="block text-gray-700">Razón Social</label>
                    <input
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-700">RUC</label>
                    <input
                      name="tax_id"
                      value={formData.tax_id}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-700">Representante</label>
                    <input
                      name="representative"
                      value={formData.representative}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                      required={formData.type === 'Corporate'}
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="block text-gray-700">Teléfono</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="block text-gray-700">
                  Cliente Activo
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  disabled={isLoading}
                >
                  {isLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
