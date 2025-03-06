// Cargar variables de entorno ANTES de cualquier otra cosa
const path = require('path');
const dotenvResult = require('dotenv').config({ 
  path: path.join(__dirname, '.env') 
});

// Verificar si dotenv cargó correctamente el archivo .env
if (dotenvResult.error) {
  console.error('Error cargando .env:', dotenvResult.error);
}

// Ahora importar los demás módulos
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');



// Verificación inmediata
console.log('Variables de entorno cargadas ANTES de cualquier operación:');
console.log('B2_KEY_ID:', process.env.B2_KEY_ID);
console.log('B2_APPLICATION_KEY:', process.env.B2_APPLICATION_KEY ? 'PRESENTE' : 'NO PRESENTE');
console.log('B2_BUCKET_NAME:', process.env.B2_BUCKET_NAME);





// Verificación explícita de variables
console.log('Verificación de variables de entorno:');
Object.keys(process.env)
  .filter(key => key.startsWith('B2_') || key === 'PORT')
  .forEach(key => {
    console.log(`${key}: ${process.env[key]}`);
    console.log(`Tipo de ${key}: ${typeof process.env[key]}`);
  });

// Imprimir todas las claves de process.env
console.log('Todas las claves de process.env:');
console.log(Object.keys(process.env));



const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api', apiRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor proxy de Backblaze B2 funcionando');
});

// Iniciar servidor
// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no capturado en el servidor:', err);
  console.error('Nombre del error:', err.name);
  console.error('Mensaje del error:', err.message);
  console.error('Pila de error:', err.stack);

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    errorName: err.name,
    errorMessage: err.message,
    errorStack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Servidor proxy para Backblaze B2 ejecutándose en http://localhost:${PORT}`);
});