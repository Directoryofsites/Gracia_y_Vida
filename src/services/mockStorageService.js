// mockStorageService.js
// Un servicio de almacenamiento simulado que utiliza localStorage
// para poder continuar el desarrollo mientras se resuelven los problemas con Backblaze B2

const STORAGE_KEY = 'mock_file_explorer_data';

// Inicializar el almacenamiento si no existe
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      files: {},
      folders: {}
    }));
  }
};

// Obtener todos los datos almacenados
const getStorageData = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
};

// Guardar datos en el almacenamiento
const saveStorageData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Convertir una ruta a un formato normalizado
const normalizePath = (path) => {
  // Eliminar barras iniciales y finales, y asegurarse de que es una cadena
  return (path || '').toString().replace(/^\/+|\/+$/g, '');
};

// Extraer el nombre de archivo/carpeta de una ruta
const getNameFromPath = (path) => {
  const parts = normalizePath(path).split('/');
  return parts[parts.length - 1] || '';
};

// Extraer la ruta del directorio padre
const getParentPath = (path) => {
  const normalized = normalizePath(path);
  const lastSlashIndex = normalized.lastIndexOf('/');
  return lastSlashIndex === -1 ? '' : normalized.substring(0, lastSlashIndex);
};

const mockStorageService = {
  // Listar archivos y carpetas en una ruta específica
  listFiles: async (prefix = '') => {
    const data = getStorageData();
    const normalizedPrefix = normalizePath(prefix);
    const prefixWithSlash = normalizedPrefix ? normalizedPrefix + '/' : '';
    
    // Función para verificar si un elemento está en el directorio actual
    const isInCurrentDir = (path) => {
      // Si el prefijo está vacío, estamos en la raíz
      if (!normalizedPrefix) {
        return path.indexOf('/') === -1;
      }
      
      // Si no, el elemento debe estar en el directorio actual
      // El path debe comenzar con el prefijo y no debe haber más directorios intermedios
      const relativePath = path.startsWith(prefixWithSlash) ? 
        path.substring(prefixWithSlash.length) : null;
      
      return relativePath && relativePath.indexOf('/') === -1;
    };

    // Recopilar carpetas
    const folderPaths = Object.keys(data.folders);
    const folders = folderPaths
      .filter(isInCurrentDir)
      .map(path => {
        return {
          ...data.folders[path],
          path: `/${path}`,  // Asegurar que las rutas empiecen con /
          type: 'folder'
        };
      });
    
    // Recopilar archivos
    const filePaths = Object.keys(data.files);
    const files = filePaths
      .filter(path => !path.endsWith('/.folder') && isInCurrentDir(path))
      .map(path => {
        return {
          ...data.files[path],
          path: `/${path}`,  // Asegurar que las rutas empiecen con /
        };
      });
    
    // Recopilar subcarpetas que no están explícitamente creadas
    // (esto es para manejar el caso en que los archivos están en subcarpetas 
    // que no han sido creadas explícitamente)
    const implicitFolders = new Set();
    
    filePaths.forEach(path => {
      if (path.startsWith(prefixWithSlash)) {
        const relativePath = path.substring(prefixWithSlash.length);
        const firstSlash = relativePath.indexOf('/');
        
        if (firstSlash !== -1) {
          const folderName = relativePath.substring(0, firstSlash);
          implicitFolders.add(folderName);
        }
      }
    });
    
    // Agregar carpetas implícitas a la lista si no existen ya
    implicitFolders.forEach(folderName => {
      if (!folders.some(f => f.name === folderName)) {
        const folderPath = normalizedPrefix ? `${normalizedPrefix}/${folderName}` : folderName;
        folders.push({
          name: folderName,
          path: `/${folderPath}`,
          type: 'folder'
        });
      }
    });
    
    return [...folders, ...files];
  },
  
  // Subir un archivo
  uploadFile: async (file, path) => {
    const data = getStorageData();
    const normalizedPath = normalizePath(path);
    
    // Si el archivo es un .folder, tratar como una carpeta
    if (normalizedPath.endsWith('/.folder')) {
      const folderPath = normalizedPath.substring(0, normalizedPath.length - 8);
      const folderName = getNameFromPath(folderPath);
      
      data.folders[folderPath] = {
        name: folderName,
        createdAt: new Date().toISOString()
      };
    } else {
      // Es un archivo normal
      // Comprobar si necesitamos crear directorios implícitos
      let currentPath = '';
      const pathParts = normalizedPath.split('/');
      
      // Crear todos los directorios padre si no existen ya
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (pathParts[i]) {
          currentPath = currentPath ? `${currentPath}/${pathParts[i]}` : pathParts[i];
          if (!data.folders[currentPath]) {
            data.folders[currentPath] = {
              name: pathParts[i],
              createdAt: new Date().toISOString()
            };
          }
        }
      }
      
      // Generar un objeto File/Blob simulado si se proporciona una cadena JSON
      let fileData;
      let fileType;
      
      if (file instanceof Blob) {
        // Si es un Blob real (como un archivo cargado)
        fileType = file.type || 'application/octet-stream';
        
        if (file.type === 'application/json') {
          // Si es un JSON, probablemente sea metadata
          try {
            const text = await file.text();
            fileData = JSON.parse(text);
          } catch (e) {
            fileData = null;
          }
        } else {
          // Para otros tipos, almacenar como ArrayBuffer
          fileData = await file.arrayBuffer();
        }
      } else {
        // Si no es un Blob, probablemente sea un objeto JSON
        fileType = 'application/json';
        fileData = file;
      }
      
      // Guardar información del archivo
      data.files[normalizedPath] = {
        name: getNameFromPath(normalizedPath),
        type: fileType,
        size: file.size || 0,
        createdAt: new Date().toISOString(),
        data: fileData
      };
    }
    
    saveStorageData(data);
    return { success: true };
  },
  
  // Descargar un archivo
  downloadFile: async (path) => {
    const data = getStorageData();
    const normalizedPath = normalizePath(path);
    
    const fileInfo = data.files[normalizedPath];
    if (!fileInfo) {
      throw new Error(`El archivo ${path} no existe`);
    }
    
    if (fileInfo.data instanceof ArrayBuffer) {
      return fileInfo.data;
    } else {
      // Si es JSON o texto, convertir a ArrayBuffer
      const jsonString = JSON.stringify(fileInfo.data);
      const encoder = new TextEncoder();
      return encoder.encode(jsonString).buffer;
    }
  },
  
  // Eliminar un archivo o carpeta
  deleteFile: async (path) => {
    const data = getStorageData();
    const normalizedPath = normalizePath(path);
    
    // Comprobar si es una carpeta
    if (data.folders[normalizedPath]) {
      // Es una carpeta, eliminar la carpeta y todos sus contenidos
      delete data.folders[normalizedPath];
      
      // Eliminar archivos dentro de la carpeta
      Object.keys(data.files).forEach(filePath => {
        if (filePath === normalizedPath + '/.folder' || 
            filePath.startsWith(normalizedPath + '/')) {
          delete data.files[filePath];
        }
      });
      
      // Eliminar subcarpetas
      Object.keys(data.folders).forEach(folderPath => {
        if (folderPath.startsWith(normalizedPath + '/')) {
          delete data.folders[folderPath];
        }
      });
    } else if (data.files[normalizedPath]) {
      // Es un archivo
      delete data.files[normalizedPath];
    } else {
      // Comprobar si hay un archivo .folder correspondiente
      const folderMetadataPath = normalizedPath + '/.folder';
      if (data.files[folderMetadataPath]) {
        delete data.files[folderMetadataPath];
      } else {
        throw new Error(`El archivo o carpeta ${path} no existe`);
      }
    }
    
    saveStorageData(data);
    return { success: true };
  },
  
  // Obtener información sobre un archivo
  getFileInfo: async (path) => {
    const data = getStorageData();
    const normalizedPath = normalizePath(path);
    
    if (data.files[normalizedPath]) {
      return {
        ...data.files[normalizedPath],
        path: `/${normalizedPath}`
      };
    }
    
    if (data.folders[normalizedPath]) {
      return {
        ...data.folders[normalizedPath],
        path: `/${normalizedPath}`,
        type: 'folder'
      };
    }
    
    throw new Error(`El archivo o carpeta ${path} no existe`);
  },
  
  // Limpiar todos los datos (útil para pruebas)
  clearStorage: () => {
    localStorage.removeItem(STORAGE_KEY);
    initStorage();
  }
};

export default mockStorageService;