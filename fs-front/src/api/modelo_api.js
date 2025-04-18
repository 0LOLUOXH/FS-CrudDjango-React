import axios from 'axios';

const API_URL = 'http://localhost:8000/fs/apibd/v1/modelo/';

export const fetchModelos = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error al obtener los modelos:', error);
        throw error;
    }
};  

export const fetchModelo = async (id) => {
    try {
        const response = await axios.get(`${API_URL}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener el modelo:', error);
        throw error;
    }
};

export const createModelo = async (modelo) => {
    try {
        const response = await axios.post(API_URL, modelo);
        return response.data;
    } catch (error) {
        console.error('Error al crear el modelo:', error);
        throw error;
    }
};

export const updateModelo = async (id, modelo) => {
    try {
        const response = await axios.put(`${API_URL}${id}`, modelo);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el modelo:', error);
        throw error;
    }
};

export const deleteModelo = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar el modelo:', error);
        throw error;
    }
};                                          