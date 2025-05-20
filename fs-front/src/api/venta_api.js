import axios from 'axios'

const API_URL = 'http://localhost:8000/fs/apibd/v1/venta/'

export const fetchVentas = async () => {
  try {
    const response = await axios.get(API_URL)
    return response.data
  } catch (error) {
    console.error('Error al obtener las ventas:', error)
    throw error
  }
}

export const createVenta = async (venta) => {
  try {
    const response = await axios.post(API_URL, venta)
    return response.data
  } catch (error) {
    console.error('Error al crear la venta:', error)
    throw error
  }
}

export const updateVenta = async (id, venta) => {
  try {
    const response = await axios.patch(`${API_URL}${id}/`, venta)
    return response.data
  } catch (error) {
    console.error('Error al actualizar la venta:', error)        
    throw error
  }
}

export const deleteVenta = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}${id}`)
    return response.data
  } catch (error) {
    console.error('Error al eliminar la venta:', error)
    throw error
  }
}