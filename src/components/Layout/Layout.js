import React, { useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import { useUI } from '../../contexts/UIContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const { sidebarOpen, sidebarWidth, darkMode } = useUI();
  const { currentUser } = useAuth();
  const { navigateTo, currentPath } = useFileSystem();
  const location = useLocation();
  const navigate = useNavigate();

  // Manejar navegación basada en la URL
  useEffect(() => {
    if (location.pathname.startsWith('/folder/')) {
      const path = location.pathname.replace('/folder/', '').split('/').join('/');
      navigateTo(path);
    }
  }, [location, navigateTo]);

  // Actualizar la URL cuando cambia la ruta actual
  useEffect(() => {
    if (currentPath) {
      navigate(`/folder/${currentPath.split('/').join('/')}`);
    } else {
      navigate('/');
    }
  }, [currentPath, navigate]);

  return (
    <div className={`layout-container ${darkMode ? 'dark' : 'light'}`}>
      <Header />
      <div className="main-container flex">
        {sidebarOpen && (
          <div 
            className="sidebar-container bg-gray-100 dark:bg-gray-800"
            style={{ width: `${sidebarWidth}px` }}
          >
            <Sidebar />
          </div>
        )}
        <div className="content-container flex-1 bg-white dark:bg-gray-900">
          <Toolbar />
          <main className="p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;