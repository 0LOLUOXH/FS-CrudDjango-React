import React, { useEffect, useState } from 'react';
import {
  fetchBodegas,
  createBodega,
  updateBodega,
  deleteBodega
} from '../api/bodega_api';
import { fetchUsers } from '../api/user_api';

export default function Bodega() {
  // Estados
  const [bodegas, setBodegas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editingBodega, setEditingBodega] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    capacidad: '',
    estado: true,
    empleado: ''
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carga inicial
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bodegasRes, empleadosRes] = await Promise.all([
        fetchBodegas(),
        fetchUsers()
      ]);
      setBodegas(bodegasRes);
      setEmpleados(empleadosRes);
    } catch (err) {
      console.error(err);
      setError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear o editar
  const openModal = (bodega = null) => {
    if (bodega) {
      // Modo edición
      setEditingBodega(bodega);
      setFormData({
        nombre: bodega.nombre,
        capacidad: bodega.capacidad,
        estado: bodega.estado,
        empleado: bodega.empleado
      });
    } else {
      // Modo creación
      setFormData({
        nombre: '',
        capacidad: '',
        estado: true,
        empleado: ''
      });
      setEditingBodega(null);
    }
    setError(null);
    setIsModalOpen(true);
  };

  // Cambios en inputs
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
    setLoading(true);
    setError(null);

    try {
      if (editingBodega) {
        await updateBodega(editingBodega.id, formData);
      } else {
        await createBodega(formData);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(`Error: ${err.response?.data?.message || err.message || 'Error al guardar bodega'}`);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado por búsqueda
  const filteredBodegas = bodegas.filter(b =>
    b.nombre.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
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
          <h2 className="text-2xl font-bold text-gray-800">Bodegas</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 inline-block mr-2 mb-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
            </svg>

            Nueva Bodega
          </button>
        </div>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar bodega por nombre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
          />
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['ID', 'Nombre', 'Estado', 'Capacidad', 'Empleado', 'Acciones'].map(h => (
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
            {filteredBodegas.map(bodega => {
              const empleado = empleados.find(e => e.id === bodega.empleado);
              return (
                <tr key={bodega.id} className={!bodega.estado ? 'bg-gray-100' : ''}>
                  <td className="px-6 py-4 text-sm text-gray-700">{bodega.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{bodega.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <span className={`px-2 py-1 rounded-full text-xs ${bodega.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {bodega.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{bodega.capacidad}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {empleado?.username || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => openModal(bodega)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredBodegas.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
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
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingBodega ? 'Editar Bodega' : 'Nueva Bodega'}
            </h3>
            {error && (
              <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-gray-700">Capacidad</label>
                <input
                  name="capacidad"
                  type="number"
                  min="1"
                  value={formData.capacidad}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-700">Empleado</label>
                <select
                  name="empleado"
                  value={formData.empleado}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                  required
                >
                  <option value="">Seleccione un empleado</option>
                  {empleados.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.username}
                    </option>
                  ))}
                </select>
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
                  Bodega Activa
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
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
