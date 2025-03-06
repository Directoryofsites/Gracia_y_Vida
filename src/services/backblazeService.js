import axios from 'axios';

class BackblazeService {
  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }

  async initialize() {
    try {
      // Verificar conexión con el servidor proxy
      const response = await axios.get(`${this.apiUrl}/status`);
      return response.data;
    } catch (error) {
      console.error('Error inicializando conexión:', error);
      throw error;
    }
  }

  async uploadFile(file, path) {
    try {
      // Normalizar la ruta (eliminar la barra inicial si existe)
      const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
      
      // Crear un objeto FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file);
      
      // Enviar la solicitud al servidor proxy
      const response = await axios.post(
        `${this.apiUrl}/files/${normalizedPath}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      throw error;
    }
  }

  async downloadFile(path) {
    try {
      // Normalizar la ruta
      const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
      
      // Solicitar el archivo al servidor proxy
      const response = await axios.get(
        `${this.apiUrl}/files/${normalizedPath}`,
        {
          responseType: 'blob'
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error descargando archivo:', error);
      throw error;
    }
  }

  async listFiles(prefix = '') {
    try {
      // Solicitar lista de archivos al servidor proxy
      const response = await axios.get(`${this.apiUrl}/files`, {
        params: { prefix }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error listando archivos:', error);
      throw error;
    }
  }

  async deleteFile(path) {
    try {
      // Normalizar la ruta
      const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
      
      // Enviar solicitud de eliminación al servidor proxy
      const response = await axios.delete(`${this.apiUrl}/files/${normalizedPath}`);
      
      return response.data;
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      // Verificar conexión con el servidor proxy
      const response = await axios.get(`${this.apiUrl}/status`);
      
      return {
        success: response.data.success,
        message: response.data.message,
        bucketId: response.data.bucketId,
        bucketName: response.data.bucketName
      };
    } catch (error) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new BackblazeService();