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
    
    // Almacenamiento en memoria para el modo demo
    this.demoStorage = {
      files: [
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
          size: 1024,
          content: 'Este es un archivo de demostración. En el modo demo puedes crear carpetas y subir archivos para probar la funcionalidad de la aplicación.'
        },
        {
          name: 'Bienvenido.pdf',
          path: '/Bienvenido.pdf',
          type: 'application/pdf',
          size: 2048,
          content: 'Contenido simulado de PDF para el modo demostración.'
        }
      ]
    };
    
    // Cargar datos del almacenamiento local si existen
    this.loadDemoDataFromLocalStorage();
  }
  
  // Método para cargar datos del localStorage
  loadDemoDataFromLocalStorage() {
    if (this.isDemo) {
      const savedData = localStorage.getItem('demoStorageData');
      if (savedData) {
        try {
          this.demoStorage = JSON.parse(savedData);
          console.log('[DEMO] Datos cargados del almacenamiento local');
        } catch (e) {
          console.error('[DEMO] Error al cargar datos del almacenamiento local:', e);
        }
      }
    }
  }
  
  // Método para guardar datos en localStorage
  saveDemoDataToLocalStorage() {
    if (this.isDemo) {
      try {
        localStorage.setItem('demoStorageData', JSON.stringify(this.demoStorage));
        console.log('[DEMO] Datos guardados en almacenamiento local');
      } catch (e) {
        console.error('[DEMO] Error al guardar datos en almacenamiento local:', e);
      }
    }
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

  async createFolder(path, folderName) {
    try {
      if (this.isDemo) {
        console.log(`[DEMO] Creando carpeta: ${folderName} en ruta: ${path}`);
        
        // Normalizar la ruta
        const normalizedPath = path.endsWith('/') ? path : `${path}/`;
        const folderPath = `${normalizedPath}${folderName}`;
        
        // Crear objeto para la nueva carpeta
        const newFolder = {
          name: folderName,
          path: folderPath,
          type: 'folder',
          isFolder: true,
          createdAt: new Date().toISOString()
        };
        
        // Añadir la carpeta al almacenamiento demo
        this.demoStorage.files.push(newFolder);
        
        // Guardar en localStorage
        this.saveDemoDataToLocalStorage();
        
        return {
          success: true,
          message: `Carpeta ${folderName} creada correctamente`,
          folder: newFolder
        };
      }
      
      // Si no estamos en modo demo, usar el servidor proxy
      const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
      const response = await axios.post(`${this.apiUrl}/folders/${normalizedPath}`, { name: folderName });
      return response.data;
    } catch (error) {
      console.error('Error creando carpeta:', error);
      throw error;
    }
  }

  async uploadFile(file, path) {
    try {
      if (this.isDemo) {
        console.log(`[DEMO] Simulando subida del archivo: ${path}`);
        
        // Para crear una carpeta en modo demo
        if (path.includes('/.folder')) {
          // Extraer datos de la carpeta del Blob
          const reader = new FileReader();
          return new Promise((resolve, reject) => {
            reader.onload = () => {
              try {
                const folderData = JSON.parse(reader.result);
                const newFolder = {
                  name: folderData.name,
                  path: folderData.path,
                  type: 'folder',
                  isFolder: true,
                  createdAt: new Date().toISOString()
                };
                
                // Verificar si la carpeta ya existe
                const exists = this.demoStorage.files.find(f => f.path === newFolder.path);
                if (!exists) {
                  this.demoStorage.files.push(newFolder);
                  this.saveDemoDataToLocalStorage();
                }
                
                resolve({
                  success: true,
                  message: 'Carpeta creada correctamente',
                  fileName: folderData.name,
                  fileId: 'demo-folder-id',
                  filePath: folderData.path
                });
              } catch (e) {
                reject(e);
              }
            };
            reader.onerror = reject;
            reader.readAsText(file);
          });
        }
        
        // Para archivos normales
        const fileName = file.name || path.split('/').pop();
        
        // Crear un nuevo objeto de archivo
        const newFile = {
          name: fileName,
          path: path,
          type: file.type || 'application/octet-stream',
          size: file.size || 1024,
          lastModified: new Date().toISOString(),
          content: 'Contenido simulado para el archivo en modo demo'
        };
        
        // Si es un archivo binario, intentar leerlo
        if (file instanceof Blob) {
          try {
            if (file.type.startsWith('text/') || file.type.includes('json')) {
              const text = await file.text();
              newFile.content = text;
            } else {
              newFile.content = 'Contenido binario simulado';
            }
          } catch (e) {
            console.warn('[DEMO] No se pudo leer el contenido del archivo:', e);
          }
        }
        
        // Buscar y eliminar archivo anterior si existe
        const existingIndex = this.demoStorage.files.findIndex(f => f.path === path);
        if (existingIndex !== -1) {
          this.demoStorage.files.splice(existingIndex, 1);
        }
        
        // Añadir el nuevo archivo
        this.demoStorage.files.push(newFile);
        
        // Guardar en localStorage
        this.saveDemoDataToLocalStorage();
        
        return {
          success: true,
          message: 'Archivo simulado subido correctamente',
          fileName: fileName,
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
        
        // Buscar el archivo en el almacenamiento demo
        const file = this.demoStorage.files.find(f => f.path === path);
        
        if (file) {
          // Si encontramos el archivo, devolver su contenido
          const content = file.content || `Contenido de demostración para ${path}`;
          return new Blob([content], { type: file.type || 'text/plain' });
        }
        
        // Si no encontramos el archivo, devolver contenido genérico
        return new Blob([`Contenido de demostración para ${path}`], { type: 'text/plain' });
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
        
        // Si el prefijo está vacío, estamos en la raíz
        if (!prefix || prefix === '' || prefix === '/') {
          // Filtrar solo los elementos que están en la raíz
          return this.demoStorage.files.filter(item => {
            const path = item.path;
            const pathParts = path.split('/').filter(Boolean);
            
            // Está en la raíz si no tiene partes de ruta o solo tiene una
            return pathParts.length <= 1;
          });
        }
        
        // Normalizar el prefijo para comparación
        const normalizedPrefix = prefix.startsWith('/') ? prefix : `/${prefix}`;
        const prefixWithSlash = normalizedPrefix.endsWith('/') ? normalizedPrefix : `${normalizedPrefix}/`;
        
        // Filtrar elementos que coinciden con el prefijo
        return this.demoStorage.files.filter(item => {
          // Normalizar la ruta del item
          const itemPath = item.path.startsWith('/') ? item.path : `/${item.path}`;
          
          // Incluir el elemento si es exactamente la carpeta que buscamos
          if (itemPath === normalizedPrefix && item.isFolder) {
            return true;
          }
          
          // Incluir elementos que están dentro de la carpeta actual
          if (itemPath.startsWith(prefixWithSlash)) {
            const remainingPath = itemPath.substring(prefixWithSlash.length);
            // No incluir elementos en subcarpetas
            return !remainingPath.includes('/');
          }
          
          return false;
        });
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
        console.log(`[DEMO] Simulando eliminación del archivo/carpeta: ${path}`);
        
        // Encontrar el índice del elemento a eliminar
        const index = this.demoStorage.files.findIndex(item => item.path === path);
        
        if (index !== -1) {
          // Eliminar el elemento
          this.demoStorage.files.splice(index, 1);
          
          // Si es una carpeta, eliminar también todos los archivos dentro
          if (path.endsWith('/') || this.demoStorage.files[index]?.isFolder) {
            const normalizedPath = path.endsWith('/') ? path : `${path}/`;
            
            // Eliminar recursivamente todos los elementos dentro de la carpeta
            let i = 0;
            while (i < this.demoStorage.files.length) {
              if (this.demoStorage.files[i].path.startsWith(normalizedPath)) {
                this.demoStorage.files.splice(i, 1);
              } else {
                i++;
              }
            }
          }
          
          // Guardar en localStorage
          this.saveDemoDataToLocalStorage();
          
          return {
            success: true,
            message: 'Elemento eliminado correctamente',
            filePath: path
          };
        }
        
        // Si no encontramos el elemento
        return {
          success: false,
          message: 'No se encontró el elemento para eliminar',
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
        // Datos de demostración para mostrar
        return {
          success: true,
          message: 'Modo demostración activo',
          bucketId: this.demoBucket.id,
          bucketName: this.demoBucket.name,
          filesCount: this.demoStorage.files.length,
          files: this.demoStorage.files
        };
      }
      
      // Verificar conexión con el servidor proxy
      const response = await axios.get(`${this.apiUrl}/status`);
      
      return {
        success: response.data.success,
        message: response.data.message,
        bucketId: response.data.bucketId,
        bucketName: response.data.bucketName,
        filesCount: response.data.filesCount || 0,
        files: response.data.files || []
      };
    } catch (error) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Método para limpiar el almacenamiento demo (útil para pruebas)
  clearDemoStorage() {
    if (this.isDemo) {
      // Restablecer a datos iniciales
      this.demoStorage = {
        files: [
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
            size: 1024,
            content: 'Este es un archivo de demostración. En el modo demo puedes crear carpetas y subir archivos para probar la funcionalidad de la aplicación.'
          },
          {
            name: 'Bienvenido.pdf',
            path: '/Bienvenido.pdf',
            type: 'application/pdf',
            size: 2048,
            content: 'Contenido simulado de PDF para el modo demostración.'
          }
        ]
      };
      
      // Guardar en localStorage
      this.saveDemoDataToLocalStorage();
      
      return {
        success: true,
        message: 'Almacenamiento demo restablecido'
      };
    }
    
    return {
      success: false,
      message: 'Esta operación solo está disponible en modo demo'
    };
  }
}

export default new BackblazeService();