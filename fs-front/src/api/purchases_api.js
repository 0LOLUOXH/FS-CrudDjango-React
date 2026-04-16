import { api } from './axiosInstance';

export const getAllPurchaseOrders = () => api.get('purchase_order/');
export const createPurchaseOrder = (data) => api.post('purchase_order/', data);
export const deletePurchaseOrder = (id) => api.delete(`purchase_order/${id}/`);
export const updatePurchaseOrder = (id, data) => api.put(`purchase_order/${id}/`, data);

export const getAllPurchaseDetails = () => api.get('purchase_detail/');
export const createPurchaseDetail = (data) => api.post('purchase_detail/', data);
export const deletePurchaseDetail = (id) => api.delete(`purchase_detail/${id}/`);
export const updatePurchaseDetail = (id, data) => api.put(`purchase_detail/${id}/`, data);
