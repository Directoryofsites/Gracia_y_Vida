// Servicio de almacenamiento local usando IndexedDB
class LocalStorageService {
  constructor() {
    this.dbName = 'fileExplorerDB';
    this.dbVersion = 1;
    this.storeName = 'files';
    this.db = null;
    this.initDB();
  }

  // Inicializar la base de datos
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'path' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event) => {
        reject(`Error opening database: ${event.target.error}`);
      };
    });
  }

  // Asegurar que la base de datos está inicializada
  async ensureDBReady() {
    if (!this.db) {
      await this.initDB();
    }
  }

  // Guardar un archivo
  async uploadFile(file, path) {
    await this.ensureDBReady();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const fileData = {
            path,
            name: file.name,
            type: file.type,
            size: file.size,
            content: event.target.result,
            lastModified: file.lastModified,
            createdAt: new Date().getTime()
          };
          
          const transaction = this.db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          
          const request = store.put(fileData);
          
          request.onsuccess = () => resolve(fileData);
          request.onerror = (e) => reject(`Error saving file: ${e.target.error}`);
        } catch (error) {
          reject(`Error processing file: ${error.message}`);
        }
      };
      
      reader.onerror = () => reject('Error reading file');
      reader.readAsDataURL(file);
    });
  }

  // Obtener un archivo por ruta
  async getFile(path) {
    await this.ensureDBReady();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(path);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(`Error getting file: ${e.target.error}`);
    });
  }

  // Listar archivos en una carpeta
  async listFiles(folder = '/') {
    await this.ensureDBReady();
    
    return new Promise((resolve, reject) => {
      const files = [];
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          // Solo incluir archivos en la carpeta actual
          if (cursor.value.path.startsWith(folder) && 
              cursor.value.path !== folder &&
              !cursor.value.path.substring(folder.length + 1).includes('/')) {
            files.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(files);
        }
      };
      
      request.onerror = (e) => reject(`Error listing files: ${e.target.error}`);
    });
  }

  // Eliminar un archivo
  async deleteFile(path) {
    await this.ensureDBReady();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(path);
      
      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(`Error deleting file: ${e.target.error}`);
    });
  }

  // Crear una carpeta (en realidad solo creamos un marcador)
  async createFolder(path) {
    await this.ensureDBReady();
    
    const folderData = {
      path,
      name: path.split('/').filter(Boolean).pop() || '/',
      type: 'folder',
      size: 0,
      content: null,
      lastModified: new Date().getTime(),
      createdAt: new Date().getTime()
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(folderData);
      
      request.onsuccess = () => resolve(folderData);
      request.onerror = (e) => reject(`Error creating folder: ${e.target.error}`);
    });
  }
}

// Exportamos la instancia del servicio
export const storageService = new LocalStorageService();