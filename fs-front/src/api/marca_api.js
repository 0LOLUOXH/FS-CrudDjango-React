import axios from 'axios';

const API_URL = 'http://localhost:8000/fs/apibd/v1/marca/';

export const fetchMarcas = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error al obtener las marcas:', error);
        throw error;
    }
};  

export const fetchMarca = async (id) => {
    try {
        const response = await axios.get(`${API_URL}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener la marca:', error);
        throw error;
    }
};

export const createMarca = async (marca) => {
    try {
        const response = await axios.post(API_URL, marca);
        return response.data;
    } catch (error) {
        console.error('Error al crear la marca:', error);
        throw error;
    }
};

export const updateMarca = async (id, marca) => {
    try {
        const response = await axios.put(`${API_URL}${id}`, marca);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la marca:', error);
        throw error;
    }
};

export const deleteMarca = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar la marca:', error);
        throw error;
    }
};