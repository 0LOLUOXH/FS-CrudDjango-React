// src/pages/Clientes.jsx
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
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({ ...formData });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carga inicial
  useEffect(() => {
    (async () => {
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
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Combina y filtra
  const allClients = [
    ...naturales.map(c => ({
      tipo: 'Natural',
      id: c.cliente,
      nombre: `${c.nombre} ${c.apellido}`,
      documento: c.cedula,
      telefono: c.telefono
    })),
    ...juridicos.map(c => ({
      tipo: 'Juridico',
      id: c.cliente,
      nombre: c.razon_social,
      documento: c.ruc,
      telefono: c.telefono
    }))
  ].filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.documento.includes(search)
  );

  // Handlers formulario nuevo
  const onChangeForm = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };
  const onSubmitForm = e => {
    e.preventDefault();
    // Aquí la lógica de creación...
  };

  // Preparar edición
  const onEditClick = c => {
    setEditing(c);
    if (c.tipo === 'Natural') {
      const [first = '', last = ''] = c.nombre.split(' ');
      setEditData({
        tipo: 'Natural',
        nombre: first,
        apellido: last,
        cedula: c.documento,
        telefono: c.telefono,
        razon_social: '',
        ruc: ''
      });
    } else {
      setEditData({
        tipo: 'Juridico',
        nombre: '',
        apellido: '',
        cedula: '',
        telefono: c.telefono,
        razon_social: c.nombre,
        ruc: c.documento
      });
    }
    setError(null);
    setIsEditOpen(true);
  };

  // Handlers edición
  const onEditChange = e => {
    const { name, value } = e.target;
    setEditData(d => ({ ...d, [name]: value }));
  };
  const onEditSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editData.tipo === 'Natural') {
        await updateClienteNatural(editing.id, {
          nombre: editData.nombre,
          apellido: editData.apellido,
          cedula: editData.cedula,
          telefono: editData.telefono
        });
      } else {
        await updateClienteJuridico(editing.id, {
          razon_social: editData.razon_social,
          ruc: editData.ruc,
          telefono: editData.telefono
        });
      }
      setNaturales(await fetchClientesNaturales());
      setJuridicos(await fetchClientesJuridicos());
      setIsEditOpen(false);
    } catch {
      setError('Error al actualizar');
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar
  const onDeleteClick = async (id, tipo) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    setIsLoading(true);
    try {
      if (tipo === 'Natural') {
        await deleteClienteNatural(id);
        await deleteCliente(id);
        setNaturales(await fetchClientesNaturales());
      } else {
        await deleteClienteJuridico(id);
        await deleteCliente(id);
        setJuridicos(await fetchClientesJuridicos());
      }
    } catch (err) {
      console.error(err);
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
    <div className="
      w-full px-4 sm:px-6 lg:px-8 py-6
      grid grid-cols-1 lg:grid-cols-2 gap-6
    ">
      {/* === FORMULARIO === */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-serif text-[#081A2D] mb-6">Ingresar Cliente</h2>
        <form onSubmit={onSubmitForm} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-gray-700">Tipo de cliente</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={onChangeForm}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
            >
              <option>Natural</option>
              <option>Juridico</option>
            </select>
          </div>

          {formData.tipo === 'Natural' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-gray-700">Nombre</label>
                  <input
                    name="nombre"
                    value={formData.nombre}
                    onChange={onChangeForm}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-gray-700">Apellido</label>
                  <input
                    name="apellido"
                    value={formData.apellido}
                    onChange={onChangeForm}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-gray-700">Cédula</label>
                <input
                  name="cedula"
                  value={formData.cedula}
                  onChange={onChangeForm}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
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
                  onChange={onChangeForm}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-gray-700">RUC</label>
                <input
                  name="ruc"
                  value={formData.ruc}
                  onChange={onChangeForm}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="block text-gray-700">Teléfono</label>
            <input
              name="telefono"
              value={formData.telefono}
              onChange={onChangeForm}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Ingresar
            </button>
          </div>
        </form>
      </div>

      {/* === TABLA === */}
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        <h2 className="font-serif text-[#081A2D] text-xl mb-4">Búsqueda Clientes</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none font-serif"
          />
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['ID','Tipo','Nombre / Razón','Documento','Teléfono','Acciones'].map(h => (
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
            {allClients.map(c => (
              <tr key={c.id}>
                <td className="px-6 py-4 text-sm text-gray-700">{c.id}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.tipo}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.documento}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.telefono}</td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => onEditClick(c)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDeleteClick(c.id, c.tipo)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {allClients.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* === POPUP DE EDICIÓN === */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-serif text-[#081A2D] mb-4">Editar Cliente</h3>
            {error && (
              <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={onEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-gray-700">Tipo de cliente</label>
                <select
                  name="tipo"
                  value={editData.tipo}
                  onChange={onEditChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option>Natural</option>
                  <option>Juridico</option>
                </select>
              </div>

              {editData.tipo === 'Natural' ? (
                <>
                  <div className="space-y-1">
                    <label className="block text-gray-700">Nombre</label>
                    <input
                      name="nombre"
                      value={editData.nombre}
                      onChange={onEditChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-700">Apellido</label>
                    <input
                      name="apellido"
                      value={editData.apellido}
                      onChange={onEditChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-700">Cédula</label>
                    <input
                      name="cedula"
                      value={editData.cedula}
                      onChange={onEditChange}
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
                      value={editData.razon_social}
                      onChange={onEditChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-gray-700">RUC</label>
                    <input
                      name="ruc"
                      value={editData.ruc}
                      onChange={onEditChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="block text-gray-700">Teléfono</label>
                <input
                  name="telefono"
                  value={editData.telefono}
                  onChange={onEditChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
