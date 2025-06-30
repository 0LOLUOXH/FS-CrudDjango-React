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
  const [marcas, setMarcas] = useState([])
  const [modelos, setModelos] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modeloForm, setModeloForm] = useState({ nombre: '', marca: '' })
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ id: null, nombre: '', marca: '' })
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [modo, setModo] = useState('marca')
  const [showForm, setShowForm] = useState(false)

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

  const handleModeloChange = e => {
    setModeloForm({ ...modeloForm, [e.target.name]: e.target.value })
  }
  const handleCreateModelo = async e => {
    e.preventDefault()
    if (!formData.nombre.trim() || (modo === 'modelo' && !formData.marca)) return
    setIsLoading(true)
    try {
      if (modo === 'marca') {
        await createMarca({ nombre: formData.nombre })
        setMarcas(await fetchMarcas())
      } else {
        await createModelo({ nombre: formData.nombre, marca: formData.marca })
        setModelos(await fetchModelos())
      }
      setFormData({ id: null, nombre: '', marca: '' })
      setShowForm(false)
      setError(null)
    } catch {
      setError('Error al crear')
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleEdit = (item, tipo) => {
    setEditingItem({ ...item, tipo })
    setFormData({
      id: item.id,
      nombre: item.nombre,
      marca: tipo === 'modelo' ? item.marca : ''
    })
    setIsPopupOpen(true)
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

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

  const getMarcaNombre = id => {
    const m = marcas.find(x => x.id === id)
    return m ? m.nombre : '—'
  }

  if (isLoading) return <div className="p-6 text-center">Cargando...</div>
  if (error) return <div className="p-6 bg-red-100 text-red-700 rounded">{error}</div>

  return (
    <div className="min-h-screen  p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <label className="text-gray-700 font-semibold mr-4">Seleccionar vista:</label>
          <select
            value={modo}
            onChange={(e) => { setModo(e.target.value); setShowForm(false) }}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="marca">Marca</option>
            <option value="modelo">Modelo</option>
          </select>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {modo === 'marca' ? 'Crear Marca' : 'Crear Modelo'}
        </button>
      </div>

      {/* Tabla según modo */}
      {modo === 'marca' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Marcas</h2>
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {marcas.map(m => (
    <tr key={m.id} className="hover:bg-gray-50 text-center">
      <td className="px-4 py-2 w-24 align-middle">{m.id}</td>
      <td className="px-4 py-2 align-middle">{m.nombre}</td>
      <td className="px-4 py-2 w-48 align-middle">
        <div className="flex justify-center items-center space-x-4">
          <button onClick={() => handleEdit(m, 'marca')} className="text-blue-500 hover:underline">Editar</button>
        
        </div>
      </td>
    </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modo === 'modelo' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Modelos</h2>
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Marca</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
  {modelos.map(m => (
    <tr key={m.id} className="hover:bg-gray-50 text-center">
      <td className="px-4 py-2 w-24 align-middle">{m.id}</td>
      <td className="px-4 py-2 align-middle">{m.nombre}</td>
      <td className="px-4 py-2 align-middle">{getMarcaNombre(m.marca)}</td>
      <td className="px-4 py-2 w-48 align-middle">
        <div className="flex justify-center items-center space-x-4">
          <button onClick={() => handleEdit(m, 'modelo')} className="text-blue-500 hover:underline">Editar</button>
          
        </div>
      </td>
    </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {modo === 'marca' ? 'Crear Marca' : 'Crear Modelo'}
            </h2>
            <form onSubmit={handleCreateModelo} className="space-y-4">
              <div>
                <label className="block text-sm">Nombre</label>
                <input
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              {modo === 'modelo' && (
                <div>
                  <label className="block text-sm">Marca</label>
                  <select
                    name="marca"
                    value={formData.marca}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded"
                  >
                    <option value="">Selecciona una marca</option>
                    {marcas.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPopupOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
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
                  className="mt-1 block w-full border rounded px-3 py-2"
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
                    className="mt-1 block w-full border rounded px-3 py-2"
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
