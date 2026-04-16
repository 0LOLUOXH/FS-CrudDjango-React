import { api, defaultApi } from './axiosInstance';

export const loginUsuario = (data) => defaultApi.post('login/', data);
export const getAllUser = () => api.get('user/');
export const getUser = (id) => api.get(`user/${id}/`);
export const createUser = (data) => api.post('user/', data);
export const deleteUser = (id) => api.delete(`user/${id}/`);
export const updateUser = (id, data) => api.put(`user/${id}/`, data);
export const partialUpdateUser = (id, data) => api.patch(`user/${id}/`, data);

