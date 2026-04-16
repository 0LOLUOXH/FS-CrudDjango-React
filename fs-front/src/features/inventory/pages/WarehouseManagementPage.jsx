import React, { useEffect, useState } from 'react';
import {
  getAllWarehouses,
  createWarehouse,
  updateWarehouse
} from '../../../api/inventory_api';
import { getAllUser } from '../../../api/auth_api';

export default function WarehouseManagementPage() {
  // Estados
  const [warehouses, setWarehouses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    is_active: true,
    manager: ''
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
      const [warehousesRes, employeesRes] = await Promise.all([
        getAllWarehouses(),
        getAllUser()
      ]);
      setWarehouses(warehousesRes.data);
      setEmployees(employeesRes.data);
    } catch (err) {
      console.error(err);
      setError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear o editar
  const openModal = (warehouse = null) => {
    if (warehouse) {
      // Modo edición
      setEditingWarehouse(warehouse);
      setFormData({
        name: warehouse.name,
        capacity: warehouse.capacity,
        is_active: warehouse.is_active,
        manager: warehouse.manager
      });
    } else {
      // Modo creación
      setFormData({
        name: '',
        capacity: '',
        is_active: true,
        manager: ''
      });
      setEditingWarehouse(null);
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

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity, 10),
        manager: formData.manager === '' ? null : parseInt(formData.manager, 10)
      };

      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse.id, payload);
      } else {
        await createWarehouse(payload);
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
  const filteredWarehouses = warehouses.filter(w =>
    (w.name || '').toLowerCase().includes(search.toLowerCase())
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
              {['ID', 'Nombre', 'Estado', 'Capacidad', 'Encargado', 'Acciones'].map(h => (
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
            {filteredWarehouses.map(warehouse => {
                const employee = employees.find(e => e.id === warehouse.manager);
              return (
                <tr key={warehouse.id} className={!warehouse.is_active ? 'bg-gray-100' : ''}>
                  <td className="px-6 py-4 text-sm text-gray-700">{warehouse.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{warehouse.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <span className={`px-2 py-1 rounded-full text-xs ${warehouse.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {warehouse.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{warehouse.capacity}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {employee?.username || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => openModal(warehouse)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredWarehouses.length === 0 && (
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
              {editingWarehouse ? 'Editar Bodega' : 'Nueva Bodega'}
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
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-700">Capacidad</label>
                <input
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-700">Encargado</label>
                <select
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                  required
                >
                  <option value="">Seleccione un empleado</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.username}
                    </option>
                  ))}
                </select>
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
