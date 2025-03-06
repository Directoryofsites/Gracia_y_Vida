import axiosInstance from './axiosConfig';

const fileService = {
  /**
   * Obtiene los archivos y carpetas de una ruta específica
   * @param {string} path - Ruta de la carpeta
   * @returns {Promise} Promise con los archivos y carpetas
   */
  getFiles: async (path) => {
    try {
      const response = await axiosInstance.get('/files', {
        params: { path }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener archivos:', error);
      throw error;
    }
  },

  /**
   * Crea una nueva carpeta
   * @param {string} path - Ruta donde crear la carpeta
   * @param {string} name - Nombre de la carpeta
   * @returns {Promise} Promise con la respuesta del servidor
   */
  createFolder: async (path, name) => {
    try {
      const response = await axiosInstance.post('/folders', { path, name });
      return response.data;
    } catch (error) {
      console.error('Error al crear carpeta:', error);
      throw error;
    }
  },

  /**
   * Sube un archivo
   * @param {string} path - Ruta donde subir el archivo
   * @param {File} file - Archivo a subir
   * @param {Function} onProgress - Función para reportar el progreso
   * @returns {Promise} Promise con la respuesta del servidor
   */
  uploadFile: async (path, file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);

      const response = await axiosInstance.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al subir archivo:', error);
      throw error;
    }
  },

  /**
   * Elimina un archivo o carpeta
   * @param {string} path - Ruta del archivo o carpeta
   * @param {string} type - Tipo ('file' o 'folder')
   * @returns {Promise} Promise con la respuesta del servidor
   */
  deleteItem: async (path, type) => {
    try {
      const response = await axiosInstance.delete(`/${type === 'folder' ? 'folders' : 'files'}`, {
        data: { path }
      });
      return response.data;
    } catch (error) {
      console.error('Error al eliminar:', error);
      throw error;
    }
  },

  /**
   * Renombra un archivo o carpeta
   * @param {string} path - Ruta actual
   * @param {string} newName - Nuevo nombre
   * @param {string} type - Tipo ('file' o 'folder')
   * @returns {Promise} Promise con la respuesta del servidor
   */
  renameItem: async (path, newName, type) => {
    try {
      const response = await axiosInstance.put(
        `/${type === 'folder' ? 'folders' : 'files'}/rename`,
        { path, newName }
      );
      return response.data;
    } catch (error) {
      console.error('Error al renombrar:', error);
      throw error;
    }
  },

  /**
   * Obtiene el contenido de un archivo para vista previa
   * @param {string} path - Ruta del archivo
   * @returns {Promise} Promise con el contenido del archivo
   */
  getFilePreview: async (path) => {
    try {
      const response = await axiosInstance.get('/preview', {
        params: { path }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener vista previa:', error);
      throw error;
    }
  },

  /**
   * Descarga un archivo
   * @param {string} path - Ruta del archivo
   */
  downloadFile: (path) => {
    const token = localStorage.getItem('token');
    const url = `${axiosInstance.defaults.baseURL}/download?path=${encodeURIComponent(path)}&token=${token}`;
    window.open(url, '_blank');
  }
};

export default fileService;