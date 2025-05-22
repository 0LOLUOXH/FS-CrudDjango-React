import { useEffect, useState } from 'react'
import {
  fetchProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor
} from '../api/proveedor_api'

export default function Proveedores() {
  // Estados
  const [proveedores, setProveedores] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const [editingProveedor, setEditingProveedor] = useState(null)
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: ''
  })
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  // Carga inicial
  useEffect(() => {
    loadProveedores()
  }, [])

  async function loadProveedores() {
    setIsLoading(true)
    try {
      const data = await fetchProveedores()
      setProveedores(data)
      setError(null)
    } catch {
      setError('Error cargando proveedores')
    } finally {
      setIsLoading(false)
    }
  }

  // Abrir edición
  const handleEditClick = p => {
    setEditingProveedor(p)
    setFormData({
      id: p.id,
      cedula: p.cedula,
      nombre: p.nombre,
      apellido: p.apellido,
      telefono: p.telefono
    })
    setIsPopupOpen(true)
  }

  // Cambios en inputs
  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Crear o actualizar
  const handleFormSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (editingProveedor) {
        await updateProveedor(formData.id, formData)
      } else {
        await createProveedor(formData)
      }
      setIsPopupOpen(false)
      setEditingProveedor(null)
      setFormData({ cedula: '', nombre: '', apellido: '', telefono: '' })
      await loadProveedores()
      setError(null)
    } catch {
      setError('Error al guardar proveedor')
    } finally {
      setIsLoading(false)
    }
  }

  // Eliminar
  const handleDeleteClick = async p => {
    if (!confirm('¿Seguro que desea eliminar?')) return
    setIsLoading(true)
    try {
      await deleteProveedor(p.id)
      await loadProveedores()
    } catch {
      setError('Error al eliminar proveedor')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div className="p-6 text-center">Cargando...</div>
  if (error) return <div className="p-6 bg-red-100 text-red-700 rounded">{error}</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

        {/* === PANEL IZQUIERDO: FORMULARIO === */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ingresar Proveedor</h2>
          <form onSubmit={handleFormSubmit} className="space-y-5 flex-grow">
            <div className="flex flex-col">
              <label htmlFor="cedula" className="text-sm font-medium text-gray-700 mb-1">Cédula</label>
              <input
                id="cedula"
                name="cedula"
                type="text"
                value={formData.cedula}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                           transition"
                placeholder="Ej. 001-020601-0001A"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="nombre" className="text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                           transition"
                placeholder="Nombre del proveedor"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="apellido" className="text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                value={formData.apellido}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                           transition"
                placeholder="Apellido del proveedor"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="telefono" className="text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                id="telefono"
                name="telefono"
                type="text"
                value={formData.telefono}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                           transition"
                placeholder="8880-1234"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3 mt-auto
                bg-blue-500 text-white font-medium rounded-lg
                hover:bg-blue-600 transition
              "
            >
              {editingProveedor ? 'Actualizar' : 'Confirmar'}
            </button>
          </form>
        </div>

        {/* === PANEL DERECHO: TABLA === */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Proveedores</h2>
          <div className="overflow-x-auto flex-grow">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CÉDULA</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NOMBRE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">APELLIDO</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">TELÉFONO</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proveedores.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-700">{p.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{p.cedula}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{p.nombre}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{p.apellido}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{p.telefono}</td>
                    <td className="px-4 py-2 flex space-x-4">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(p)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* === POPUP DE EDICIÓN === */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Mismo formulario interior, usa las mismas clases de input */}
              {/* ... */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPopupOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
