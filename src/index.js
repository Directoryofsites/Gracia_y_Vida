// Importaciones - todas agrupadas al principio
import { Buffer } from 'buffer';
import React from 'react';
import ReactDOM from 'react-dom';
import './styles/global.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Configuración global de Buffer después de las importaciones
window.Buffer = Buffer;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// Registrar Service Worker para PWA y notificaciones
serviceWorkerRegistration.register();