import axios from 'axios';

const API_URL = 'http://localhost:8000/fs/apibd/v1/proveedor/';

export const fetchProveedores = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error al obtener los proveedores:', error);
        throw error;
    }
};

export const fetchProveedor = async (id) => {
    try {
        const response = await axios.get(`${API_URL}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener el proveedor:', error);
        throw error;
    }
};

export const createProveedor = async (proveedor) => {
    try {
        const response = await axios.post(API_URL, proveedor);
        return response.data;
    } catch (error) {
        console.error('Error al crear el proveedor:', error);
        throw error;
    }
};

export const updateProveedor = async (id, proveedor) => {
    try {
        const response = await axios.put(`${API_URL}${id}/`, proveedor);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el proveedor:', error);
        throw error;
    }
};

export const deleteProveedor = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar el proveedor:', error);
        throw error;
    }
};  