import React, { useEffect, useState } from 'react';
import { 
  fetchClientesNaturales, 
  fetchClientesJuridicos,
  updateClienteNatural,
  updateClienteJuridico,
  deleteClienteNatural,
  deleteClienteJuridico,
  deleteCliente
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
    razon_social: '',
    ruc: ''
  });
  const [editingClient, setEditingClient] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    tipo: 'Natural',
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    razon_social: '',
    ruc: ''
  });

  useEffect(() => {
    async function load() {
      setNaturales(await fetchClientesNaturales());
      setJuridicos(await fetchClientesJuridicos());
    }
    load();
  }, []);

  const allClients = [
    ...naturales.map(c => ({
      tipo: 'Natural',
      id: c.cliente,
      nombre: c.nombre,
      apellido: c.apellido,
      cedula: c.cedula,
      telefono: c.telefono,
      rawData: c
    })),
    ...juridicos.map(c => ({
      tipo: 'Juridico',
      id: c.cliente,
      razon_social: c.razon_social,
      ruc: c.ruc,
      telefono: c.telefono,
      rawData: c
    }))
  ].filter(c => 
    (c.tipo === 'Natural' 
      ? `${c.nombre} ${c.apellido}`.toLowerCase() 
      : c.razon_social.toLowerCase()
    ).includes(search.toLowerCase())
  );

  const handleEditClick = (client) => {
    setEditingClient(client);
    if (client.tipo === 'Natural') {
      setEditFormData({
        tipo: 'Natural',
        nombre: client.nombre,
        apellido: client.apellido,
        cedula: client.cedula,
        telefono: client.telefono,
        razon_social: '',
        ruc: ''
      });
    } else {
      setEditFormData({
        tipo: 'Juridico',
        nombre: '',
        apellido: '',
        cedula: '',
        telefono: client.telefono,
        razon_social: client.razon_social,
        ruc: client.ruc
      });
    }
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editFormData.tipo === 'Natural') {
        await updateClienteNatural(editingClient.id, {
          nombre: editFormData.nombre,
          apellido: editFormData.apellido,
          cedula: editFormData.cedula,
          telefono: editFormData.telefono
        });
      } else {
        await updateClienteJuridico(editingClient.id, {
          razon_social: editFormData.razon_social,
          ruc: editFormData.ruc,
          telefono: editFormData.telefono
        });
      }
      
      // Refresh data
      setNaturales(await fetchClientesNaturales());
      setJuridicos(await fetchClientesJuridicos());
      setIsEditOpen(false);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteClick = async (id, tipo) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    console.log('Deleting client with ID:', id);
    
    if (tipo === 'Natural') {
      try {
        await deleteClienteNatural(id);
        await deleteCliente(id);
        // Refresh data
        const updatedClientes = await fetchClientesNaturales();
        setNaturales(updatedClientes);
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    } else {
      try {
        await deleteClienteJuridico(id);
        await deleteCliente(id);
        // Refresh data
        const updatedClientes = await fetchClientesJuridicos();
        setJuridicos(updatedClientes);
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-100">
      {/* Formulario en columna izquierda */}
      <div className="w-1/2 bg-white rounded-lg shadow m-6 p-6 overflow-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ingresar Cliente</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="text-gray-700">Tipo de cliente</span>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2"
              value={formData.tipo}
              onChange={e => setFormData({ ...formData, tipo: e.target.value })}
            >
              <option>Natural</option>
              <option>Juridico</option>
            </select>
          </label>
          {formData.tipo === 'Natural' ? (
            <>                
              <label className="block">
                <span className="text-gray-700">Nombre</span>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-gray-700">Apellido</span>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={formData.apellido}
                  onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-gray-700">Cédula</span>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={formData.cedula}
                  onChange={e => setFormData({ ...formData, cedula: e.target.value })}
                />
              </label>
            </>
          ) : (
            <>
              <label className="block">
                <span className="text-gray-700">Razón Social</span>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={formData.razon_social}
                  onChange={e => setFormData({ ...formData, razon_social: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-gray-700">RUC</span>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={formData.ruc}
                  onChange={e => setFormData({ ...formData, ruc: e.target.value })}
                />
              </label>
            </>
          )}
          <label className="block">
            <span className="text-gray-700">Teléfono</span>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2"
              value={formData.telefono}
              onChange={e => setFormData({ ...formData, telefono: e.target.value })}
            />
          </label>
          <button className="w-full bg-[#549ABE] text-white px-4 py-2 rounded-lg hover:bg-[#417887] transition">
            Enviar
          </button>
        </div>
      </div>

      {/* Tabla y acciones en columna derecha */}
      <div className="w-1/2 bg-white rounded-lg shadow m-6 p-6 flex flex-col">
        <div className="flex items-center mb-4 space-x-4">
          <input
            type="text"
            placeholder="Buscar cliente..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#15608B]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-[#15608B] text-white">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Nombre / Razón</th>
                <th className="px-4 py-2">Documento</th>
                <th className="px-4 py-2">Teléfono</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {allClients.map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-2">{c.id}</td>
                  <td className="px-4 py-2">{c.tipo}</td>
                  <td className="px-4 py-2">
                    {c.tipo === 'Natural' ? `${c.nombre} ${c.apellido}` : c.razon_social}
                  </td>
                  <td className="px-4 py-2">
                    {c.tipo === 'Natural' ? c.cedula : c.ruc}
                  </td>
                  <td className="px-4 py-2">{c.telefono}</td>
                  <td className="px-4 py-2">
                    <button 
                      onClick={() => handleEditClick(c)}
                      className="text-[#15608B] hover:text-[#0e4a6b]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(c.id, c.tipo)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">                        
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup de edición */}
      {isEditOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Editar Cliente {editingClient?.tipo}
            </h2>
            
            <form onSubmit={handleEditSubmit}>
              {editFormData.tipo === 'Natural' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      className="w-full border rounded-lg px-4 py-2"
                      value={editFormData.nombre}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Apellido</label>
                    <input
                      type="text"
                      name="apellido"
                      className="w-full border rounded-lg px-4 py-2"
                      value={editFormData.apellido}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Cédula</label>
                    <input
                      type="text"
                      name="cedula"
                      className="w-full border rounded-lg px-4 py-2"
                      value={editFormData.cedula}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Razón Social</label>
                    <input
                      type="text"
                      name="razon_social"
                      className="w-full border rounded-lg px-4 py-2"
                      value={editFormData.razon_social}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">RUC</label>
                    <input
                      type="text"
                      name="ruc"
                      className="w-full border rounded-lg px-4 py-2"
                      value={editFormData.ruc}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </>
              )}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  className="w-full border rounded-lg px-4 py-2"
                  value={editFormData.telefono}
                  onChange={handleEditChange}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#15608B] text-white rounded-lg hover:bg-[#0e4a6b]"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}