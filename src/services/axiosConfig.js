import axios from 'axios';
import authService from './authService';

// URL base para todas las solicitudes
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios con la URL base
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token de autenticación a las solicitudes
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación (401)
    if (error.response && error.response.status === 401) {
      // Redirigir al login si el token ha expirado o es inválido
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;