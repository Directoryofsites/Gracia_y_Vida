import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  FaFolder, FaFile, FaFilePdf, FaFileWord, FaFileImage, 
  FaArrowLeft, FaArrowRight, FaArrowUp, FaSearch, FaDownload, 
  FaEye, FaLaptop, FaFolderOpen, FaImage, FaVideo, FaHome,
  FaEdit, FaUpload, FaYoutube
} from 'react-icons/fa';
import { getAllYoutubeLinks, getYoutubeLinkForFile, saveYoutubeLink, removeYoutubeLink } from './youtubeService';
import backblazeService from '../../services/backblazeService';
import mammoth from 'mammoth';
import './FileExplorer.css';

// Usar backblazeService como nuestro servicio de almacenamiento
const storageService = backblazeService;
const FileExplorer = () => {

  // Definiciones para el formulario de YouTube
const [youtubeLinks, setYoutubeLinks] = useState({});
const [showYoutubeUrlForm, setShowYoutubeUrlForm] = useState(false);
const [currentFileForYoutube, setCurrentFileForYoutube] = useState(null);
const [youtubeUrl, setYoutubeUrl] = useState('');
const [youtubeTitle, setYoutubeTitle] = useState('');

// Funciones para YouTube
const loadYoutubeLinks = () => {
  try {
    const links = getAllYoutubeLinks();
    setYoutubeLinks(links || {});
  } catch (error) {
    console.error('Error al cargar enlaces de YouTube:', error);
  }
};

const openYoutubeVideo = (file) => {
  const link = youtubeLinks[file.path];
  if (link && link.youtubeUrl) {
    window.open(link.youtubeUrl, '_blank', 'noopener,noreferrer');
  }
};


const handleAddYoutubeUrl = (file) => {
  // Verificar si el usuario tiene permisos
  if (!isAdmin()) {
    alert('No tienes permisos para asignar URLs de YouTube. Por favor, inicia sesión como administrador.');
    return;
  }
  
  setCurrentFileForYoutube(file);
  
  const existingLink = youtubeLinks[file.path];
  if (existingLink) {
    setYoutubeUrl(existingLink.youtubeUrl);
    setYoutubeTitle(existingLink.title);
  } else {
    setYoutubeUrl('');
    setYoutubeTitle('');
  }
  
  setShowYoutubeUrlForm(true);
};

const saveYoutubeUrlForFile = () => {
  try {
    if (!youtubeUrl || !currentFileForYoutube) return;
    
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      alert('Por favor, introduce una URL válida de YouTube');
      return;
    }
    
    saveYoutubeLink(
      currentFileForYoutube.path,
      youtubeUrl,
      youtubeTitle || 'Video de YouTube'
    );
    
    loadYoutubeLinks();
    
    setShowYoutubeUrlForm(false);
    setCurrentFileForYoutube(null);
    setYoutubeUrl('');
    setYoutubeTitle('');
    
  } catch (error) {
    console.error('Error al guardar URL de YouTube:', error);
    alert('Error al guardar la URL de YouTube');
  }
};

  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');




// Estados para el sistema de autenticación
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [currentUser, setCurrentUser] = useState(null);
const [showLoginForm, setShowLoginForm] = useState(false);
const [loginEmail, setLoginEmail] = useState('');
const [loginPassword, setLoginPassword] = useState('');
const [users] = useState([
  { id: 1, email: 'admin@ejemplo.com', password: 'admin123', role: 'admin', name: 'Administrador' },
  { id: 2, email: 'usuario@ejemplo.com', password: 'user123', role: 'user', name: 'Usuario Normal' }
]);


// Estados para el menú contextual y el portapapeles
const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null });
const [clipboard, setClipboard] = useState({ action: null, item: null });


  
  // Estado para información de la empresa
  const [companyName, setCompanyName] = useState('Mi Empresa');
  const [companyDescription, setCompanyDescription] = useState('Sistema de gestión de archivos y documentos');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [editingCompanyInfo, setEditingCompanyInfo] = useState(false);

 
  
// Cargar los archivos y carpetas al iniciar o cambiar de ruta
useEffect(() => {
  loadFilesAndFolders();
  loadYoutubeLinks(); // Añadimos esta línea
  
 
  
  // Cargar información de la empresa desde localStorage
  const savedCompanyName = localStorage.getItem('companyName');
  const savedCompanyDescription = localStorage.getItem('companyDescription');
  const savedCompanyLogo = localStorage.getItem('companyLogo');
  
  if (savedCompanyName) setCompanyName(savedCompanyName);
  if (savedCompanyDescription) setCompanyDescription(savedCompanyDescription);
  if (savedCompanyLogo) setCompanyLogo(savedCompanyLogo);
}, [currentPath]);


// Funciones para gestión de autenticación
useEffect(() => {
  // Verificar si hay un usuario guardado en localStorage al iniciar
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
    } catch (e) {
      console.error('Error parsing saved user', e);
      localStorage.removeItem('currentUser');
    }
  }
}, []);

// Función para verificar si el usuario es administrador
const isAdmin = () => {
  return isLoggedIn && currentUser && currentUser.role === 'admin';
};

