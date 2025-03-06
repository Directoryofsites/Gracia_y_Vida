import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Comprobar si hay un usuario almacenado en localStorage al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Función de registro simulada
  const register = async (email, password, displayName) => {
    // Simulamos un registro
    const user = { email, displayName, uid: Date.now().toString() };
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  // Función de login simulada
  const login = async (email, password) => {
    // Simulamos autenticación
    if (email === 'admin@example.com' && password === 'password') {
      const user = { email, displayName: 'Admin User', uid: '1234567890' };
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      return user;
    }
    throw new Error('Credenciales incorrectas');
  };

  // Función de login con Google simulada
  const loginWithGoogle = async () => {
    // Simulamos login con Google
    const user = { 
      email: 'admin@example.com', 
      displayName: 'Admin User',
      uid: '1234567890'
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  // Función para recuperar contraseña simulada
  const forgotPassword = async (email) => {
    // Simulamos envío de correo
    console.log(`Se enviaría un correo de recuperación a ${email}`);
    return true;
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    return Promise.resolve();
  };

  // Verificar si es administrador (simulado)
  const isAdmin = async () => {
    return currentUser?.email === 'admin@example.com';
  };

  // Valor del contexto
  const value = {
    currentUser,
    loading,
    register,
    login,
    loginWithGoogle,
    forgotPassword,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
