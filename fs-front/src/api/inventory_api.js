import { api } from './axiosInstance';

export const getAllProducts = () => api.get('product/');
export const createProduct = (data) => api.post('product/', data);
export const deleteProduct = (id) => api.delete(`product/${id}/`);
export const updateProduct = (id, data) => api.put(`product/${id}/`, data);
export const partialUpdateProduct = (id, data) => api.patch(`product/${id}/`, data);

export const getAllBrands = () => api.get('brand/');
export const createBrand = (data) => api.post('brand/', data);
export const deleteBrand = (id) => api.delete(`brand/${id}/`);
export const updateBrand = (id, data) => api.put(`brand/${id}/`, data);

export const getAllModels = () => api.get('model/');
export const createModel = (data) => api.post('model/', data);
export const deleteModel = (id) => api.delete(`model/${id}/`);
export const updateModel = (id, data) => api.put(`model/${id}/`, data);

export const getAllWarehouses = () => api.get('warehouse/');
export const createWarehouse = (data) => api.post('warehouse/', data);
export const deleteWarehouse = (id) => api.delete(`warehouse/${id}/`);
export const updateWarehouse = (id, data) => api.put(`warehouse/${id}/`, data);

export const getAllStocks = () => api.get('stock/');
export const createStock = (data) => api.post('stock/', data);
export const deleteStock = (id) => api.delete(`stock/${id}/`);
export const updateStock = (id, data) => api.put(`stock/${id}/`, data);
