import axios from 'axios';

const API_URL = 'http://localhost:8000/fs/apibd/v1/bodega/';

export const fetchBodegas = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error al obtener las bodegas:', error);
        throw error;
    }
};  

export const fetchBodega = async (id) => {
    try {
        const response = await axios.get(`${API_URL}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener la bodega:', error);
        throw error;
    }
};

export const createBodega = async (bodega) => {
    try {
        const response = await axios.post(API_URL, bodega);
        return response.data;
    } catch (error) {
        console.error('Error al crear la bodega:', error);
        throw error;
    }
};

export const updateBodega = async (id, bodega) => {
    try {
        const response = await axios.put(`${API_URL}${id}/`, bodega);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la bodega:', error);
        throw error;
    }
};

export const deleteBodega = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar la bodega:', error);
        throw error;
    }
};