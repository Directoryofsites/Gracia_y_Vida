import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      // Por ahora, simulamos el login sin Firebase
      if (email === 'admin@example.com' && password === 'password') {
        // Establecer usuario y redirigir
        localStorage.setItem('currentUser', JSON.stringify({ 
          email: 'admin@example.com', 
          displayName: 'Admin User' 
        }));
        
        // Forzar una recarga para que el contexto detecte el usuario
        window.location.href = '/dashboard';
      } else {
        throw new Error('Credenciales incorrectas');
      }
    } catch (err) {
      setError('Credenciales incorrectas. Usa admin@example.com / password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
};

export default Login;