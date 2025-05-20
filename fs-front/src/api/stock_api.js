import axios from 'axios';

const API_URL = 'http://localhost:8000/fs/apibd/v1/stock/';

export const fetchStocks = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error al obtener el stock:', error);
        throw error;
    }
};

export const fetchStock = async () => {
    try {
        const response = await axios.get(`${API_URL}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener el stock:', error);
        throw error;
    }
};

export const createStock = async (stock) => {
    try {
        const response = await axios.post(API_URL, stock);
        return response.data;
    } catch (error) {
        console.error('Error al crear el stock:', error);
        throw error;
    }
};

export const updateStock = async (id, stock) => {
    try {
        const response = await axios.patch(`${API_URL}${id}/`, stock);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el stock:', error);
        throw error;
    }
};

export const deleteStock = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar el stock:', error);
        throw error;
    }
};                                  