import React from 'react';
import { useUI } from '../../contexts/UIContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const Header = () => {
  const { siteConfig, toggleSidebar, toggleDarkMode, darkMode, openConfig } = useUI();
  const { currentUser, isAdmin, logout } = useAuth();
  const { showNotification } = useNotification();

  const handleLogout = async () => {
    try {
      await logout();
      showNotification('success', 'Sesión cerrada correctamente');
    } catch (error) {
      showNotification('error', `Error al cerrar sesión: ${error.message}`);
    }
  };

  return (
    <header className="bg-blue-600 dark:bg-blue-800 text-white p-4 shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-4 p-2 hover:bg-blue-700 dark:hover:bg-blue-900 rounded"
            aria-label="Mostrar/ocultar barra lateral"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {siteConfig.logo && (
            <img
              src={siteConfig.logo}
              alt="Logo"
              className="h-8 w-auto mr-2"
            />
          )}

          <div>
            <h1 className="text-xl font-bold">{siteConfig.siteName}</h1>
            {siteConfig.subtitle && (
              <p className="text-sm">{siteConfig.subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={toggleDarkMode}
            className="p-2 mx-2 hover:bg-blue-700 dark:hover:bg-blue-900 rounded"
            aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {isAdmin && (
            <button
              onClick={openConfig}
              className="p-2 mx-2 hover:bg-blue-700 dark:hover:bg-blue-900 rounded"
              aria-label="Configuración del sitio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}

          <div className="px-2">
            <span className="font-medium">{currentUser?.displayName || currentUser?.email}</span>
            <span className="text-xs ml-2 bg-blue-700 px-2 py-1 rounded">
              {isAdmin ? 'Administrador' : 'Usuario'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-blue-700 dark:hover:bg-blue-900 rounded"
            aria-label="Cerrar sesión"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;