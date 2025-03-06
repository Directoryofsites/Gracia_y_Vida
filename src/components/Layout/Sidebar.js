import React, { useState, useEffect } from 'react';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { useUI } from '../../contexts/UIContext';

const Sidebar = () => {
  const { navigateTo, currentPath, loadItems } = useFileSystem();
  const { sidebarWidth, changeSidebarWidth } = useUI();

  const [rootItems, setRootItems] = useState({ folders: [], files: [] });
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isResizing, setIsResizing] = useState(false);
  const [initialX, setInitialX] = useState(0);
  const [initialWidth, setInitialWidth] = useState(sidebarWidth);

  // Cargar carpetas y archivos raíz
  useEffect(() => {
    const fetchRootItems = async () => {
      const items = await loadItems('');
      setRootItems(items);
    };

    fetchRootItems();
  }, [loadItems]);

  // Función para alternar la expansión de carpetas
  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
  };

  // Función para determinar si una carpeta está en la ruta actual
  const isInPath = (folderPath) => {
    return currentPath && (
      currentPath === folderPath || 
      currentPath.startsWith(`${folderPath}/`)
    );
  };

  // Expandir automáticamente las carpetas en la ruta actual
  useEffect(() => {
    if (currentPath) {
      const parts = currentPath.split('/');
      const paths = parts.map((part, index) => {
        if (index === 0) return part;
        return parts.slice(0, index + 1).join('/');
      });

      const newExpandedFolders = { ...expandedFolders };
      paths.forEach(path => {
        if (path) {
          newExpandedFolders[path] = true;
        }
      });

      setExpandedFolders(newExpandedFolders);
    }
  }, [currentPath]);

  // Manejar inicio de redimensionamiento
  const handleResizeStart = (e) => {
    setIsResizing(true);
    setInitialX(e.clientX);
    setInitialWidth(sidebarWidth);

    // Prevenir selección de texto durante el redimensionamiento
    document.body.classList.add('resize-cursor');

    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', handleResizeEnd);
  };

  // Manejar redimensionamiento
  const handleResize = (e) => {
    if (isResizing) {
      const newWidth = initialWidth + (e.clientX - initialX);
      
      if (newWidth > 150 && newWidth < 500) {
        changeSidebarWidth(newWidth);
      }
    }
  };

  // Manejar fin de redimensionamiento
  const handleResizeEnd = () => {
    setIsResizing(false);
    document.body.classList.remove('resize-cursor');

    window.removeEventListener('mousemove', handleResize);
    window.removeEventListener('mouseup', handleResizeEnd);
  };

  // Renderizar carpeta con sus subcarpetas
  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders[folder.path] || isInPath(folder.path);
    const isCurrentFolder = currentPath === folder.path;

    return (
      <div key={folder.id} className="folder-item">
        <div
          className={`pl-${level * 4} py-1 pr-2 flex items-center hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer ${
            isCurrentFolder ? 'bg-blue-100 dark:bg-blue-900' : ''
          }`}
          onClick={() => navigateTo(folder.path)}
        >
          <button
            className="w-4 h-4 flex items-center justify-center mr-1"
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(folder.path);
            }}
          >
            {folder.subFolders && folder.subFolders.length > 0 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3 w-3 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <span className="w-3"></span>
            )}
          </button>

          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>

          <span className="truncate">{folder.name}</span>
        </div>

        {isExpanded && folder.subFolders && (
          <div className="subfolder-container">
            {folder.subFolders.map(subFolder => renderFolder(subFolder, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Estructura de carpetas anidadas
  const buildFolderTree = () => {
    // Crear un mapa de todas las carpetas
    const folderMap = {};
    rootItems.folders.forEach(folder => {
      folderMap[folder.path] = { ...folder, subFolders: [] };
    });

    // Organizar carpetas en estructura de árbol
    const result = [];

    rootItems.folders.forEach(folder => {
      const path = folder.path;
      const parts = path.split('/');

      if (parts.length === 1) {
        // Carpeta raíz
        result.push(folderMap[path]);
      } else {
        // Subcarpeta
        const parentPath = parts.slice(0, parts.length - 1).join('/');
        
        if (folderMap[parentPath]) {
          folderMap[parentPath].subFolders.push(folderMap[path]);
        }
      }
    });

    return result;
  };

  const folderTree = buildFolderTree();

  return (
    <div className="sidebar h-full flex flex-col">
      <div className="sidebar-header p-2 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-lg">Carpetas</h3>
      </div>

      <div className="sidebar-content flex-grow overflow-auto p-2">
        <div
          className={`py-1 px-2 flex items-center hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer ${
            currentPath === '' ? 'bg-blue-100 dark:bg-blue-900' : ''
          }`}
          onClick={() => navigateTo('')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Inicio</span>
        </div>

        {folderTree.map(folder => renderFolder(folder))}
      </div>

      <div
        className="resize-handle absolute top-0 bottom-0 right-0 w-1 bg-gray-300 dark:bg-gray-600 cursor-ew-resize"
        onMouseDown={handleResizeStart}
      ></div>
    </div>
  );
};

export default Sidebar;