// Función para manejar el inicio de sesión
const handleLogin = (e) => {
  e.preventDefault();
  
  const user = users.find(u => 
    u.email === loginEmail && u.password === loginPassword
  );
  
  if (user) {
    // Almacenar el usuario en estado y localStorage (omitir la contraseña)
    const safeUser = { ...user };
    delete safeUser.password;
    
    setCurrentUser(safeUser);
    setIsLoggedIn(true);
    localStorage.setItem('currentUser', JSON.stringify(safeUser));
    
    // Limpiar el formulario
    setLoginEmail('');
    setLoginPassword('');
    setShowLoginForm(false);
  } else {
    alert('Credenciales incorrectas. Inténtalo de nuevo.');
  }
};

// Función para cerrar sesión
const handleLogout = () => {
  setCurrentUser(null);
  setIsLoggedIn(false);
  localStorage.removeItem('currentUser');
};


  
  // Guardar información de la empresa
  const saveCompanyInfo = () => {
    localStorage.setItem('companyName', companyName);
    localStorage.setItem('companyDescription', companyDescription);
    if (companyLogo) localStorage.setItem('companyLogo', companyLogo);
    setEditingCompanyInfo(false);
  };
  
  // Manejar la carga del logo
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setCompanyLogo(e.target.result);
    };
    reader.readAsDataURL(file);
  };


  // Funciones para el portapapeles
const copyItem = (item) => {
  setClipboard({ action: 'copy', item: item });
  hideContextMenu();
};

const cutItem = (item) => {
  setClipboard({ action: 'cut', item: item });
  hideContextMenu();
};

