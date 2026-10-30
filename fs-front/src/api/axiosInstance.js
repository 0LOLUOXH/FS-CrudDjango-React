import axios from 'axios';

/**
 * Función auxiliar para extraer el valor de una cookie por nombre (CSRF Token).
 */
export function getCookie(name) {
  if (typeof document === 'undefined' || !document.cookie) {
    return null;
  }
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

const api = axios.create({
  baseURL: 'http://localhost:8000/fs/apibd/v1/',
  withCredentials: true, // Envío automático de cookies seguras HttpOnly (auth_token)
});

const defaultApi = axios.create({
  baseURL: 'http://localhost:8000/fs/',
  withCredentials: true, // Envío automático de cookies seguras HttpOnly (auth_token)
});

// Interceptor para inyectar el token Anti-CSRF (X-CSRFToken) requerido por Django
const csrfInterceptor = (config) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
};

api.interceptors.request.use(csrfInterceptor, (error) => Promise.reject(error));
defaultApi.interceptors.request.use(csrfInterceptor, (error) => Promise.reject(error));

// Interceptor de respuesta para manejo centralizado de 401 (Sesión expirada o no autenticado)
const responseInterceptor = (response) => response;
const errorInterceptor = (error) => {
  if (error.response && error.response.status === 401) {
    // Si la sesión expiró o cookie fue revocada
    if (typeof window !== 'undefined' && window.location.pathname !== '/' && window.location.pathname !== '/login') {
      console.warn('[Seguridad] Sesión revocada o no autenticada.');
    }
  }
  return Promise.reject(error);
};

api.interceptors.response.use(responseInterceptor, errorInterceptor);
defaultApi.interceptors.response.use(responseInterceptor, errorInterceptor);

export { api, defaultApi };
