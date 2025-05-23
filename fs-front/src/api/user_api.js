import axios from 'axios';

const API_URL = 'http://localhost:8000/fs/apibd/v1/user/';

// Configura axios para incluir el token de autenticación si es necesario
const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

// Configura el token si existe
const token = localStorage.getItem('token');
setAuthToken(token);

export const fetchUsers = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error al obtener usuarios:', error.response?.data || error.message);
        throw error;
    }
};

export const fetchUser = async (id) => {
    try {
        const response = await axios.get(`${API_URL}${id}/`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener el usuario:', error.response?.data || error.message);
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await axios.post(API_URL, userData);
        return response.data;
    } catch (error) {
        console.error('Error al crear usuario:', error.response?.data || error.message);
        throw error;
    }
};

export const updateUser = async (id, userData) => {
    try {
        // Prepara los datos para la actualización
        const payload = {
            username: userData.username,
            email: userData.email,
            is_staff: userData.is_staff,
            is_active: true // Siempre activo a menos que quieras cambiar esto
        };

        // Solo incluye la contraseña si se proporcionó
        if (userData.password) {
            payload.password = userData.password;
        }

        const response = await axios.patch(`${API_URL}${id}/`, payload);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar usuario:', error.response?.data || error.message);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        await axios.delete(`${API_URL}${id}/`);
        return id;
    } catch (error) {
        console.error('Error al eliminar usuario:', error.response?.data || error.message);
        throw error;
    }
};