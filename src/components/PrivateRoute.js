import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute() {
  const { currentUser } = useAuth();
  
  // Verificar si el usuario está autenticado
  // Si no, redirigir a la página de login
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
}