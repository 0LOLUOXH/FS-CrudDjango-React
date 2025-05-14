import axios from 'axios';

const API_URL = 'http://localhost:8000/fs/apibd/v1/cliente/';

export const fetchClientes = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
        throw error;
    }
};  

export const fetchCliente = async (id) => {
    try {
        const response = await axios.get(`${API_URL}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener el cliente:', error);
        throw error;
    }
};

export const createCliente = async (cliente) => {
    try {
        const response = await axios.post(API_URL, cliente);
        return response.data;
    } catch (error) {
        console.error('Error al crear el cliente:', error);
        throw error;
    }
};

export const updateCliente = async (id, cliente) => {
    try {
        const response = await axios.put(`${API_URL}${id}`, cliente);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el cliente:', error);
        throw error;
    }
};

export const deleteCliente = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        throw error;
    }
};                        

export const fetchClienteJuridico = async (id) => {
    try {
        const response = await axios.get(`${API_URL}juridico/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener el cliente juridico:', error);
        throw error;
    }
};

export const createClienteJuridico = async (clienteJuridico) => {
    try {
        const response = await axios.post(`${API_URL}juridico`, clienteJuridico);
        return response.data;
    } catch (error) {
        console.error('Error al crear el cliente juridico:', error);
        throw error;
    }
};

export const updateClienteJuridico = async (id, clienteJuridico) => {
    try {
        const response = await axios.put(`${API_URL}juridico/${id}`, clienteJuridico);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el cliente juridico:', error);
        throw error;
    }
};

export const deleteClienteJuridico = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}juridico/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar el cliente juridico:', error);
        throw error;
    }
};

export const fetchClienteNatural = async (id) => {
    try {
        const response = await axios.get(`${API_URL}natural/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener el cliente natural:', error);
        throw error;
    }
};

export const createClienteNatural = async (clienteNatural) => {
    try {
        const response = await axios.post(`${API_URL}natural`, clienteNatural);
        return response.data;
    } catch (error) {
        console.error('Error al crear el cliente natural:', error);
        throw error;
    }
};

export const updateClienteNatural = async (id, clienteNatural) => {
    try {
        const response = await axios.put(`${API_URL}natural/${id}`, clienteNatural);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el cliente natural:', error);
        throw error;
    }
};

export const deleteClienteNatural = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}natural/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar el cliente natural:', error);
        throw error;
    }
};      