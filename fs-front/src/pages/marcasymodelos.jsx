import { useEffect, useState } from 'react'
import {
  fetchMarcas,
  createMarca,
  updateMarca,
  deleteMarca
} from '../api/marca_api'
import {
  fetchModelos,
  createModelo,
  updateModelo,
  deleteModelo
} from '../api/modelo_api'

function MarcasyModelos() {
  // Datos principales
  const [marcas, setMarcas] = useState([])
  const [modelos, setModelos] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estados para creación
  const [marcaForm, setMarcaForm] = useState({ nombre: '' })
  const [modeloForm, setModeloForm] = useState({ nombre: '', marca: '' })

  // Estados para edición (popup)
  const [editingItem, setEditingItem] = useState(null) // { id, nombre, marca?, tipo }
  const [formData, setFormData] = useState({ id: null, nombre: '', marca: '' })
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  // Carga inicial
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setIsLoading(true)
    try {
      const [mcs, mds] = await Promise.all([fetchMarcas(), fetchModelos()])
      setMarcas(mcs)
      setModelos(mds)
      setError(null)
    } catch {
      setError('Error cargando datos')
    } finally {
      setIsLoading(false)
    }
  }

  // Creación de Marca
  const handleMarcaChange = e => {
    setMarcaForm({ ...marcaForm, [e.target.name]: e.target.value })
  }
  const handleCreateMarca = async e => {
    e.preventDefault()
    if (!marcaForm.nombre.trim()) return
    setIsLoading(true)
    try {
      await createMarca({ nombre: marcaForm.nombre })
      setMarcaForm({ nombre: '' })
      setMarcas(await fetchMarcas())
      setError(null)
    } catch {
      setError('Error al crear marca')
    } finally {
      setIsLoading(false)
    }
  }

  // Creación de Modelo
  const handleModeloChange = e => {
    setModeloForm({ ...modeloForm, [e.target.name]: e.target.value })
  }
  const handleCreateModelo = async e => {
    e.preventDefault()
    if (!modeloForm.nombre.trim() || !modeloForm.marca) return
    setIsLoading(true)
    try {
      await createModelo({ nombre: modeloForm.nombre, marca: modeloForm.marca })
      setModeloForm({ nombre: '', marca: '' })
      setModelos(await fetchModelos())
      setError(null)
    } catch {
      setError('Error al crear modelo')
    } finally {
      setIsLoading(false)
    }
  }

  // Eliminación
  const handleDelete = async (id, tipo) => {
    if (!confirm('¿Seguro de eliminar?')) return
    setIsLoading(true)
    try {
      if (tipo === 'marca') {
        await deleteMarca(id)
        setMarcas(await fetchMarcas())
      } else {
        await deleteModelo(id)
        setModelos(await fetchModelos())
      }
      setError(null)
    } catch {
      setError('Error al eliminar')
    } finally {
      setIsLoading(false)
    }
  }

  // Edición: abrir popup
  const handleEdit = (item, tipo) => {
    setEditingItem({ ...item, tipo })
    setFormData({
      id: item.id,
      nombre: item.nombre,
      marca: tipo === 'modelo' ? item.marca : ''
    })
    setIsPopupOpen(true)
  }

  // Edición: actualizar campos
  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Edición: guardar cambios
  const handleSubmitEdit = async e => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (editingItem.tipo === 'marca') {
        await updateMarca(formData.id, { nombre: formData.nombre })
        setMarcas(await fetchMarcas())
      } else {
        await updateModelo(formData.id, {
          nombre: formData.nombre,
          marca: formData.marca
        })
        setModelos(await fetchModelos())
      }
      setIsPopupOpen(false)
      setError(null)
    } catch {
      setError('Error al actualizar')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper para mostrar nombre de marca en tabla
  const getMarcaNombre = id => {
    const m = marcas.find(x => x.id === id)
    return m ? m.nombre : '—'
  }

  // Render
  if (isLoading) return <div className="p-6 text-center">Cargando...</div>
  if (error) return <div className="p-6 bg-red-100 text-red-700 rounded">{error}</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* ===== Formulario Crear Marca ===== */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ingresar Marca</h2>
          <form onSubmit={handleCreateMarca} className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="nombreMarca" className="text-sm font-medium text-gray-700 mb-1">
                Nombre de Marca
              </label>
              <input
                id="nombreMarca"
                name="nombre"
                type="text"
                value={marcaForm.nombre}
                onChange={handleMarcaChange}
                placeholder="Escribe el nombre..."
                className="
                  w-full px-4 py-3 border border-gray-300 bg-gray-50
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                  transition
                "
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3 bg-blue-500 text-white font-medium
                rounded-lg hover:bg-blue-600 transition
              "
            >
              Crear Marca
            </button>
          </form>
        </div>

        {/* ===== Formulario Crear Modelo ===== */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ingresar Modelo</h2>
          <form onSubmit={handleCreateModelo} className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="nombreModelo" className="text-sm font-medium text-gray-700 mb-1">
                Nombre de Modelo
              </label>
              <input
                id="nombreModelo"
                name="nombre"
                type="text"
                value={modeloForm.nombre}
                onChange={handleModeloChange}
                placeholder="Escribe el nombre..."
                className="
                  w-full px-4 py-3 border border-gray-300 bg-gray-50
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                  transition
                "
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="marcaModelo" className="text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <select
                id="marcaModelo"
                name="marca"
                value={modeloForm.marca}
                onChange={handleModeloChange}
                className="
                  w-full px-4 py-3 border border-gray-300 bg-gray-50
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                  transition
                "
              >
                <option value="">Selecciona una marca</option>
                {marcas.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3 bg-green-500 text-white font-medium
                rounded-lg hover:bg-green-600 transition
              "
            >
              Crear Modelo
            </button>
          </form>
        </div>

        {/* ===== Tabla Marcas ===== */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Marcas</h2>
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {marcas.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">{m.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{m.nombre}</td>
                  <td className="px-4 py-2 flex space-x-4">
                    <button
                      onClick={() => handleEdit(m, 'marca')}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, 'marca')}
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

        {/* ===== Tabla Modelos ===== */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Modelos</h2>
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modelos.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">{m.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{m.nombre}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{getMarcaNombre(m.marca)}</td>
                  <td className="px-4 py-2 flex space-x-4">
                    <button
                      onClick={() => handleEdit(m, 'modelo')}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, 'modelo')}
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

      {/* ===== Popup de edición ===== */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Editar {editingItem.tipo === 'marca' ? 'Marca' : 'Modelo'}
            </h2>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="
                    mt-1 block w-full border border-gray-300 rounded px-3 py-2
                    focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                  "
                />
              </div>
              {editingItem.tipo === 'modelo' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marca:</label>
                  <select
                    name="marca"
                    value={formData.marca}
                    onChange={handleInputChange}
                    required
                    className="
                      mt-1 block w-full border border-gray-300 rounded px-3 py-2
                      focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                    "
                  >
                    <option value="">Selecciona una marca</option>
                    {marcas.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
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
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarcasyModelos
