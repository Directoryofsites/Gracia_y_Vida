import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  deleteDoc, 
  addDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';
import { db, storage, auth } from '../services/firebase';
import { useNotification } from './NotificationContext';
import { compressImage } from '../utils/compression';

const FileSystemContext = createContext();

export const useFileSystem = () => {
  return useContext(FileSystemContext);
};

export const FileSystemProvider = ({ children }) => {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState({ folders: [], files: [] });
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);
  const [clipboard, setClipboard] = useState(null);

  const { showNotification } = useNotification();

  // Navegar a una ruta específica
  const navigateTo = useCallback((path) => {
    setCurrentPath(path || '');
    loadItems(path);
  }, []);

  // Subir un archivo
  const uploadFile = async (file, path, onProgress) => {
    try {
      // Comprimir imágenes si es necesario
      let fileToUpload = file;
      if (file.type.startsWith('image/') && file.type !== 'image/svg+xml' && file.size > 1024 * 1024) {
        fileToUpload = await compressImage(file);
      }

      // Construir la ruta en Storage
      const fullPath = path ? `${path}/${file.name}` : file.name;
      const storageRef = ref(storage, fullPath);

      // Metadata personalizada
      const metadata = {
        contentType: fileToUpload.type,
        customMetadata: {
          originalName: file.name
        }
      };

      // Iniciar la carga
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload, metadata);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Reportar progreso
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(progress);
          },
          (error) => {
            // Error durante la carga
            reject(error);
          },
          async () => {
            try {
              // Carga completada, obtener URL de descarga
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              // Guardar referencia en Firestore
              const fileId = `${path}_${file.name}`.replace(/[[\]]/g, '_');
              
              await addDoc(collection(db, 'files'), {
                name: file.name,
                type: file.type,
                size: file.size,
                path: fullPath,
                downloadURL: downloadURL,
                createdAt: serverTimestamp(),
                createdBy: {
                  uid: auth.currentUser.uid,
                  email: auth.currentUser.email,
                  displayName: auth.currentUser.displayName || ''
                },
                lastModified: serverTimestamp(),
                metadata: metadata.customMetadata || {}
              });

              // Registrar actividad
              await logActivity('upload', fullPath);

              resolve({
                name: file.name,
                path: fullPath,
                downloadURL: downloadURL,
                size: file.size,
                type: file.type
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      throw error;
    }
  };

  // Cargar archivos y carpetas en una ruta
  const loadItems = useCallback(async (path = '') => {
    try {
      setError(null);
      
      // Obtener carpetas desde Firestore
      const foldersQuery = query(
        collection(db, 'folders'),
        where('path', '==', path)
      );
      const foldersSnapshot = await getDocs(foldersQuery);
      const folders = [];
      foldersSnapshot.forEach((doc) => {
        folders.push({ id: doc.id, ...doc.data() });
      });

      // Obtener archivos desde Firestore
      const filesQuery = query(
        collection(db, 'files'),
        where('path', '==', path)
      );
      const filesSnapshot = await getDocs(filesQuery);
      const files = [];
      filesSnapshot.forEach((doc) => {
        files.push({ id: doc.id, ...doc.data() });
      });

      setItems({ folders, files });
    } catch (error) {
      setError(`Error al cargar elementos: ${error.message}`);
      showNotification('error', `Error al cargar elementos: ${error.message}`);
    }
  }, [showNotification]);

  // Crear una nueva carpeta
  const createFolder = async (folderName, path = '') => {
    try {
      // Construir la ruta completa
      const fullPath = path ? `${path}/${folderName}` : folderName;

      // ID único para la carpeta
      const folderId = fullPath.replace(/[[\]]/g, '_');

      // Guardar en Firestore
      await addDoc(collection(db, 'folders'), {
        name: folderName,
        path: fullPath,
        type: 'folder',
        createdAt: serverTimestamp(),
        createdBy: {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName || ''
        },
        lastModified: serverTimestamp()
      });

      // Registrar actividad
      await logActivity('create_folder', fullPath);

      // Recargar elementos
      await loadItems(path);

      return {
        id: folderId,
        name: folderName,
        path: fullPath,
        type: 'folder'
      };
    } catch (error) {
      showNotification('error', `Error al crear carpeta: ${error.message}`);
      throw error;
    }
  };

  // Eliminar un archivo
  const deleteFile = async (filePath) => {
    try {
      // Referencia al archivo en Storage
      const fileRef = ref(storage, filePath);

      // Eliminar el archivo de Storage
      await deleteObject(fileRef);

      // Eliminar la referencia en Firestore
      const fileId = filePath.replace(/[[\]]/g, '_');
      const fileDocRef = doc(db, 'files', fileId);
      await deleteDoc(fileDocRef);

      // Registrar actividad
      await logActivity('delete_file', filePath);

      // Recargar elementos
      await loadItems(currentPath);

      showNotification('success', 'Archivo eliminado correctamente');
    } catch (error) {
      showNotification('error', `Error al eliminar archivo: ${error.message}`);
      throw error;
    }
  };

  // Eliminar una carpeta y su contenido
  const deleteFolder = async (folderPath) => {
    try {
      // Obtener todos los archivos y subcarpetas
      const folderRef = ref(storage, folderPath);
      const listResult = await listAll(folderRef);

      // Eliminar todos los archivos en la carpeta
      const deleteFilesPromises = listResult.items.map(item => deleteFile(item.fullPath));
      await Promise.all(deleteFilesPromises);

      // Procesar subcarpetas recursivamente
      const deleteFoldersPromises = listResult.prefixes.map(prefix => deleteFolder(prefix.fullPath));
      await Promise.all(deleteFoldersPromises);

      // Eliminar la referencia de la carpeta en Firestore
      const folderId = folderPath.replace(/[[\]]/g, '_');
      await deleteDoc(doc(db, 'folders', folderId));

      // Registrar actividad
      await logActivity('delete_folder', folderPath);

      // Recargar elementos
      await loadItems(currentPath);

      showNotification('success', 'Carpeta eliminada correctamente');
    } catch (error) {
      showNotification('error', `Error al eliminar carpeta: ${error.message}`);
      throw error;
    }
  };

  // Copiar al portapapeles
  const copyToClipboard = () => {
    setClipboard({
      type: 'copy',
      items: [...selectedItems]
    });
    showNotification('info', `${selectedItems.length} elemento(s) copiado(s)`);
  };

  // Cortar al portapapeles
  const cutToClipboard = () => {
    setClipboard({
      type: 'cut',
      items: [...selectedItems]
    });
    showNotification('info', `${selectedItems.length} elemento(s) cortado(s)`);
  };

  // Pegar desde el portapapeles
  const paste = async () => {
    if (!clipboard) {
      showNotification('warning', 'No hay elementos en el portapapeles');
      return;
    }

    try {
      for (const item of clipboard.items) {
        if (item.type === 'folder') {
          // Mover/copiar carpeta
          if (clipboard.type === 'cut') {
            await renameFolder(item.path, item.name);
          } else {
            // Lógica para copiar carpeta (podría requerir implementación más compleja)
            showNotification('warning', 'Copiar carpetas aún no implementado');
          }
        } else {
          // Mover/copiar archivo
          if (clipboard.type === 'cut') {
            await moveFile(item.path, currentPath);
          } else {
            // Copiar archivo (descargar y subir de nuevo)
            const response = await fetch(item.downloadURL);
            const blob = await response.blob();
            const fileObj = new File([blob], item.name, { type: item.type });
            await uploadFile(fileObj, currentPath);
          }
        }
      }

      // Limpiar portapapeles y selección
      setClipboard(null);
      setSelectedItems([]);
      
      // Recargar elementos
      await loadItems(currentPath);

      showNotification('success', 'Elementos pegados correctamente');
    } catch (error) {
      showNotification('error', `Error al pegar elementos: ${error.message}`);
    }
  };

  // Mover un archivo
  const moveFile = async (filePath, destinationPath) => {
    try {
      // Obtener nombre del archivo
      const pathParts = filePath.split('/');
      const fileName = pathParts.pop();

      // Construir la nueva ruta
      const newPath = destinationPath ? `${destinationPath}/${fileName}` : fileName;

      // Descargar el archivo
      const fileRef = ref(storage, filePath);
      const fileMetadata = await getMetadata(fileRef);
      const fileUrl = await getDownloadURL(fileRef);

      const response = await fetch(fileUrl);
      const blob = await response.blob();

      // Subir a la nueva ubicación
      const newFileRef = ref(storage, newPath);
      await uploadBytesResumable(newFileRef, blob, fileMetadata);

      // Actualizar en Firestore
      const oldFileId = filePath.replace(/[[\]]/g, '_');
      const newFileId = newPath.replace(/[[\]]/g, '_');

      // Obtener datos del archivo antiguo
      const fileDoc = doc(db, 'files', oldFileId);
      const fileData = (await getDoc(fileDoc)).data();

      // Crear nuevo documento con la ruta actualizada
      const newFileUrl = await getDownloadURL(newFileRef);

      await addDoc(collection(db, 'files'), {
        ...fileData,
        path: newPath,
        downloadURL: newFileUrl,
        lastModified: serverTimestamp()
      });

      // Eliminar archivo y documento antiguo
      await deleteObject(fileRef);
      await deleteDoc(doc(db, 'files', oldFileId));

      // Registrar actividad
      await logActivity('move_file', `${filePath} -> ${newPath}`);

      return {
        oldPath: filePath,
        newPath: newPath,
        downloadURL: newFileUrl
      };
    } catch (error) {
      showNotification('error', `Error al mover archivo: ${error.message}`);
      throw error;
    }
  };

  // Renombrar un archivo
  const renameFile = async (oldPath, newName) => {
    try {
      // Calcular la nueva ruta
      const pathParts = oldPath.split('/');
      pathParts.pop(); // Eliminar el nombre de archivo antiguo
      const newPath = [...pathParts, newName].join('/');

      // Descargar el archivo existente
      const fileRef = ref(storage, oldPath);
      const fileMetadata = await getMetadata(fileRef);
      const fileUrl = await getDownloadURL(fileRef);

      // Descargar el contenido del archivo
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      // Subir a la nueva ubicación
      const newFileRef = ref(storage, newPath);
      await uploadBytesResumable(newFileRef, blob, fileMetadata);

      // Actualizar en Firestore
      const oldFileId = oldPath.replace(/[[\]]/g, '_');
      const newFileId = newPath.replace(/[[\]]/g, '_');

      // Obtener datos del archivo antiguo
      const fileDoc = doc(db, 'files', oldFileId);
      const fileData = (await getDoc(fileDoc)).data();

      // Crear nuevo documento con el nombre actualizado
      const newFileUrl = await getDownloadURL(newFileRef);

      await addDoc(collection(db, 'files'), {
        ...fileData,
        name: newName,
        path: newPath,
        downloadURL: newFileUrl,
        lastModified: serverTimestamp()
      });

      // Eliminar archivo y documento antiguo
      await deleteObject(fileRef);
      await deleteDoc(doc(db, 'files', oldFileId));

      // Registrar actividad
      await logActivity('rename_file', `${oldPath} -> ${newPath}`);

      return {
        oldPath,
        newPath,
        downloadURL: newFileUrl
      };
    } catch (error) {
      showNotification('error', `Error al renombrar archivo: ${error.message}`);
      throw error;
    }
  };

  // Renombrar una carpeta
  const renameFolder = async (oldPath, newName) => {
    try {
      // Este proceso es complejo, ya que implica:
      // 1. Crear una nueva carpeta con el nuevo nombre
      // 2. Mover todos los archivos y subcarpetas
      // 3. Eliminar la carpeta antigua

      // Calcular la nueva ruta
      const pathParts = oldPath.split('/');
      const oldName = pathParts.pop(); // Eliminar el nombre de carpeta antiguo
const parentPath = pathParts.join('/');
    const newPath = parentPath ? `${parentPath}/${newName}` : newName;

    // Crear la nueva carpeta
    await addDoc(collection(db, 'folders'), {
      name: newName,
      path: newPath,
      type: 'folder',
      createdAt: serverTimestamp(),
      createdBy: {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName || ''
      },
      lastModified: serverTimestamp()
    });

    // Obtener todos los archivos y subcarpetas
    const { folders, files } = await listFilesAndFolders(oldPath);

    // Mover todos los archivos
    for (const file of files) {
      // Descargar el archivo
      const fileUrl = file.downloadURL;
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      // Crear un objeto File
      const fileObj = new File([blob], file.name, { type: file.type });

      // Subir a la nueva ubicación
      await uploadFile(fileObj, newPath);

      // Eliminar el archivo de la ubicación antigua
      await deleteFile(file.path);
    }

    // Manejar subcarpetas recursivamente
    for (const folder of folders) {
      // Extraer el nombre de la carpeta
      const folderName = folder.name;

      // Crear la carpeta en la nueva ubicación
      const newSubfolderPath = `${newPath}/${folderName}`;
      await createFolder(folderName, newPath);

      // Obtener el contenido de la subcarpeta
      const subfolderPath = `${oldPath}/${folderName}`;
      const { folders: subFolders, files: subFiles } = await listFilesAndFolders(subfolderPath);

      // Mover todos los archivos de la subcarpeta
      for (const file of subFiles) {
        // Descargar el archivo
        const fileUrl = file.downloadURL;
        const response = await fetch(fileUrl);
        const blob = await response.blob();

        // Crear un objeto File
        const fileObj = new File([blob], file.name, { type: file.type });

        // Subir a la nueva ubicación
        await uploadFile(fileObj, newSubfolderPath);

        // Eliminar el archivo de la ubicación antigua
        await deleteFile(file.path);
      }

      // Llamada recursiva para subcarpetas
      if (subFolders.length > 0) {
        for (const subFolder of subFolders) {
          await renameFolder(`${subfolderPath}/${subFolder.name}`, subFolder.name);
        }
      }
    }

    // Eliminar la carpeta antigua
    await deleteFolder(oldPath);

    // Registrar actividad
    await logActivity('rename_folder', `${oldPath} -> ${newPath}`);

    return {
      oldPath,
      newPath
    };
  } catch (error) {
    showNotification('error', `Error al renombrar carpeta: ${error.message}`);
    throw error;
  }
};

// Obtener la ruta de breadcrumb
const getBreadcrumb = () => {
  if (!currentPath) return [];

  const parts = currentPath.split('/');
  const breadcrumb = [];
  
  parts.reduce((acc, part) => {
    const path = acc ? `${acc}/${part}` : part;
    breadcrumb.push({ 
      name: part, 
      path 
    });
    return path;
  }, '');

  return breadcrumb;
};

// Navegar hacia arriba
const navigateUp = () => {
  if (!currentPath) return;

  const pathParts = currentPath.split('/');
  pathParts.pop(); // Eliminar el último segmento
  const newPath = pathParts.join('/');
  
  navigateTo(newPath);
};

// Registrar actividad de usuario
const logActivity = async (action, path) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    await addDoc(collection(db, 'activity_logs'), {
      action,
      path,
      timestamp: serverTimestamp(),
      user: {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || ''
      }
    });
  } catch (error) {
    console.error('Error registrando actividad:', error);
  }
};

