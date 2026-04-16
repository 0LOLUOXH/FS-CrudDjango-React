import { defaultApi } from './axiosInstance';

export const getTopProducts = (params) => defaultApi.get('dashboard/top-products/', { params });
export const getTopPurchased = (params) => defaultApi.get('dashboard/top-purchased/', { params });
export const getTopClients = (params) => defaultApi.get('dashboard/top-clients/', { params });
export const getTopStock = () => defaultApi.get('dashboard/top-stock/');
export const getSalesTrend = (params) => defaultApi.get('dashboard/sales-trend/', { params });
export const getPurchaseTrend = (params) => defaultApi.get('dashboard/purchase-trend/', { params });
