import { api } from './axiosInstance';

export const getAllSales = () => api.get('sale/');
export const createSale = (data) => api.post('sale/', data);
export const deleteSale = (id) => api.delete(`sale/${id}/`);
export const updateSale = (id, data) => api.put(`sale/${id}/`, data);

export const getAllSaleDetails = () => api.get('sale_detail/');
export const createSaleDetail = (data) => api.post('sale_detail/', data);
export const deleteSaleDetail = (id) => api.delete(`sale_detail/${id}/`);
export const updateSaleDetail = (id, data) => api.put(`sale_detail/${id}/`, data);

export const createInstallationService = (data) => api.post('installation_service/', data);
