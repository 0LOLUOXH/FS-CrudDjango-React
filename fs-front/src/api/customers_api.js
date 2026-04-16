import { api } from './axiosInstance';

export const getAllCustomers = () => api.get('customer/');
export const createCustomer = (data) => api.post('customer/', data);
export const deleteCustomer = (id) => api.delete(`customer/${id}/`);
export const updateCustomer = (id, data) => api.put(`customer/${id}/`, data);

export const getAllCorporateCustomers = () => api.get('corporate_customer/');
export const createCorporateCustomer = (data) => api.post('corporate_customer/', data);
export const deleteCorporateCustomer = (id) => api.delete(`corporate_customer/${id}/`);
export const updateCorporateCustomer = (id, data) => api.put(`corporate_customer/${id}/`, data);

export const getAllIndividualCustomers = () => api.get('individual_customer/');
export const createIndividualCustomer = (data) => api.post('individual_customer/', data);
export const deleteIndividualCustomer = (id) => api.delete(`individual_customer/${id}/`);
export const updateIndividualCustomer = (id, data) => api.put(`individual_customer/${id}/`, data);
