import React, { useState } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useUI } from '../../contexts/UIContext';

const Toolbar = () => {
  const {
    currentPath,
    navigateUp,
    selectedItems,
    clearSelection,
    loadItems,
    copyToClipboard,
    cutToClipboard,
    paste,
    deleteFile,
    deleteFolder,
    getBreadcrumb,
    createFolder,
    uploadFile
  } = useFileSystem();

  const { isAdmin } = useAuth();
  const { showNotification } = useNotification();
  const { toggleViewMode, viewMode } = useUI();

  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const breadcrumb = getBreadcrumb();

  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implementar búsqueda de archivos
    showNotification('info', 'Función de búsqueda próximamente');
  };

  // Manejar creación de carpeta
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      showNotification('warning', 'Por favor ingrese un nombre para la carpeta');
      return;
    }

    try {
      await createFolder(newFolderName.trim(), currentPath);
      setNewFolderName('');
      setShowCreateFolder(false);
      showNotification('success', `Carpeta "${newFolderName}" creada`);
    } catch (error) {
      showNotification('error', `Error al crear carpeta: ${error.message}`);
    }
  };

  // Manejar eliminación de elementos seleccionados
  const handleDelete = async () => {
    if (selectedItems.length === 0) {
      showNotification('info', 'No hay elementos seleccionados para eliminar');
      return;
    }

    if (!window.confirm(`¿Está seguro de eliminar ${selectedItems.length} elemento(s)?`)) {
      return;
    }

    for (const item of selectedItems) {
      try {
        if (item.type === 'folder') {
          await deleteFolder(item.path);
        } else {
          await deleteFile(item.path);
        }
      } catch (error) {
        showNotification('error', `Error al eliminar ${item.name}: ${error.message}`);
      }
    }

    clearSelection();
    await loadItems();
    showNotification('success', 'Elementos eliminados correctamente');
  };

  // Manejar subida de archivos
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        await uploadFile(file, currentPath, (progress) => {
          // Aquí podrías implementar una barra de progreso
          console.log(`Progreso de ${file.name}: ${progress}%`);
        });
      }
      showNotification('success', `${files.length} archivo(s) subido(s) correctamente`);
    } catch (error) {
      showNotification('error', `Error al subir archivos: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="toolbar bg-gray-200 dark:bg-gray-700 p-2">
      <div className="flex flex-wrap items-center justify-between">
        {/* Navegación de ruta */}
        <div className="breadcrumb flex items-center flex-wrap">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={item.path}>
              {index > 0 && <span className="mx-1 text-gray-500">/</span>}
              <button
                onClick={() => navigateTo(item.path)}
                className="hover:underline px-1"
              >
                {item.name || 'Inicio'}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Búsqueda */}
        <div className="search-container">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar archivos..."
              className="px-2 py-1 rounded-l border dark:bg-gray-800 dark:text-white"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-1 rounded-r hover:bg-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Barra de herramientas principal */}
      <div className="flex flex-wrap items-center mt-2 space-x-2">
        {/* Botón de navegación hacia arriba */}
        <button
          onClick={navigateUp}
          disabled={!currentPath}
          className={`p-2 rounded ${!currentPath ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          title="Subir un nivel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>

        {/* Botón de actualizar */}
        <button
          onClick={() => loadItems()}
          className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          title="Actualizar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Separador */}
        <div className="border-r border-gray-400 dark:border-gray-500 h-6"></div>

        {isAdmin && (
          <>
            {/* Subir archivo */}
            <label className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer" title="Subir archivo">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>

            {/* Nueva carpeta */}
            <div className="relative">
              <button
                onClick={() => setShowCreateFolder(!showCreateFolder)}
                className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                title="Nueva carpeta"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </button>

              {showCreateFolder && (
                <form
                  onSubmit={handleCreateFolder}
                  className="absolute top-10 left-0 z-10 bg-white dark:bg-gray-800 p-2 rounded shadow-lg"
                >
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Nombre de carpeta"
                    className="px-2 py-1 border dark:bg-gray-700 dark:text-white rounded w-40"
                    autoFocus
                  />
                  <div className="flex mt-2">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 mr-1"
                    >
                      Crear
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateFolder(false)}
                      className="bg-gray-300 dark:bg-gray-600 px-2 py-1 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}

        {/* Separador */}
        <div className="border-r border-gray-400 dark:border-gray-500 h-6"></div>

        {/* Cortar, copiar, pegar */}
        {isAdmin && (
          <>
            <button
              onClick={cutToClipboard}
              disabled={selectedItems.length === 0}
              className={`p-2 rounded ${selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              title="Cortar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
              </svg>
            </button>
            <button
              onClick={copyToClipboard}
              disabled={selectedItems.length === 0}
              className={`p-2 rounded ${selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              title="Copiar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={paste}
              className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              title="Pegar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
          </>
        )}

        {/* Eliminar */}
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={selectedItems.length === 0}
            className={`p-2 rounded ${selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            title="Eliminar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1