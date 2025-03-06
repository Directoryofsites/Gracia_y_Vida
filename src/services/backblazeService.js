import axios from 'axios';

class BackblazeService {
  constructor() {
    // Comprobamos si estamos en GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    // Si estamos en GitHub Pages, usamos un modo de demostración
    this.isDemo = isGitHubPages;
    
    // API URL normal para entorno de desarrollo
    this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    
    // Información del bucket para modo de demostración
    this.demoBucket = {
      id: 'd68f1a77ef495d86915d061f',
      name: 'Gracia_y_Vida'
    };
  }

  async initialize() {
    try {
      if (this.isDemo) {
        return {
          success: true,
          message: 'Modo demostración activo',
          bucketId: this.demoBucket.id,
          bucketName: this.demoBucket.name
        };
      }
      
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
      if (this.isDemo) {
        console.log(`[DEMO] Simulando subida del archivo: ${path}`);
        return {
          success: true,
          message: 'Archivo simulado subido correctamente',
          fileName: file.name || path.split('/').pop(),
          fileId: 'demo-file-id',
          filePath: path
        };
      }
      
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
      if (this.isDemo) {
        console.log(`[DEMO] Simulando descarga del archivo: ${path}`);
        return new Blob(['Contenido de demostración para ' + path], { type: 'text/plain' });
      }
      
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
      if (this.isDemo) {
        console.log(`[DEMO] Simulando listado de archivos en: ${prefix}`);
        
        // Devolver datos de demostración
        return [
          {
            name: 'Documentos',
            path: '/Documentos',
            type: 'folder',
            isFolder: true
          },
          {
            name: 'Imágenes',
            path: '/Imágenes',
            type: 'folder',
            isFolder: true
          },
          {
            name: 'Readme.txt',
            path: '/Readme.txt',
            type: 'text/plain',
            size: 1024
          },
          {
            name: 'Bienvenido.pdf',
            path: '/Bienvenido.pdf',
            type: 'application/pdf',
            size: 2048
          }
        ];
      }
      
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
      if (this.isDemo) {
        console.log(`[DEMO] Simulando eliminación del archivo: ${path}`);
        return {
          success: true,
          message: 'Archivo simulado eliminado correctamente',
          filePath: path
        };
      }
      
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
      if (this.isDemo) {
        return {
          success: true,
          message: 'Modo demostración activo',
          bucketId: this.demoBucket.id,
          bucketName: this.demoBucket.name
        };
      }
      
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