// src/pages/Bodega.jsx
import React, { useEffect, useState } from 'react';
import {
  fetchBodegas,
  createBodega,
  updateBodega,
  deleteBodega
} from '../api/bodega_api';
import { fetchUsers } from '../api/user_api';

export default function Bodega() {
  const [bodegas, setBodegas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    capacidad: '',
    estado: true,
    empleado: ''
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carga inicial
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [bRes, eRes] = await Promise.all([
          fetchBodegas(),
          fetchUsers()
        ]);
        setBodegas(bRes);
        setEmpleados(eRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Reset formulario
  const resetForm = () => {
    setFormData({ nombre: '', capacidad: '', estado: true, empleado: '' });
    setEditing(null);
    setError(null);
  };

  // Cambios en inputs
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Crear / actualizar
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await updateBodega(editing.id, formData);
      } else {
        await createBodega(formData);
      }
      setBodegas(await fetchBodegas());
      resetForm();
    } catch {
      setError('Error guardando la bodega');
    } finally {
      setLoading(false);
    }
  };

  // Preparar edición
  const handleEditClick = bodega => {
    setEditing(bodega);
    setFormData({
      nombre: bodega.nombre,
      capacidad: bodega.capacidad,
      estado: bodega.estado,
      empleado: bodega.empleado
    });
    setError(null);
  };

  // Eliminar
  const handleDeleteClick = async bodega => {
    if (!window.confirm('¿Eliminar esta bodega?')) return;
    setLoading(true);
    try {
      await deleteBodega(bodega.id);
      setBodegas(await fetchBodegas());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado por búsqueda
  const filtered = bodegas.filter(b =>
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
    <div
      className="
        w-full px-4 sm:px-6 lg:px-8 py-6
        grid grid-cols-1 lg:grid-cols-2 gap-6
        h-[calc(100vh-64px)] overflow-auto
      "
    >
      {/* === FORMULARIO === */}
      <div className="bg-white shadow rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Ingresar Bodega
        </h2>
        {error && (
          <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-gray-700">Nombre</label>
            <input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
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
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              name="estado"
              type="checkbox"
              checked={formData.estado}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded"
            />
            <label className="text-gray-700">Activo</label>
          </div>
          <div className="space-y-1">
            <label className="block text-gray-700">Empleado</label>
            <select
              name="empleado"
              value={formData.empleado}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
            >
              <option value="">Seleccione un empleado</option>
              {empleados.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.username}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              {editing ? 'Actualizar' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>

      {/* === TABLA con buscador === */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Búsqueda Bodegas
        </h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Búsqueda Bodegas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none font-serif"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['ID','NOMBRE','ESTADO','CAPACIDAD','EMPLEADO','ACCIONES'].map(h => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(bodega => {
                const emp = empleados.find(e => e.id === bodega.empleado);
                return (
                  <tr key={bodega.id}>
                    <td className="px-6 py-4 text-sm text-gray-700">{bodega.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{bodega.nombre}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                          bodega.estado
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {bodega.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{bodega.capacidad}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {emp?.username || '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(bodega)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(bodega)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
