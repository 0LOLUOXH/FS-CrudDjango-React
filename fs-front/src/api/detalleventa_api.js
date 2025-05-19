import axios from 'axios'

const API_URL = 'http://localhost:8000/fs/apibd/v1/detalleventa/'

export const fetchDetalleVenta = async (id) => {
  try {
    const response = await axios.get(`${API_URL}${id}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener los detalles de la venta:', error)
    throw error
  }
}

export const createDetalleVenta = async (detalle) => {
  try {
    const response = await axios.post(API_URL, detalle)
    return response.data
  } catch (error) {
    console.error('Error al crear el detalle de la venta:', error)
    throw error
  }
}

export const updateDetalleVenta = async (id, detalle) => {
  try {
    const response = await axios.patch(`${API_URL}${id}/`, detalle)
    return response.data
  } catch (error) {
    console.error('Error al actualizar el detalle de la venta:', error)
    throw error
  }
}

export const deleteDetalleVenta = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}${id}`)
    return response.data
  } catch (error) {
    console.error('Error al eliminar el detalle de la venta:', error)
    throw error
  }
}                           