const pasteItem = async () => {
  if (!clipboard.item || !clipboard.action) return;
  hideContextMenu();
  
  try {
    setLoading(true);
    
    const sourceItem = clipboard.item;
    const isFolder = sourceItem.type === 'folder';
    const newPath = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${sourceItem.name}`;
    
    if (clipboard.action === 'copy') {
      // Implementación de copia
      if (isFolder) {
        // Copiar carpeta - versión simplificada
        const folderData = {
          name: sourceItem.name,
          type: 'folder',
          path: newPath,
          isFolder: true,
          createdAt: new Date().toISOString()
        };
        
        await storageService.uploadFile(
          new Blob([JSON.stringify(folderData, null, 2)], { type: 'application/json' }), 
          `${newPath}/.folder`
        );
      } else {
        // Copiar archivo
        const fileContent = await storageService.downloadFile(sourceItem.path);
        await storageService.uploadFile(fileContent, newPath);
      }
    } else if (clipboard.action === 'cut') {
      // Implementación de corte (mover)
      if (isFolder) {
        // Mover carpeta - versión simplificada
        const folderData = {
          name: sourceItem.name,
          type: 'folder',
          path: newPath,
          isFolder: true,
          createdAt: new Date().toISOString()
        };
        
        await storageService.uploadFile(
          new Blob([JSON.stringify(folderData, null, 2)], { type: 'application/json' }), 
          `${newPath}/.folder`
        );
        await storageService.deleteFile(sourceItem.path);
      } else {
        // Mover archivo
        const fileContent = await storageService.downloadFile(sourceItem.path);
        await storageService.uploadFile(fileContent, newPath);
        await storageService.deleteFile(sourceItem.path);
      }
      // Limpiar el portapapeles después de cortar
      setClipboard({ action: null, item: null });
    }
    
    loadFilesAndFolders();
  } catch (err) {
    console.error('Error en la operación de portapapeles:', err);
    setError('Error en la operación. Por favor, inténtalo de nuevo.');
  } finally {
    setLoading(false);
  }
};





// Funciones para el menú contextual
const showContextMenu = (e, item) => {
  e.preventDefault();
  e.stopPropagation();
  
  setContextMenu({
    visible: true,
    x: e.clientX,
    y: e.clientY,
    item: item
  });
  
  // Agregar evento global para cerrar el menú al hacer clic
  document.addEventListener('click', hideContextMenu);
};

const hideContextMenu = () => {
  setContextMenu({ visible: false, x: 0, y: 0, item: null });
  document.removeEventListener('click', hideContextMenu);
};

const openItem = (item) => {
  hideContextMenu();
  
  if (item.type === 'folder') {
    navigateToFolder(item.path);
  } else {
    viewFile(item);
  }
};





// Función para cargar archivos y carpetas
const loadFilesAndFolders = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log("Cargando archivos para la ruta:", currentPath);
    
    // Normalizar la ruta para storageService
    const prefix = currentPath === '/' ? '' : (currentPath.startsWith('/') ? currentPath.substring(1) : currentPath);
    
    console.log("Prefix normalizado para el servicio de almacenamiento:", prefix);
    
    // Usar storageService.listFiles (ahora puede ser el mock o Backblaze)
    const items = await storageService.listFiles(prefix);
    
    console.log("Respuesta de storageService.listFiles:", items);
    
   
    // Separar en archivos y carpetas
console.log("Detalles de todos los items recibidos:", items.map(item => ({
  name: item.name,
  path: item.path,
  type: item.type
})));



// Procesar carpetas y asignar nombres desde las rutas
const foldersList = items
  .filter(item => 
    item.type === 'folder' || // Método normal
    item.name?.endsWith('/') || // Comprobar si termina con /
    item.path?.endsWith('/') || // Comprobar si la ruta termina con /
    (item.name?.includes('.folder') && !item.name?.startsWith('.')) // Archivos especiales de carpeta
  )
  .map(folder => {



    // Si la carpeta no tiene nombre, extraerlo de la ruta
    if (!folder.name || folder.name === "") {
      const pathParts = folder.path.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        folder.name = pathParts[pathParts.length - 1];
        console.log(`Carpeta con ruta ${folder.path} - Nombre extraído: ${folder.name}`);
      }
    }
    // Asegurar que tenga el tipo correcto
    folder.type = 'folder';
    return folder;
  });

const filesList = items.filter(item => 
  !foldersList.includes(item) && // Si no está en la lista de carpetas
  !item.name?.endsWith('.folder') // Y no es un archivo especial de carpeta
);







console.log("Carpetas detectadas usando criterios ampliados:", foldersList);
    
    console.log("Carpetas encontradas:", foldersList);
    console.log("Archivos encontrados:", filesList);


    // Depuración detallada de carpetas
foldersList.forEach(folder => {
  console.log('Detalles de carpeta:', {
    name: folder.name,
    path: folder.path,
    type: folder.type,
    isFolder: folder.type === 'folder',
    completeObject: folder
  });
});


// ANÁLISIS DETALLADO DE CARPETAS
console.log("ANÁLISIS DETALLADO DE CARPETAS:");
foldersList.forEach((folder, index) => {
  console.log(`Carpeta #${index + 1}:`, folder);
  console.log(`- Nombre: "${folder.name}"`);
  console.log(`- Ruta: "${folder.path}"`);
  console.log(`- Tipo: "${folder.type}"`);
  console.log(`- Es objeto vacío: ${Object.keys(folder).length === 0}`);
  
  // Inspeccionar todas las propiedades
  console.log("- Todas las propiedades:");
  for (const prop in folder) {
    console.log(`  * ${prop}: ${JSON.stringify(folder[prop])}`);
  }
  
  // Verificar si el nombre es una cadena vacía o null
  if (folder.name === "" || folder.name === null || folder.name === undefined) {
    console.log("  ¡ALERTA! Nombre de carpeta vacío o nulo");
  }
});


    
    setFolders(foldersList);
    setFiles(filesList);
  } catch (err) {
    console.error('Error loading files:', err);
    setError('Error al cargar los archivos. Por favor, inténtalo de nuevo.');
  } finally {
    setLoading(false);
  }
};


  // Función para navegar a una carpeta
  const navigateToFolder = (path) => {
    setCurrentPath(path);
  };


  
  // Navegación a carpetas principales
  const navigateToMain = (mainFolder) => {
    navigateToFolder(`/${mainFolder}`);
  };
  
  // Función para subir un nivel
  const navigateUp = () => {
    if (currentPath === '/') return;
    
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    const parentPath = pathParts.length ? `/${pathParts.join('/')}` : '/';
    navigateToFolder(parentPath);
  };
  
  // Función para crear una carpeta






  const createFolder = async () => {
    // Verificar si el usuario tiene permisos
    if (!isAdmin()) {
      alert('No tienes permisos para crear carpetas. Por favor, inicia sesión como administrador.');
      return;
    }
    
    const folderName = prompt('Nombre de la carpeta:');
    if (!folderName) return;
    
    try {
      setLoading(true);
      const path = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${folderName}`;
      
      console.log("Creando carpeta con nombre:", folderName);
      console.log("Ruta completa de la carpeta:", path);
      
      // Datos mejorados de la carpeta
      const folderData = {
        name: folderName.trim(), // Eliminamos espacios innecesarios
        type: 'folder',
        path: path,
        isFolder: true,
        createdAt: new Date().toISOString()
      };
      
      console.log("Datos de la carpeta a guardar:", folderData);
      
      // Guardar como JSON con formato legible
      await storageService.uploadFile(
        new Blob([JSON.stringify(folderData, null, 2)], { type: 'application/json' }), 
        `${path}/.folder`
      );
      
      console.log("Carpeta creada exitosamente");
      loadFilesAndFolders();
    } catch (err) {
      console.error('Error creating folder:', err);
      console.error('Detalles del error:', err.message, err.stack);
      setError('Error al crear la carpeta. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };


  
  // Función para subir un archivo


  const handleFileUpload = async (event) => {
    // Verificar si el usuario tiene permisos
    if (!isAdmin()) {
      alert('No tienes permisos para subir archivos. Por favor, inicia sesión como administrador.');
      return;
    }
    
    const uploadedFiles = event.target.files;
    if (!uploadedFiles.length) return;
    
    // Definir límite de tamaño: 2 MB en bytes
    const SIZE_LIMIT = 2 * 1024 * 1024; // 2MB
    
    try {
      setLoading(true);
      
      // Lista para archivos que exceden el límite
      const oversizedFiles = [];
      // Lista para archivos que serán subidos
      const filesToUpload = [];
      
      // Verificar tamaño de todos los archivos primero
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        if (file.size > SIZE_LIMIT) {
          oversizedFiles.push(file.name);
        } else {
          filesToUpload.push(file);
        }
      }
      
      // Mostrar aviso si hay archivos que exceden el límite
      if (oversizedFiles.length > 0) {
        alert(`Los siguientes archivos exceden el límite de 2 MB y no serán subidos:\n\n${oversizedFiles.join('\n')}`);
        
        if (filesToUpload.length === 0) {
          setLoading(false);
          return; // Salir si no hay archivos válidos para subir
        }
      }
      
      // Subir solo los archivos que están dentro del límite
      for (const file of filesToUpload) {
        const path = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${file.name}`;
        console.log(`Subiendo archivo: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        await storageService.uploadFile(file, path);
      }
      
      // Mostrar mensaje de éxito si algún archivo fue subido
      if (filesToUpload.length > 0) {
        console.log(`${filesToUpload.length} archivo(s) subidos con éxito`);
      }
      
      loadFilesAndFolders();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Error al subir el archivo. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };


// Función para eliminar un archivo o carpeta




const deleteItem = async (item) => {
  // Verificar si el usuario tiene permisos
  if (!isAdmin()) {
    alert('No tienes permisos para eliminar. Por favor, inicia sesión como administrador.');
    return;
  }
  
  if (!window.confirm(`¿Estás seguro de que quieres eliminar ${item.name}?`)) {
    return;
  }
  
  try {
    setLoading(true);
    
    // Cambio: usar storageService para eliminar archivos/carpetas
    await storageService.deleteFile(item.path);
    
    loadFilesAndFolders();
  } catch (err) {
    console.error('Error deleting item:', err);
    setError('Error al eliminar. Por favor, inténtalo de nuevo.');
  } finally {
    setLoading(false);
  }
};





// Función para renombrar un archivo o carpeta


const renameItem = async (item) => {
  // Verificar si el usuario tiene permisos
  if (!isAdmin()) {
    alert('No tienes permisos para renombrar. Por favor, inicia sesión como administrador.');
    return;
  }
  
  console.log("Intentando renombrar item:", item);
  const newName = prompt(`Ingresa el nuevo nombre para "${item.name}":`, item.name);
  
  if (!newName || newName === item.name) return;
  
  try {
    setLoading(true);
    
    // Verificar si es una carpeta
    const isFolder = item.type === 'folder' || item.path.endsWith('/');
    console.log("¿Es una carpeta?", isFolder);
    
    // Obtener la ruta del directorio padre
    const pathParts = item.path.split('/').filter(Boolean);
    console.log("Partes de la ruta:", pathParts);
    
    pathParts.pop(); // Eliminar el nombre actual
    const parentPath = pathParts.length ? `/${pathParts.join('/')}` : '/';
    console.log("Ruta del padre:", parentPath);
    
    // Crear la nueva ruta
    const newPath = `${parentPath}${parentPath.endsWith('/') ? '' : '/'}${newName}${isFolder ? '/' : ''}`;
    console.log("Nueva ruta:", newPath);
    





















    if (isFolder) {
      try {
        // Solución informativa mejorada
        alert(`El sistema no permite renombrar carpetas directamente.
    
    Para cambiar el nombre "${item.name}" a "${newName}":
    1. Se creará una nueva carpeta llamada "${newName}"
    2. Deberás abrir la carpeta "${item.name}"
    3. Descargar los archivos a tu computadora
    4. Luego subir los archivos a la nueva carpeta "${newName}"
    5. Finalmente, eliminar la carpeta "${item.name}" cuando ya no la necesites`);
        
        // Crear nueva carpeta vacía
        const folderData = {
          name: newName,
          type: 'folder',
          path: newPath,
          isFolder: true,
          createdAt: new Date().toISOString()
        };
        
        // Normalizar ruta para la nueva carpeta
        const newFolderMetadataPath = newPath.endsWith('/') 
          ? `${newPath}.folder` 
          : `${newPath}/.folder`;
        
        // Crear la nueva carpeta vacía
        await storageService.uploadFile(
          new Blob([JSON.stringify(folderData, null, 2)], { type: 'application/json' }), 
          newFolderMetadataPath
        );
        
        console.log("Carpeta vacía creada. El usuario completará el proceso manualmente.");
        
        // Recargar para mostrar la nueva carpeta
        loadFilesAndFolders();
        
      } catch (err) {
        console.error("Error creando carpeta vacía:", err);
        alert("No se pudo crear la carpeta. Por favor, inténtalo manualmente.");
      }
    } else {









      // Para archivos, el proceso es el mismo que antes
      console.log("Descargando archivo original:", item.path);
      const originalFile = await storageService.downloadFile(item.path);
      
      console.log("Subiendo archivo con nuevo nombre:", newPath);
      await storageService.uploadFile(originalFile, newPath);
      
      console.log("Eliminando archivo antiguo:", item.path);
      await storageService.deleteFile(item.path);
    }
    
    loadFilesAndFolders();
  } catch (err) {
    console.error('Error renaming item:', err);
    console.error('Error details:', err.message, err.stack);
    setError('Error al renombrar. Por favor, inténtalo de nuevo.');
  } finally {
    setLoading(false);
  }
};



  // Obtener el icono para un archivo
  const getFileIcon = (file) => {
    if (file.type === 'folder') {
      return <FaFolder className="file-icon folder-icon" />;
    } else if (file.type === 'application/pdf') {
      return <FaFilePdf className="file-icon pdf" />;
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return <FaFileWord className="file-icon doc" />;
    } else if (file.type.startsWith('image/')) {
      return <FaFileImage className="file-icon image" />;
    } else {
      return <FaFile className="file-icon" />;
    }
  };


  
  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


  const viewFile = async (file) => {
    try {
      // Verificar si estamos en modo mock (si el storageService tiene el método clearStorage)
      const isMockMode = typeof storageService.clearStorage === 'function';
      
      // Descargar el archivo desde el servicio de almacenamiento
      const fileContent = await storageService.downloadFile(file.path);
      
      if (file.type.startsWith('image/')) {
        // Código para imágenes
        const blob = new Blob([fileContent], { type: file.type });
        const blobUrl = URL.createObjectURL(blob);
        
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
          <html>
            <head>
              <title>${file.name}</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5; }
                img { max-width: 95%; max-height: 95%; object-fit: contain; }
              </style>
            </head>
            <body>
              <img src="${blobUrl}" alt="${file.name}" />
            </body>
          </html>
        `);
        newWindow.document.close();
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.type === 'application/msword'
      ) {
        // Lógica para documentos DOCX
        try {
          const result = await mammoth.convertToHtml({ arrayBuffer: fileContent });
          const newWindow = window.open('', '_blank');
          newWindow.document.write(`
            <html>
              <head>
                <title>${file.name}</title>
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    max-width: 800px; 
                    margin: 0 auto; 
                    padding: 20px; 
                    line-height: 1.6; 
                  }
                  img { max-width: 100%; height: auto; }
                </style>
              </head>
              <body>
                <h1>${file.name}</h1>
                <div id="document-content">${result.value || 'No se pudo convertir el contenido'}</div>
                <hr>
                <p><small>Conversión realizada con Mammoth.js</small></p>
              </body>
            </html>
          `);
          newWindow.document.close();
        } catch (error) {
          console.error('Error convirtiendo DOCX:', error);
          // Mostrar un mensaje de error en una nueva ventana
          const newWindow = window.open('', '_blank');
          newWindow.document.write(`
            <html>
              <head>
                <title>Error - ${file.name}</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                  .error { color: #e53935; margin-top: 20px; }
                </style>
              </head>
              <body>
                <h1>Error al abrir ${file.name}</h1>
                <p>No se pudo convertir el documento. ${isMockMode ? 'Esto puede deberse a que estás usando el modo mock.' : ''}</p>
                <p class="error">${error.message}</p>
              </body>
            </html>
          `);
          newWindow.document.close();
        }
      } else if (file.type === 'application/pdf') {
        // Lógica para PDFs
        try {
          const blob = new Blob([fileContent], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          
          // En modo mock, es probable que no tengamos un PDF real, así que mostraremos un mensaje
          if (isMockMode) {
            const newWindow = window.open('', '_blank');
            newWindow.document.write(`
              <html>
                <head>
                  <title>${file.name}</title>
                  <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                    .mock-notice { background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2196F3; margin-bottom: 20px; }
                  </style>
                </head>
                <body>
                  <h1>${file.name}</h1>
                  <div class="mock-notice">
                    <p><strong>Modo simulación:</strong> En el modo mock, no podemos mostrar el contenido real del PDF.</p>
                    <p>Este es un PDF simulado para propósitos de desarrollo.</p>
                  </div>
                  <iframe src="${blobUrl}" style="width: 100%; height: 500px; border: 1px solid #ddd;"></iframe>
                </body>
              </html>
            `);
            newWindow.document.close();
          } else {
            // En modo normal, intentamos abrir el PDF directamente
            window.open(blobUrl, '_blank');
          }
        } catch (error) {
          console.error('Error al abrir PDF:', error);
          alert(`No se pudo abrir el PDF ${file.name}. Error: ${error.message}`);
        }
      } else if (file.type === 'text/plain' || file.type === 'application/json') {
        // Lógica para archivos de texto o JSON
        try {
          let textContent;
          if (fileContent instanceof ArrayBuffer) {
            const decoder = new TextDecoder('utf-8');
            textContent = decoder.decode(fileContent);
          } else {
            textContent = JSON.stringify(fileContent, null, 2);
          }
          
          const newWindow = window.open('', '_blank');
          newWindow.document.write(`
            <html>
              <head>
                <title>${file.name}</title>
                <style>
                  body { font-family: monospace; padding: 20px; }
                  pre { background-color: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto; }
                </style>
              </head>
              <body>
                <h1>${file.name}</h1>
                <pre>${textContent}</pre>
              </body>
            </html>
          `);
          newWindow.document.close();
        } catch (error) {
          console.error('Error al abrir archivo de texto:', error);
          alert(`No se pudo abrir el archivo ${file.name}. Error: ${error.message}`);
        }
      } else {
        // Para otros tipos de archivos
        const blob = new Blob([fileContent], { type: file.type || 'application/octet-stream' });
        const blobUrl = URL.createObjectURL(blob);
        
        if (isMockMode) {
          // En modo mock, mostrar un aviso
          const newWindow = window.open('', '_blank');
          newWindow.document.write(`
            <html>
              <head>
                <title>${file.name}</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                  .mock-notice { background-color: #f5f5f5; padding: 15px; border-left: 4px solid #FFC107; margin-bottom: 20px; }
                </style>
              </head>
              <body>
                <h1>${file.name}</h1>
                <div class="mock-notice">
                  <p><strong>Modo simulación:</strong> En el modo mock, la previsualización puede no funcionar correctamente.</p>
                  <p>Tipo de archivo: ${file.type || 'Desconocido'}</p>
                </div>
                <p>
                  <a href="${blobUrl}" download="${file.name}">Descargar archivo</a>
                </p>
              </body>
            </html>
          `);
          newWindow.document.close();
        } else {
          // En modo normal, intentar abrir directamente
          window.open(blobUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error al visualizar el archivo:', error);
      alert(`No se puede previsualizar el archivo ${file.name}. Error: ${error.message}`);
    }
  };

                
  

  
// Función para descargar un archivo


const downloadFile = async (file) => {


  try {
    // Descargar el archivo desde el servicio de almacenamiento
    const fileContent = await storageService.downloadFile(file.path);


    
    // Crear un blob y generar un enlace de descarga
    const blob = new Blob([fileContent], { type: file.type });
    const blobUrl = URL.createObjectURL(blob);
    
    // Crear un enlace temporal
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error al descargar el archivo:', error);
    alert(`No se puede descargar el archivo ${file.name}.`);
  }
};













  // Filtrar archivos por búsqueda
  const filteredFiles = files.filter(
    file => file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filtrar carpetas por búsqueda
  const filteredFolders = folders.filter(
    folder => folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Cálculo del uso de almacenamiento (simulado)
  const storageUsed = 45; // Porcentaje
  const totalStorage = 100; // GB
  const usedStorage = Math.round(totalStorage * storageUsed / 100);
  
  return (
    <div className="file-explorer">



 {/* Encabezado */}
<div className="file-explorer-header">
  <div className="header-content">
    {!editingCompanyInfo ? (
      <>
        <div className="company-info">
          {companyLogo && (
            <div className="company-logo">
              <img src={companyLogo} alt="Logo" />
            </div>
          )}
          <div className="company-text">
            <div className="company-name">{companyName}</div>
            <div className="company-description">{companyDescription}</div>
          </div>
          <button 
            className="edit-button"
            onClick={() => setEditingCompanyInfo(true)}
          >
            <FaEdit />
          </button>
        </div>


        <div className="header-actions">
          <a href="#inicio">Inicio</a>
          {isLoggedIn ? (
            <div className="user-menu">
              <span className="welcome-text">Hola, {currentUser.name}</span>
              <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
            </div>
          ) : (
            <button className="login-button" onClick={() => setShowLoginForm(true)}>Iniciar Sesión</button>
          )}
        </div>



      </>
    ) : (
      <div className="edit-form-container">
        <h3>Editar información</h3>
        <div className="edit-form">
          <div className="form-group">
            <label>Nombre de empresa:</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Descripción:</label>
            <input
              type="text"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Logo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
            />
          </div>
          <div className="form-buttons">
            <button onClick={saveCompanyInfo}>Guardar</button>
            <button onClick={() => setEditingCompanyInfo(false)}>Cancelar</button>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
      

      {/* Cuerpo principal */}
      <div className="file-explorer-body">
        {/* Barra lateral */}
        <div className="sidebar">


          <div className="sidebar-section">
            <div className="sidebar-item" onClick={() => navigateToFolder('/')}>
              <FaHome className="sidebar-item-icon" />
              Principal
            </div>
          </div>
          


          <div className="sidebar-section">
  <div className="sidebar-title">Carpetas</div>
  {folders
    .filter(folder => folder.path.split('/').filter(Boolean).length === 1)
    .map(folder => (
      <div className="sidebar-item-container" key={folder.path}>
        <div 
          className="sidebar-item" 
          onClick={() => navigateToFolder(folder.path)}
        >
          <FaFolderOpen className="sidebar-item-icon" />
          {folder.name}
        </div>


        {isAdmin() && (
  <div className="sidebar-item-actions">
    <span 
      className="sidebar-action" 
      title="Renombrar"
      onClick={(e) => {
        e.stopPropagation();
        renameItem(folder);
      }}
    >
      <FaEdit size={14} />
    </span>
    {" "}
    <span 
      className="sidebar-action" 
      title="Eliminar"
      onClick={(e) => {
        e.stopPropagation();
        deleteItem(folder);
      }}
    >
      ×
    </span>
  </div>
)}


      </div>
    ))}




{isAdmin() && (
  <div 
    className="sidebar-add-item"
    onClick={() => {
      const name = prompt("Nombre de la nueva carpeta:");
      if (name) {
        const path = `/${name}`;
        storageService.uploadFile(
          new Blob([JSON.stringify({ name, type: 'folder', path })], { type: 'application/json' }), 
          `${path}/.folder`
        ).then(() => {
          loadFilesAndFolders();
        });
      }
    }}
  >
    + Agregar carpeta
  </div>
)}



</div>
          



          <div className="storage-section">
            <div>Almacenamiento</div>
            <div className="storage-bar">
              <div className="storage-bar-fill" style={{ width: `${storageUsed}%` }}></div>
            </div>
            <div className="storage-text">{usedStorage} GB / {totalStorage} GB usado</div>
          </div>
        </div>
        





        {/* Contenido principal */}
        <div className="main-content">
          {/* Barra de navegación */}
          <div className="navigation-bar">
            <div className="nav-buttons">
              <button className="nav-button" onClick={navigateUp} disabled={currentPath === '/'}>
                <FaArrowUp />
              </button>
            </div>
            
            <div className="path-display">
              Ruta: {currentPath === '/' ? 'Documentos' : currentPath.slice(1)}
            </div>
            
            <input 
              type="text" 
              className="search-bar" 
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Área de contenido */}
          <div className="content-area">
            {loading ? (
              <div>Cargando...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <>
                {/* Sección de carpetas */}
                {filteredFolders.length > 0 && (
                  <>
                    <div className="section-title">Carpetas</div>

                    <div className="folder-grid" style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
  gap: '2px !important', 
  margin: '0', 
  padding: '0',
  width: '100%'
}}>


                      {filteredFolders.map(folder => (
                        


                        <div 
  key={folder.path} 
  className="folder-item"
  onClick={() => navigateToFolder(folder.path)}
  onContextMenu={(e) => showContextMenu(e, folder)}
  style={{
    border: 'none',
    borderRadius: '0',
    margin: '2px',
    padding: '10px 10px 20px 10px',
    height: '120px',  // Aumentamos la altura para dar más espacio al icono
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    background: 'transparent',
    boxSizing: 'border-box',
    overflow: 'visible'
  }}
>



<FaFolder 
  size={70} 
  style={{ 
    color: '#ffd54f', 
    margin: '0 auto',
    display: 'block'
  }} 
/>
  

  <div style={{
  color: 'black',
  fontWeight: 'bold',
  marginTop: '8px',
  marginBottom: '20px', // Añadir espacio debajo del nombre
  fontSize: '0.9rem',
  maxWidth: '100%',
  textAlign: 'center',
  wordBreak: 'break-word'
}}>
  {/* Nombre de la carpeta */}
  {folder.name || folder.path.split('/').filter(Boolean)[0] || 'Carpeta'}
</div>




</div>


                      ))}
                    </div>
                  </>
                )}
                
                {/* Sección de archivos */}
                {filteredFiles.length > 0 ? (
                  <>
                    <div className="section-title">Archivos</div>


                    <table className="file-table">
  <tbody>
    {filteredFiles.map(file => (







<React.Fragment key={file.path}>
  {/* Fila principal con el nombre del archivo y acciones */}
  <tr className="file-row file-name-row" onContextMenu={(e) => showContextMenu(e, file)}>
    <td style={{ padding: '10px', display: 'flex', width: '100%', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <div style={{ marginRight: '10px' }}>
          {getFileIcon(file)}
        </div>
        <div style={{ 
          flexGrow: 1, 
          overflow: 'hidden',
          paddingRight: '5px'
        }}>
          <span style={{ 
            display: 'inline-block',
            wordBreak: 'break-word',
            lineHeight: '1.2',
            fontSize: '1rem'
          }}>{file.name}</span>
        </div>


        <div style={{ 
  display: 'flex', 
  flexShrink: 0,
  marginLeft: 'auto',
  whiteSpace: 'nowrap',
  gap: '5px'
}}>
  <span 
    className="action-link" 
    onClick={(e) => {
      e.stopPropagation();
      viewFile(file);
    }}
    title="Ver"
    style={{ fontSize: '0.8rem', padding: '3px 4px', marginRight: '3px' }}
  >
    Ver
  </span>
  <span 
    className="action-link" 
    onClick={(e) => {
      e.stopPropagation();
      downloadFile(file);
    }}
    title="Descargar"
    style={{ fontSize: '0.8rem', padding: '3px 4px', marginRight: '3px' }}
  >
    Des
  </span>
  {youtubeLinks[file.path] ? (
    <span 
      className="action-link action-link-youtube" 
      onClick={(e) => {
        e.stopPropagation();
        openYoutubeVideo(file);
      }}
      title="Ver en YouTube"
      style={{ fontSize: '0.8rem', padding: '3px 4px', marginRight: '3px' }}
    >
      <FaYoutube /> URL
    </span>
  ) : (
    isAdmin() && (
      <span 
        className="action-link" 
        onClick={(e) => {
          e.stopPropagation();
          handleAddYoutubeUrl(file);
        }}
        title="Agregar URL de YouTube"
        style={{ fontSize: '0.8rem', padding: '3px 4px', marginRight: '3px' }}
      >
        URL
      </span>
    )
  )}
  {isAdmin() && (
    <>
      <span 
        className="action-link" 
        onClick={(e) => {
          e.stopPropagation();
          renameItem(file);
        }}
        style={{ fontSize: '0.8rem', padding: '3px 4px', marginRight: '3px' }}
      >
        Ren
      </span>
      <span 
        className="action-link" 
        onClick={(e) => {
          e.stopPropagation();
          deleteItem(file);
        }}
        style={{ fontSize: '0.8rem', padding: '3px 4px' }}
      >
        Eli
      </span>
    </>
  )}
</div>


      </div>
    </td>
  </tr>
  
  {/* Fila de separación entre archivos */}
  <tr className="file-separator-row">
    <td colSpan="2"></td>
  </tr>
</React.Fragment>













    ))}
  </tbody>
</table>





                  </>
                ) : searchTerm ? (
                  <div>No se encontraron archivos que coincidan con "{searchTerm}"</div>
                ) : (
                  <div>No hay archivos en esta carpeta</div>
                )}
                
                {/* Acciones de archivo */}


                {isAdmin() && (
  <div style={{ marginTop: '20px' }}>
    <button style={{ marginRight: '10px' }} onClick={createFolder}>
      Nueva Carpeta
    </button>
    <label className="upload-button" style={{ 
      padding: '10px',
      backgroundColor: '#0066cc',
      color: 'white',
      borderRadius: '4px',
      cursor: 'pointer'
    }}>
      Subir Archivo
      <input 
        type="file" 
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        multiple
      />
    </label>
  </div>
)}



              </>
            )}
          </div>
                    
          {/* Barra de estado */}
          <div className="status-bar">
            <div>
              {filteredFolders.length} carpetas, {filteredFiles.length} archivos
            </div>
            <div className="copyright">
              © 2025 {companyName}
            </div>
          </div>
        </div>
      </div>



    {/* Formulario Modal para URL de YouTube */}
    {showYoutubeUrlForm && (
        <>
          <div className="modal-backdrop" onClick={() => setShowYoutubeUrlForm(false)}></div>
          <div className="youtube-url-form" onClick={e => e.stopPropagation()}>
            <h3>Agregar URL de YouTube</h3>
            <div>
              <label>URL de YouTube:</label>
              <input 
                type="text" 
                value={youtubeUrl} 
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label>Título (opcional):</label>
              <input 
                type="text" 
                value={youtubeTitle} 
                onChange={e => setYoutubeTitle(e.target.value)}
                placeholder="Título descriptivo del video"
              />
            </div>
            <div className="form-buttons">
              <button className="cancel" onClick={() => setShowYoutubeUrlForm(false)}>Cancelar</button>
              <button className="save" onClick={saveYoutubeUrlForFile}>Guardar</button>
            </div>
          </div>
        </>
      )}

{/* Formulario Modal para Inicio de Sesión */}
{showLoginForm && (
      <>
        <div className="modal-backdrop" onClick={() => setShowLoginForm(false)}></div>
        <div className="login-form" onClick={e => e.stopPropagation()}>
          <h3>Iniciar Sesión</h3>
          <form onSubmit={handleLogin}>
            <div>
              <label>Email:</label>
              <input 
                type="email" 
                value={loginEmail} 
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
            <div>
              <label>Contraseña:</label>
              <input 
                type="password" 
                value={loginPassword} 
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
              />
            </div>
            <div className="login-help">
              <small>
                <strong>Para pruebas:</strong><br />
                Admin: admin@ejemplo.com / admin123<br />
                Usuario: usuario@ejemplo.com / user123
              </small>
            </div>
            <div className="form-buttons">
              <button type="button" className="cancel" onClick={() => setShowLoginForm(false)}>Cancelar</button>
              <button type="submit" className="save">Iniciar Sesión</button>
            </div>
          </form>
        </div>
      </>
    )}



{/* Menú contextual */}
{contextMenu.visible && (
  <div 
    className="context-menu"
    style={{
      position: 'fixed',
      top: `${contextMenu.y}px`,
      left: `${contextMenu.x}px`,
      backgroundColor: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      borderRadius: '4px',
      zIndex: 1000,
      minWidth: '200px'
    }}
  >
    <ul style={{ 
      listStyle: 'none', 
      padding: 0, 
      margin: 0 
    }}>
      <li style={{ 
        padding: '8px 15px', 
        cursor: 'pointer',
        borderBottom: '1px solid #eee'
      }} onClick={() => openItem(contextMenu.item)}>
        <FaEye style={{ marginRight: '8px' }} /> Abrir
      </li>
      {contextMenu.item && contextMenu.item.type !== 'folder' && (
        <li style={{ 
          padding: '8px 15px', 
          cursor: 'pointer',
          borderBottom: '1px solid #eee'
        }} onClick={() => {
          downloadFile(contextMenu.item);
          hideContextMenu();
        }}>
          <FaDownload style={{ marginRight: '8px' }} /> Descargar
        </li>
      )}
      {isAdmin() && (
        <>
          <li style={{ 
            padding: '8px 15px', 
            cursor: 'pointer',
            borderBottom: '1px solid #eee'
          }} onClick={() => copyItem(contextMenu.item)}>
            <FaFile style={{ marginRight: '8px' }} /> Copiar
          </li>
          <li style={{ 
            padding: '8px 15px', 
            cursor: 'pointer',
            borderBottom: '1px solid #eee'
          }} onClick={() => cutItem(contextMenu.item)}>
            <FaEdit style={{ marginRight: '8px' }} /> Cortar
          </li>
          {clipboard.item && (
            <li style={{ 
              padding: '8px 15px', 
              cursor: 'pointer',
              borderBottom: '1px solid #eee'
            }} onClick={() => pasteItem()}>
              <FaFile style={{ marginRight: '8px' }} /> Pegar
            </li>
          )}
          <li style={{ 
            padding: '8px 15px', 
            cursor: 'pointer',
            borderBottom: '1px solid #eee'
          }} onClick={() => {
            renameItem(contextMenu.item);
            hideContextMenu();
          }}>
            <FaEdit style={{ marginRight: '8px' }} /> Renombrar
          </li>
          <li style={{ 
            padding: '8px 15px', 
            cursor: 'pointer',
            color: '#e53935'
          }} onClick={() => {
            deleteItem(contextMenu.item);
            hideContextMenu();
          }}>
            <FaFile style={{ marginRight: '8px' }} /> Eliminar
          </li>
        </>
      )}
    </ul>
  </div>
)}



    </div>
  );
};

export default FileExplorer;