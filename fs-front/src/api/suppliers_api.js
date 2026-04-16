import { api } from './axiosInstance';

export const getAllSuppliers = () => api.get('supplier/');
export const createSupplier = (data) => api.post('supplier/', data);
export const deleteSupplier = (id) => api.delete(`supplier/${id}/`);
export const updateSupplier = (id, data) => api.put(`supplier/${id}/`, data);
