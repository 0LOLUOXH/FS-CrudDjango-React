import axios from 'axios';

const API_URL = 'http://localhost:8000/fs/apibd/v1/precioproveedorproducto/';

export const fetchPrecioProveedorProductos = async () => {
    try {
        const response = await axios.get(`${API_URL}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener precios de productos:', error);
        throw error;
    }
};

export const fetchPrecioProveedorProducto = async (id) => {
    try {
        const response = await axios.get(`${API_URL}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching precio proveedor producto:', error);
        throw error;
    }
};

export const createPrecioProveedorProducto = async (precio) => {
    try {
        const response = await axios.post(`${API_URL}`, precio);
        return response.data;
    } catch (error) {
        console.error('Error creating precio proveedor producto:', error);
        throw error;
    }
};

export const updatePrecioProveedorProducto = async (id, precio) => {
    try {
        const response = await axios.put(`${API_URL}${id}`, precio);
        return response.data;
    } catch (error) {
        console.error('Error updating precio proveedor producto:', error);
        throw error;
    }
};

export const deletePrecioProveedorProducto = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting precio proveedor producto:', error);
        throw error;
    }
};      