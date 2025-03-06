import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p>¡Bienvenido {currentUser?.displayName || currentUser?.email}!</p>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Explorador de Archivos</h3>
          <p>Accede a tu explorador de archivos personal</p>
          <Link to="/files" className="dashboard-card-link">
            Ir al Explorador
          </Link>
        </div>
        
        <div className="dashboard-card">
          <h3>Perfil de Usuario</h3>
          <p>Administra tu información personal</p>
          <Link to="/profile" className="dashboard-card-link">
            Ver Perfil
          </Link>
        </div>
        
        <div className="dashboard-card">
          <h3>Configuración</h3>
          <p>Personaliza tus preferencias</p>
          <Link to="/settings" className="dashboard-card-link">
            Ajustes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;