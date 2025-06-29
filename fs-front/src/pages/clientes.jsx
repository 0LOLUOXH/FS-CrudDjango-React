import React, { useEffect, useState } from 'react';
import {
  fetchClientesNaturales,
  fetchClientesJuridicos,
  updateClienteNatural,
  updateClienteJuridico,
  deleteClienteNatural,
  deleteClienteJuridico,
  updateCliente,
  deleteCliente,
  createCliente,
  createClienteNatural,
  createClienteJuridico
} from '../api/clientes_api';

export default function Clientes() {
  const [naturales, setNaturales] = useState([]);
  const [juridicos, setJuridicos] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    tipo: 'Natural',
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    email: '',
    estado: true,
    razon_social: '',
    ruc: '',
    representante: ''
  });
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Carga inicial
  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    setIsLoading(true);
    try {
      const [nat, jur] = await Promise.all([
        fetchClientesNaturales(),
        fetchClientesJuridicos()
      ]);
      setNaturales(nat);
      setJuridicos(jur);
    } catch (err) {
      console.error(err);
      setError('Error al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  // Combina y filtra
  const allClients = [
    ...naturales.map(c => ({
      tipo: 'Natural',
      id: c.cliente,
      nombre: c.nombre,
      apellido: c.apellido,
      documento: c.cedula,
      telefono: c.telefono,
      email: c.email,
      estado: c.estado,
      representante: ''
    })),
    ...juridicos.map(c => ({
      tipo: 'Juridico',
      id: c.cliente,
      nombre: c.razon_social,
      documento: c.ruc,
      telefono: c.telefono,
      email: c.email,
      estado: c.estado,
      representante: c.representante
    }))
  ].filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.documento.includes(search) ||
    (c.representante && c.representante.toLowerCase().includes(search.toLowerCase()))
  );

  // Abrir modal para crear o editar
  const openModal = (cliente = null) => {
    if (cliente) {
      // Modo edición
      setEditing(cliente);
      if (cliente.tipo === 'Natural') {
        setFormData({
          tipo: 'Natural',
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          cedula: cliente.documento,
          telefono: cliente.telefono,
          email: cliente.email,
          estado: cliente.estado,
          razon_social: '',
          ruc: '',
          representante: ''
        });
      } else {
        setFormData({
          tipo: 'Juridico',
          nombre: '',
          apellido: '',
          cedula: '',
          telefono: cliente.telefono,
          email: cliente.email,
          estado: cliente.estado,
          razon_social: cliente.nombre,
          ruc: cliente.documento,
          representante: cliente.representante
        });
      }
      setIsCreating(false);
    } else {
      // Modo creación
      setFormData({
        tipo: 'Natural',
        nombre: '',
        apellido: '',
        cedula: '',
        telefono: '',
        email: '',
        estado: true,
        razon_social: '',
        ruc: '',
        representante: ''
      });
      setEditing(null);
      setIsCreating(true);
    }
    setError(null);
    setIsModalOpen(true);
  };

  // Handlers del formulario
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
        // Crear nuevo cliente
        const clienteBase = await createCliente({
          telefono: formData.telefono,
          email: formData.email,
          estado: formData.estado,
          tipo: formData.tipo === 'Natural' ? 'N' : 'J'
        });

        if (formData.tipo === 'Natural') {
          await createClienteNatural({
            nombre: formData.nombre,
            apellido: formData.apellido,
            cedula: formData.cedula,
            cliente: clienteBase.id,
            email: formData.email,
            estado: formData.estado
          });
        } else {
          await createClienteJuridico({
            razon_social: formData.razon_social,
            ruc: formData.ruc,
            cliente: clienteBase.id,
            email: formData.email,
            estado: formData.estado,
            representante: formData.representante
          });
        }
      } else {
        // Actualizar cliente existente
        if (formData.tipo === 'Natural') {
          await updateCliente(editing.id, {
            telefono: formData.telefono,
            email: formData.email,
            estado: formData.estado,
            tipo: 'N'
          });
          
          await updateClienteNatural(editing.id, {
            nombre: formData.nombre,
            apellido: formData.apellido,
            cedula: formData.cedula,
            cliente: editing.id,
            email: formData.email,
            estado: formData.estado
          });
        } else {
          await updateCliente(editing.id, {
            telefono: formData.telefono,
            email: formData.email,
            estado: formData.estado,
            tipo: 'J'
          });
          
          await updateClienteJuridico(editing.id, {
            razon_social: formData.razon_social,
            ruc: formData.ruc,
            cliente: editing.id,
            email: formData.email,
            estado: formData.estado,
            representante: formData.representante
          });
        }
      }
      
      // Refrescar datos
      await loadClientes();
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
      {/* === TABLA === */}
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 inline-block mr-2`}>
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
              {['ID', 'Tipo', 'Nombre/Razón', 'Documento', 'Teléfono', 'Email', 'Representante', 'Estado', 'Acciones'].map(h => (
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
              <tr key={c.id} className={!c.estado ? 'bg-gray-100' : ''}>
                <td className="px-6 py-4 text-sm text-gray-700">{c.id}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.tipo}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {c.tipo === 'Natural' ? `${c.nombre} ${c.apellido}` : c.nombre}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.documento}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.telefono}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.email}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {c.tipo === 'Juridico' ? c.representante : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <span className={`px-2 py-1 rounded-full text-xs ${c.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {c.estado ? 'Activo' : 'Inactivo'}
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
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* === MODAL DE CREACIÓN/EDICIÓN === */}
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
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                  disabled={!isCreating}
                >
                  <option value="Natural">Natural</option>
                  <option value="Juridico">Jurídico</option>
                </select>
              </div>

              {formData.tipo === 'Natural' ? (
                <>
                  <div className="space-y-1">
                    <label className="block text-gray-700">Nombre</label>
                    <input
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-700">Apellido</label>
                    <input
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-700">Cédula</label>
                    <input
                      name="cedula"
                      value={formData.cedula}
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
                      name="razon_social"
                      value={formData.razon_social}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-700">RUC</label>
                    <input
                      name="ruc"
                      value={formData.ruc}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-700">Representante</label>
                    <input
                      name="representante"
                      value={formData.representante}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                      required={formData.tipo === 'Juridico'}
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="block text-gray-700">Teléfono</label>
                <input
                  name="telefono"
                  value={formData.telefono}
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
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="estado"
                  id="estado"
                  checked={formData.estado}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="estado" className="block text-gray-700">
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