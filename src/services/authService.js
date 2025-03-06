import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const authService = {
  /**
   * Realiza el inicio de sesión del usuario
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise} Promise con los datos del usuario y el token
   */
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });
      
      const { user, token } = response.data;
      
      // Guardar el token en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  },
  
  /**
   * Cierra la sesión del usuario
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean} true si el usuario está autenticado, false en caso contrario
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  /**
   * Obtiene el usuario actual
   * @returns {Object|null} Datos del usuario o null si no hay usuario autenticado
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  /**
   * Obtiene el token de autenticación
   * @returns {string|null} Token de autenticación o null si no hay usuario autenticado
   */
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;