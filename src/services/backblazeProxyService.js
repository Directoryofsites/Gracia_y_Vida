import axios from 'axios';

class BackblazeProxyService {
  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }
  
  async listFiles(prefix = '') {
    try {
      const response = await axios.post(`${this.apiUrl}/b2/list-files`, { prefix });
      
      // Procesar carpetas
      const folders = (response.data.folders || []).map(folderPath => {
        const parts = folderPath.split('/').filter(Boolean);
        const name = parts[parts.length - 1];
        
        return {
          name: name,
          path: `/${folderPath}`,
          type: 'folder',
          size: 0
        };
      });
      
      // Procesar archivos
      const files = response.data.files
        .filter(file => {
          const fileName = file.fileName;
          return !fileName.endsWith('/.folder') && 
                 !fileName.endsWith('.folder') && 
                 !fileName.startsWith('.');
        })
        .map(file => {
          const fileName = file.fileName;
          const name = fileName.split('/').pop();
          
          return {
            name: name,
            path: `/${fileName}`,
            type: this.getFileMimeType(fileName),
            size: file.contentLength || 0,
            fileId: file.fileId,
            lastModified: file.uploadTimestamp
          };
        });
      
      return [...folders, ...files];
    } catch (error) {
      console.error('Error listando archivos a través del proxy:', error);
      throw error;
    }
  }
  
  async downloadFile(fileName) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/b2/download-file`, 
        { fileName },
        { responseType: 'blob' }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error descargando archivo a través del proxy:', error);
      throw error;
    }
  }
  
  async uploadFile(file, path) {
    try {
      let fileData = file;
      
      // Si es un objeto File, convertirlo a ArrayBuffer o Blob
      if (file instanceof File) {
        fileData = await file.arrayBuffer();
      }
      
      const response = await axios.post(
        `${this.apiUrl}/b2/upload-file?fileName=${encodeURIComponent(path)}&contentType=${encodeURIComponent(file.type || 'application/octet-stream')}`,
        fileData,
        {
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error subiendo archivo a través del proxy:', error);
      throw error;
    }
  }
  
  // Método auxiliar para determinar el tipo MIME
  getFileMimeType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'mp3': 'audio/mpeg',
      'mp4': 'video/mp4'
    };
    
    // Si es una carpeta (termina en .folder)
    if (fileName.endsWith('.folder')) {
      return 'folder';
    }
    
    return mimeTypes[extension] || 'application/octet-stream';
  }
}

export default new BackblazeProxyService();