import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/fs/apibd/v1/',
});

const defaultApi = axios.create({
  baseURL: 'http://localhost:8000/fs/', 
});

// Interceptors para añadir el token siempre
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

defaultApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export { api, defaultApi };
