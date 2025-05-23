import React, { useState, useEffect } from 'react'
import { ModeloSelect } from '../components/modelosandmarca'
import { Tabla } from '../components/tabla'
import { createProducto } from '../api/producto_api'
import { fetchBodegas } from '../api/bodega_api'
import { fetchProductos } from '../api/producto_api'

export default function IngresarProducto() {

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
  const [productos, setProductos] = useState([])
  const [showPopup, setShowPopup] = useState(false) // Estado para controlar el popup

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

  // Carga productos
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchProductos()
        setProductos(res)
      } catch (e) {
        console.error('Error al cargar productos:', e)
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
      setShowPopup(false) // Cerrar popup después de enviar
      // Recargar productos después de agregar uno nuevo
      const res = await fetchProductos()
      setProductos(res)
    } catch (e) {
      console.error(e)
      setError('Hubo un error al guardar el producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col">
        {/* Botón para abrir el popup */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowPopup(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Agregar Producto
          </button>
        </div>

        {/* Tabla centrada */}
        <div className="w-full mx-auto">
          <Tabla data={productos} onUpdate={async () => {
            const res = await fetchProductos();
            setProductos(res);
          }} />
        </div>
      </div>

      {/* Popup del formulario */}
      {showPopup && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                Agregar Producto
              </h2>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {error && (
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div className="space-y-1">
                <label className="block text-gray-700">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={producto.nombre}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Modelo / Marca */}
              <div className="space-y-1">
                <label className="block text-gray-700">Marca / Modelo</label>
                <div className="border border-gray-300 rounded-lg focus-within:ring-blue-400 p-1">
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-400 focus:outline-none"
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
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Agregar producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}