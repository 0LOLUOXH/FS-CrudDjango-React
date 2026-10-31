import { api, defaultApi } from './axiosInstance';

export const loginUsuario = (data) => defaultApi.post('login/', data);
export const verify2FALogin = (temp_token, otp_code) => defaultApi.post('login/2fa-verify/', { temp_token, otp_code });
export const setup2FA = () => defaultApi.post('2fa/setup/');
export const confirm2FA = (otp_code) => defaultApi.post('2fa/confirm/', { otp_code });
export const disable2FA = (password, otp_code) => defaultApi.post('2fa/disable/', { password, otp_code });

export const getAllUser = () => api.get('user/');
export const getUser = (id) => api.get(`user/${id}/`);
export const createUser = (data) => api.post('user/', data);
export const deleteUser = (id) => api.delete(`user/${id}/`);
export const updateUser = (id, data) => api.put(`user/${id}/`, data);
export const partialUpdateUser = (id, data) => api.patch(`user/${id}/`, data);


