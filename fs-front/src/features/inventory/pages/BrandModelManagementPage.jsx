import { useEffect, useState } from 'react'
import {
  getAllBrands,
  createBrand,
  updateBrand,
  getAllModels,
  createModel,
  updateModel
} from '../../../api/inventory_api'

function BrandModelManagementPage() {
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ id: null, name: '', brand: '' })
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [mode, setMode] = useState('brand')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setIsLoading(true)
    try {
      const [brandsRes, modelsRes] = await Promise.all([getAllBrands(), getAllModels()])
      setBrands(brandsRes.data)
      setModels(modelsRes.data)
      setError(null)
    } catch {
      setError('Error cargando datos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateModel = async e => {
    e.preventDefault()
    if (!formData.name.trim() || (mode === 'model' && !formData.brand)) return
    setIsLoading(true)
    try {
      if (mode === 'brand') {
        await createBrand({ name: formData.name })
        const res = await getAllBrands()
        setBrands(res.data)
      } else {
        await createModel({ name: formData.name, brand: parseInt(formData.brand, 10) })
        const res = await getAllModels()
        setModels(res.data)
      }
      setFormData({ id: null, name: '', brand: '' })
      setShowForm(false)
      setError(null)
    } catch {
      setError('Error al crear')
    } finally {
      setIsLoading(false)
    }
  }



  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type })
    setFormData({
      id: item.id,
      name: item.name,
      brand: type === 'model' ? item.brand : ''
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
      if (editingItem.type === 'brand') {
        await updateBrand(formData.id, { name: formData.name })
        const res = await getAllBrands()
        setBrands(res.data)
      } else {
        await updateModel(formData.id, {
          name: formData.name,
          brand: parseInt(formData.brand, 10)
        })
        const res = await getAllModels()
        setModels(res.data)
      }
      setIsPopupOpen(false)
      setError(null)
    } catch {
      setError('Error al actualizar')
    } finally {
      setIsLoading(false)
    }
  }

  const getBrandName = id => {
    const m = brands.find(x => x.id === id)
    return m ? m.name : '—'
  }

  if (isLoading) return <div className="p-6 text-center">Cargando...</div>
  if (error) return <div className="p-6 bg-red-100 text-red-700 rounded">{error}</div>

  return (
    <div className="min-h-screen  p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <label className="text-gray-700 font-semibold mr-4">Seleccionar vista:</label>
          <select
            value={mode}
            onChange={(e) => { setMode(e.target.value); setShowForm(false) }}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="brand">Marca</option>
            <option value="model">Modelo</option>
          </select>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {mode === 'brand' ? 'Crear Marca' : 'Crear Modelo'}
        </button>
      </div>

      {/* Tabla según modo */}
      {mode === 'brand' && (
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
              {brands.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 text-center">
                  <td className="px-4 py-2 w-24 align-middle">{b.id}</td>
                  <td className="px-4 py-2 align-middle">{b.name}</td>
                  <td className="px-4 py-2 w-48 align-middle">
                    <div className="flex justify-center items-center space-x-4">
                      <button onClick={() => handleEdit(b, 'brand')} className="text-blue-500 hover:underline">Editar</button>
                    
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mode === 'model' && (
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
              {models.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 text-center">
                  <td className="px-4 py-2 w-24 align-middle">{m.id}</td>
                  <td className="px-4 py-2 align-middle">{m.name}</td>
                  <td className="px-4 py-2 align-middle">{getBrandName(m.brand)}</td>
                  <td className="px-4 py-2 w-48 align-middle">
                    <div className="flex justify-center items-center space-x-4">
                      <button onClick={() => handleEdit(m, 'model')} className="text-blue-500 hover:underline">Editar</button>
                      
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
              {mode === 'brand' ? 'Crear Marca' : 'Crear Modelo'}
            </h2>
            <form onSubmit={handleCreateModel} className="space-y-4">
              <div>
                <label className="block text-sm">Nombre</label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              {mode === 'model' && (
                <div>
                  <label className="block text-sm">Marca</label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded"
                  >
                    <option value="">Selecciona una marca</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
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
              Editar {editingItem.type === 'brand' ? 'Marca' : 'Modelo'}
            </h2>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>
              {editingItem.type === 'model' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marca:</label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border rounded px-3 py-2"
                  >
                    <option value="">Selecciona una marca</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
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

export default BrandModelManagementPage
