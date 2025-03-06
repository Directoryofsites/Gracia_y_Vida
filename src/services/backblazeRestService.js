import axios from 'axios';

class BackblazeRestService {
  constructor() {
    this.applicationKeyId = process.env.REACT_APP_B2_ACCOUNT_ID;
    this.applicationKey = process.env.REACT_APP_B2_APPLICATION_KEY;
    this.bucketName = process.env.REACT_APP_B2_BUCKET_NAME;
    this.authToken = null;
    this.apiUrl = null;
    this.downloadUrl = null;
    this.bucketId = null;
  }







  async authorize() {
    try {
      console.log('Intentando autorización con credenciales:');
      console.log('KeyID:', this.applicationKeyId);
      console.log('Bucket:', this.bucketName);
      
      const authString = `${this.applicationKeyId}:${this.applicationKey}`;
      const authHeader = `Basic ${btoa(authString)}`;
      
      console.log('Enviando solicitud a:', 'https://api.backblazeb2.com/b2api/v2/b2_authorize_account');
      
      const response = await axios({
        method: 'post',
        url: 'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
        headers: {
          'Authorization': authHeader
        }
      });
      
      console.log('Respuesta de autorización:', response.data);
      
      this.authToken = response.data.authorizationToken;
      this.apiUrl = response.data.apiUrl;
      this.downloadUrl = response.data.downloadUrl;
      
      console.log('Autorización exitosa con B2');
      return response.data;
    } catch (error) {
      console.error('Error al autorizar con B2:', error);
      console.error('Detalles del error:', error.response ? error.response.data : 'No hay detalles adicionales');
      throw error;
    }
  }




  async getBucketId() {
    if (this.bucketId) return this.bucketId;
    
    try {
      if (!this.authToken) {
        await this.authorize();
      }
      
      const response = await axios({
        method: 'post',
        url: `${this.apiUrl}/b2api/v2/b2_list_buckets`,
        headers: {
          'Authorization': this.authToken
        },
        data: {
          accountId: this.applicationKeyId
        }
      });
      
      const bucket = response.data.buckets.find(b => b.bucketName === this.bucketName);
      
      if (!bucket) {
        throw new Error(`Bucket '${this.bucketName}' no encontrado`);
      }
      
      this.bucketId = bucket.bucketId;
      return this.bucketId;
    } catch (error) {
      console.error('Error al obtener el ID del bucket:', error);
      throw error;
    }
  }

  async listFiles(prefix = '') {
    try {
      if (!this.authToken) {
        await this.authorize();
      }
      
      const bucketId = await this.getBucketId();
      const normalizedPrefix = prefix ? 
        (prefix.startsWith('/') ? prefix.substring(1) : prefix) : '';
      const finalPrefix = normalizedPrefix ? 
        (normalizedPrefix.endsWith('/') ? normalizedPrefix : `${normalizedPrefix}/`) : '';
      
      console.log('Listando archivos con prefix:', finalPrefix);
      
      const response = await axios({
        method: 'post',
        url: `${this.apiUrl}/b2api/v2/b2_list_file_names`,
        headers: {
          'Authorization': this.authToken
        },
        data: {
          bucketId: bucketId,
          prefix: finalPrefix,
          delimiter: '/',
          maxFileCount: 1000
        }
      });
      
      // Procesar carpetas (prefijos)
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
      
      console.log('Carpetas encontradas:', folders.length);
      console.log('Archivos encontrados:', files.length);
      
      return [...folders, ...files];
    } catch (error) {
      console.error('Error al listar archivos:', error);
      throw error;
    }
  }

  async getDownloadUrl(fileName) {
    try {
      if (!this.authToken) {
        await this.authorize();
      }
      
      // Normalizar el nombre del archivo (quitar / inicial si existe)
      const normalizedFileName = fileName.startsWith('/') ? fileName.substring(1) : fileName;
      
      return `${this.downloadUrl}/file/${this.bucketName}/${normalizedFileName}`;
    } catch (error) {
      console.error('Error al generar URL de descarga:', error);
      throw error;
    }
  }

