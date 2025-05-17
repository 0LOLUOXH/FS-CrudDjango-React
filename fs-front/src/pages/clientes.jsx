import React, { useEffect, useState } from 'react';
import { fetchClientesNaturales, fetchClientesJuridicos } from '../api/clientes_api';

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

  useEffect(() => {
    async function load() {
      setNaturales(await fetchClientesNaturales());
      setJuridicos(await fetchClientesJuridicos());
    }
    load();
  }, []);

  const allClients = [
    ...naturales.map(c => ({
      id: c.cliente,
      nombre: `${c.nombre} ${c.apellido}`,
      documento: c.cedula,
      telefono: c.telefono
    })),
    ...juridicos.map(c => ({
      id: c.cliente,
      nombre: c.razon_social,
      documento: c.ruc,
      telefono: c.telefono
    }))
  ].filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()));

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
        {/* Search y acciones arriba */}
        <div className="flex items-center mb-4 space-x-4">
          <input
            type="text"
            placeholder="Buscar cliente..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#15608B]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
   
        </div>
        {/* Tabla */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-[#15608B] text-white">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Nombre / Razón</th>
                <th className="px-4 py-2">Documento</th>
                <th className="px-4 py-2">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {allClients.map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-2">{c.id}</td>
                  <td className="px-4 py-2">{c.nombre}</td>
                  <td className="px-4 py-2">{c.documento}</td>
                  <td className="px-4 py-2">{c.telefono}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}