import axios from 'axios';

const baseUrl = 'http://localhost:8000/fs/apibd/v1/detalleproveedor/';

export const fetchDetalleProveedor = async (id) => {
    try {
        const response = await axios.get(`${baseUrl}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching detalle proveedor:', error);
        throw error;
    }
};

export const createDetalleProveedor = async (detalle) => {
    try {
        const response = await axios.post(`${baseUrl}`, detalle);
        return response.data;
    } catch (error) {
        console.error('Error creating detalle proveedor:', error);
        throw error;
    }
};

export const updateDetalleProveedor = async (id, detalle) => {
    try {
        const response = await axios.put(`${baseUrl}${id}`, detalle);
        return response.data;
    } catch (error) {
        console.error('Error updating detalle proveedor:', error);
        throw error;
    }
};

export const deleteDetalleProveedor = async (id) => {
    try {
        const response = await axios.delete(`${baseUrl}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting detalle proveedor:', error);
        throw error;
    }
};  