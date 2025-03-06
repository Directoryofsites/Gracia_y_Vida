import BackblazeTest from './components/BackblazeTest';
import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

import testBackblazeConnection from './utils/testBackblaze';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import FileExplorerDemo from './pages/FileExplorerDemo';
import YouTubeLinks from './pages/YouTubeLinks'; // Nueva importación
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  const [backblazeStatus, setBackblazeStatus] = React.useState(null);
  
  // Determinar si estamos en GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');
  // Usar el router apropiado
  const Router = isGitHubPages ? HashRouter : BrowserRouter;

  React.useEffect(() => {
    // Probar la conexión con Backblaze al iniciar
    const testConnection = async () => {
      const result = await testBackblazeConnection();
      setBackblazeStatus(result);
      console.log('Resultado de la prueba de Backblaze:', result);
    };
    
    testConnection();
  }, []);

  return (
    <AuthProvider>
      <Router>
        {backblazeStatus && (
          <div style={{ 
            background: backblazeStatus.success ? '#4CAF50' : '#f44336', 
            color: 'white', 
            padding: '10px', 
            textAlign: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000
          }}>
            {backblazeStatus.message}
          </div>
        )}
        <Routes>
          {/* Ruta principal redirige a dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Rutas protegidas */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/files" element={<FileExplorerDemo />} />
            </Route>
          </Route>
          
          {/* Rutas de autenticación */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          
          {/* Ruta 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;