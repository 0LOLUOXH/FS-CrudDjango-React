import axios from 'axios';

const API_URL = 'http://localhost:8000/fs/apibd/v1/producto/';

export const fetchProductos = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        throw error;
    }
};  

export const fetchProducto = async (id) => {
    try {
        const response = await axios.get(`${API_URL}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        throw error;
    }
};

export const createProducto = async (producto) => {
    try {
        const response = await axios.post(API_URL, producto);
        return response.data;
    } catch (error) {
        console.error('Error al crear el producto:', error);
        throw error;
    }
};

export const updateProducto = async (id, producto) => {
    try {
        const response = await axios.put(`${API_URL}${id}`, producto);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        throw error;
    }
};

export const deleteProducto = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        throw error;
    }
};  