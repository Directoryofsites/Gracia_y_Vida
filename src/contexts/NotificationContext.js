import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Mostrar notificación
  const showNotification = useCallback((type, message, duration = 5000) => {
    const id = uuidv4();
    
    const newNotification = {
      id,
      type,  // 'success', 'error', 'warning', 'info'
      message
    };

    setNotifications(prev => [...prev, newNotification]);

    // Eliminar notificación después de un tiempo
    setTimeout(() => {
      dismissNotification(id);
    }, duration);
  }, []);

  // Descartar notificación específica
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Limpiar todas las notificaciones
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    showNotification,
    dismissNotification,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};