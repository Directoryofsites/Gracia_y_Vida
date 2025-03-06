import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Mostrar spinner de carga si aún estamos verificando la autenticación
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirigir al login si no hay usuario autenticado
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Renderizar el contenido protegido si hay usuario autenticado
  return children;
};

export default PrivateRoute;