  async downloadFile(fileName) {
    try {
      if (!this.authToken) {
        await this.authorize();
      }
      
      const downloadUrl = await this.getDownloadUrl(fileName);
      
      const response = await axios({
        method: 'get',
        url: downloadUrl,
        headers: {
          'Authorization': this.authToken
        },
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      throw error;
    }
  }

  async getUploadUrl() {
    try {
      if (!this.authToken) {
        await this.authorize();
      }
      
      const bucketId = await this.getBucketId();
      
      const response = await axios({
        method: 'post',
        url: `${this.apiUrl}/b2api/v2/b2_get_upload_url`,
        headers: {
          'Authorization': this.authToken
        },
        data: {
          bucketId: bucketId
        }
      });
      
      return {
        uploadUrl: response.data.uploadUrl,
        authorizationToken: response.data.authorizationToken
      };
    } catch (error) {
      console.error('Error al obtener URL de subida:', error);
      throw error;
    }
  }

  async uploadFile(file, path) {
    try {
      if (!this.authToken) {
        await this.authorize();
      }
      
      const uploadInfo = await this.getUploadUrl();
      
      // Normalizar el path (quitar / inicial si existe)
      const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
      
      // Convertir el archivo a ArrayBuffer si es necesario
      let fileData = file;
      if (file instanceof File) {
        fileData = await file.arrayBuffer();
      }
      
      // Calcular SHA1
      // Nota: En un entorno de navegador, calcular el SHA1 de archivos grandes puede ser complejo
      // Esto es una simplificación (en producción querrías un método más robusto)
      const sha1 = 'do_not_verify'; // No verificar el hash en este ejemplo
      
      const response = await axios({
        method: 'post',
        url: uploadInfo.uploadUrl,
        headers: {
          'Authorization': uploadInfo.authorizationToken,
          'X-Bz-File-Name': encodeURIComponent(normalizedPath),
          'Content-Type': file.type || 'application/octet-stream',
          'X-Bz-Content-Sha1': sha1,
          'X-Bz-Info-Author': 'file-explorer-app'
        },
        data: fileData
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al subir archivo:', error);
      throw error;
    }
  }

  async deleteFile(fileName, fileId) {
    try {
      if (!this.authToken) {
        await this.authorize();
      }
      
      // Si no se proporciona fileId, búscalo primero
      let actualFileId = fileId;
      if (!actualFileId) {
        const fileInfo = await this.findFileVersion(fileName);
        if (fileInfo) {
          actualFileId = fileInfo.fileId;
        } else {
          throw new Error(`No se encontró el archivo: ${fileName}`);
        }
      }
      
      // Normalizar el nombre del archivo (quitar / inicial si existe)
      const normalizedFileName = fileName.startsWith('/') ? fileName.substring(1) : fileName;
      
      const response = await axios({
        method: 'post',
        url: `${this.apiUrl}/b2api/v2/b2_delete_file_version`,
        headers: {
          'Authorization': this.authToken
        },
        data: {
          fileName: normalizedFileName,
          fileId: actualFileId
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      throw error;
    }
  }

  async findFileVersion(fileName) {
    try {
      if (!this.authToken) {
        await this.authorize();
      }
      
      const bucketId = await this.getBucketId();
      
      // Normalizar el nombre del archivo (quitar / inicial si existe)
      const normalizedFileName = fileName.startsWith('/') ? fileName.substring(1) : fileName;
      
      const response = await axios({
        method: 'post',
        url: `${this.apiUrl}/b2api/v2/b2_list_file_versions`,
        headers: {
          'Authorization': this.authToken
        },
        data: {
          bucketId: bucketId,
          fileName: normalizedFileName,
          maxFileCount: 1
        }
      });
      
      return response.data.files[0] || null;
    } catch (error) {
      console.error('Error al buscar versión de archivo:', error);
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

export default new BackblazeRestService();