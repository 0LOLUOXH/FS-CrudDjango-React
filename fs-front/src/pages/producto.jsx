import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ModeloSelect } from '../components/modelosandmarca'
import { Tabla } from '../components/tabla'
import { createProducto } from '../api/producto_api'
import { fetchBodegas } from '../api/bodega_api'

export default function IngresarProducto() {
  const navigate = useNavigate()

  const [bodegas, setBodegas] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [producto, setProducto] = useState({
    nombre: '',
    modelo: '',
    descripcion: '',
    cantidad: '',
    bodega: '',
  })

  // Carga bodegas
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetchBodegas()
        setBodegas(res)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setProducto(p => ({ ...p, [name]: value }))
  }

  const handleModeloChange = modeloId => {
    setProducto(p => ({ ...p, modelo: modeloId }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!producto.modelo) {
      alert('Por favor seleccione un modelo')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      await createProducto({
        ...producto,
        cantidad: Number(producto.cantidad),
        modeloandmarca: Number(producto.modelo),
        codigobodega: Number(producto.bodega),
      })
      navigate('/inventario')
    } catch (e) {
      console.error(e)
      setError('Hubo un error al guardar el producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* → Formulario (35%) */}
        <div className="w-full lg:w-[35%] bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-serif text-[#081A2D] mb-6">
            Agregar Producto
          </h2>

          {error && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div className="space-y-1">
              <label className="block text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={producto.nombre}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* Cantidad */}
            <div className="space-y-1">
              <label className="block text-gray-700">Cantidad</label>
              <input
                type="number"
                name="cantidad"
                value={producto.cantidad}
                onChange={handleChange}
                required
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* Modelo / Marca */}
            <div className="space-y-1">
              <label className="block text-gray-700">Marca / Modelo</label>
              <div className="border border-gray-300 rounded-lg focus-within:ring-blue-400 p-2">
                <ModeloSelect onModeloChange={handleModeloChange} />
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-1">
              <label className="block text-gray-700">Descripción</label>
              <textarea
                name="descripcion"
                rows="3"
                value={producto.descripcion}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* Bodega */}
            <div className="space-y-1">
              <label className="block text-gray-700">Bodega</label>
              <select
                name="bodega"
                value={producto.bodega}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-400 focus:outline-none"
              >
                <option value="">Seleccione una bodega</option>
                {bodegas.map(b =>
                  b.estado && (
                    <option key={b.id} value={b.id}>
                      {b.nombre}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Botón */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Agregar producto'}
              </button>
            </div>
          </form>
        </div>

        {/* → Tabla (65%) */}
        <div className="w-full lg:w-[65%]">
          <Tabla />
        </div>
      </div>
    </div>
  )
}