// Buscar elementos
const searchItems = async (searchTerm) => {
  try {
    if (!searchTerm) {
      // Si no hay término de búsqueda, cargar elementos actuales
      await loadItems(currentPath);
      return;
    }

    // Buscar en archivos
    const filesQuery = query(
      collection(db, 'files'),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    const filesSnapshot = await getDocs(filesQuery);
    const files = [];
    filesSnapshot.forEach((doc) => {
      files.push({ id: doc.id, ...doc.data() });
    });

    // Buscar en carpetas
    const foldersQuery = query(
      collection(db, 'folders'),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    const foldersSnapshot = await getDocs(foldersQuery);
    const folders = [];
    foldersSnapshot.forEach((doc) => {
      folders.push({ id: doc.id, ...doc.data() });
    });

    setItems({ folders, files });
  } catch (error) {
    showNotification('error', `Error al buscar: ${error.message}`);
  }
};

// Seleccionar/deseleccionar elementos
const toggleSelection = (item) => {
  setSelectedItems(prev => {
    const isSelected = prev.some(selected => selected.path === item.path);
    
    if (isSelected) {
      // Deseleccionar
      return prev.filter(selected => selected.path !== item.path);
    } else {
      // Seleccionar
      return [...prev, item];
    }
  });
};

// Limpiar selección
const clearSelection = () => {
  setSelectedItems([]);
};

const value = {
  currentPath,
  navigateTo,
  navigateUp,
  uploadFile,
  loadItems,
  createFolder,
  deleteFile,
  deleteFolder,
  renameFile,
  renameFolder,
  moveFile,
  items,
  selectedItems,
  toggleSelection,
  clearSelection,
  copyToClipboard,
  cutToClipboard,
  paste,
  clipboard,
  error,
  getBreadcrumb,
  searchItems
};

return (
  <FileSystemContext.Provider value={value}>
    {children}
  </FileSystemContext.Provider>
);
};