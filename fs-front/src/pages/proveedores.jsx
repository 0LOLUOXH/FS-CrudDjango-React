import { useEffect, useState } from 'react';
import {
  fetchProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor
} from '../api/proveedor_api';

export default function Proveedores() {
  // Estados
  const [proveedores, setProveedores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [editingProveedor, setEditingProveedor] = useState(null);
  const [formData, setFormData] = useState({
    ruc: '',
    razon_social: '',
    representante: '',
    email: '',
    telefono: '',
    estado: true
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carga inicial
  useEffect(() => {
    loadProveedores();
  }, []);

  async function loadProveedores() {
    setIsLoading(true);
    try {
      const data = await fetchProveedores();
      setProveedores(data);
      setError(null);
    } catch (err) {
      setError('Error cargando proveedores');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  // Abrir modal para crear o editar
  const openModal = (proveedor = null) => {
    if (proveedor) {
      // Modo edición
      setEditingProveedor(proveedor);
      setFormData({
        id: proveedor.id,
        ruc: proveedor.ruc,
        razon_social: proveedor.razon_social,
        representante: proveedor.representante || '',
        email: proveedor.email || '',
        telefono: proveedor.telefono,
        estado: proveedor.estado
      });
    } else {
      // Modo creación
      setFormData({
        ruc: '',
        razon_social: '',
        representante: '',
        email: '',
        telefono: '',
        estado: true
      });
      setEditingProveedor(null);
    }
    setError(null);
    setIsModalOpen(true);
  };

  // Handlers del formulario
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Crear o actualizar
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const proveedorData = {
        ruc: formData.ruc,
        razon_social: formData.razon_social,
        representante: formData.representante,
        email: formData.email,
        telefono: formData.telefono,
        estado: formData.estado
      };

      if (editingProveedor) {
        await updateProveedor(editingProveedor.id, proveedorData);
      } else {
        await createProveedor(proveedorData);
      }

      await loadProveedores();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error:', err);
      setError(`Error: ${err.response?.data?.message || err.message || 'Error al guardar proveedor'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar proveedores
  const filteredProveedores = proveedores.filter(p =>
    p.razon_social?.toLowerCase().includes(search.toLowerCase()) ||
    p.ruc?.includes(search) ||
    (p.representante?.toLowerCase().includes(search.toLowerCase())) ||
    p.telefono?.includes(search))
    .sort((a, b) => a.razon_social.localeCompare(b.razon_social));          
  

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
          <h2 className="text-2xl font-bold text-gray-800">Proveedores</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 inline-block mr-2`}>
              <path d="M6.5 3c-1.051 0-2.093.04-3.125.117A1.49 1.49 0 002 4.607V10.5h9V4.606c0-.771-.59-1.43-1.375-1.489A41.568 41.568 0 006.5 3ZM2 12v2.5A1.5 1.5 0 0 013.5 16h.041a3 3 0 015.918 0h.791a.75.75 0 00.75-.75V12H2Z" />
              <path d="M6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3ZM13.25 5a.75.75 0 00-.75.75v8.514a3.001 3.001 0 004.893 1.44c.37-.275.61-.719.595-1.227a24.905 24.905 0 00-1.784-8.549A1.486 1.486 0 0014.823 5H13.25ZM14.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3Z" />
            </svg>
            Nuevo Proveedor
          </button>
        </div>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por razón social, RUC, representante o teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
          />
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['ID', 'RUC', 'Razón Social', 'Representante', 'Teléfono', 'Email', 'Estado', 'Acciones'].map(h => (
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
            {filteredProveedores.map(p => (
              <tr key={p.id} className={!p.estado ? 'bg-gray-100' : ''}>
                <td className="px-6 py-4 text-sm text-gray-700">{p.id}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{p.ruc}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{p.razon_social}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{p.representante || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{p.telefono}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{p.email || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <span className={`px-2 py-1 rounded-full text-xs ${p.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => openModal(p)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {filteredProveedores.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
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
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h3>
            {error && (
              <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-gray-700">Representante</label>
                <input
                  name="representante"
                  value={formData.representante}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

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
                  Proveedor Activo
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