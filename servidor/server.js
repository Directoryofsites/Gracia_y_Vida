const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Directorio base para almacenar archivos
const BASE_FILES_DIR = path.join(__dirname, 'files');

// Asegurarse de que el directorio de archivos exista
fs.ensureDirSync(BASE_FILES_DIR);

// Configuración de CORS
app.use(cors());

// Parsear JSON en el body
app.use(express.json());

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(BASE_FILES_DIR, req.body.path || '');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Middleware para verificar autenticación
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    
    if (!token) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Función para obtener la ruta absoluta del sistema de archivos
const getAbsolutePath = (relativePath) => {
  // Normalizar la ruta y asegurarse de que esté dentro del directorio base
  const normalizedPath = path.normalize(relativePath || '/').replace(/^(\.\.(\/|\\|$))+/, '');
  return path.join(BASE_FILES_DIR, normalizedPath);
};

// Función para convertir bytes a objetos de tipo archivo/carpeta
const getFileInfo = (basePath, filePath, stats) => {
  const relativePath = path.relative(BASE_FILES_DIR, filePath);
  const isDirectory = stats.isDirectory();
  
  return {
    id: Buffer.from(relativePath).toString('base64'),
    name: path.basename(filePath),
    type: isDirectory ? 'folder' : 'file',
    path: `/${relativePath}${isDirectory ? '/' : ''}`,
    size: isDirectory ? null : stats.size,
    modified: stats.mtime,
    extension: isDirectory ? null : path.extname(filePath).substring(1).toLowerCase()
  };
};

// Endpoint para obtener archivos y carpetas
app.get('/api/files', authenticate, async (req, res) => {
  try {
    const folderPath = getAbsolutePath(req.query.path);
    
    if (!(await fs.pathExists(folderPath))) {
      return res.status(404).json({ error: 'Carpeta no encontrada' });
    }
    
    const files = await fs.readdir(folderPath);
    const items = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(folderPath, file);
        const stats = await fs.stat(filePath);
        return getFileInfo(folderPath, filePath, stats);
      })
    );
    
    res.json(items);
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    res.status(500).json({ error: 'Error al obtener archivos' });
  }
});

// Endpoint para crear carpetas
app.post('/api/folders', authenticate, async (req, res) => {
  try {
    const { path: folderPath, name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nombre de carpeta no proporcionado' });
    }
    
    const newFolderPath = path.join(getAbsolutePath(folderPath), name);
    
    if (await fs.pathExists(newFolderPath)) {
      return res.status(409).json({ error: 'La carpeta ya existe' });
    }
    
    await fs.mkdir(newFolderPath);
    
    const stats = await fs.stat(newFolderPath);
    const folderInfo = getFileInfo(getAbsolutePath(folderPath), newFolderPath, stats);
    
    res.status(201).json(folderInfo);
  } catch (error) {
    console.error('Error al crear carpeta:', error);
    res.status(500).json({ error: 'Error al crear carpeta' });
  }
});

// Endpoint para subir archivos
app.post('/api/upload', authenticate, upload.array('file'), async (req, res) => {
  try {
    const uploadedFiles = req.files.map(file => {
      const filePath = file.path;
      const stats = fs.statSync(filePath);
      return getFileInfo(getAbsolutePath(req.body.path), filePath, stats);
    });
    
    res.status(201).json(uploadedFiles);
  } catch (error) {
    console.error('Error al subir archivos:', error);
    res.status(500).json({ error: 'Error al subir archivos' });
  }
});

// Endpoint para eliminar archivos
app.delete('/api/files', authenticate, async (req, res) => {
  try {
    const filePath = getAbsolutePath(req.body.path);
    
    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      return res.status(400).json({ error: 'La ruta proporcionada es una carpeta, no un archivo' });
    }
    
    await fs.unlink(filePath);
    
    res.json({ success: true, message: 'Archivo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ error: 'Error al eliminar archivo' });
  }
});

// Endpoint para eliminar carpetas
app.delete('/api/folders', authenticate, async (req, res) => {
  try {
    const folderPath = getAbsolutePath(req.body.path);
    
    if (!(await fs.pathExists(folderPath))) {
      return res.status(404).json({ error: 'Carpeta no encontrada' });
    }
    
    const stats = await fs.stat(folderPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'La ruta proporcionada es un archivo, no una carpeta' });
    }
    
    await fs.remove(folderPath);
    
    res.json({ success: true, message: 'Carpeta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar carpeta:', error);
    res.status(500).json({ error: 'Error al eliminar carpeta' });
  }
});

// Endpoint para renombrar archivos
app.put('/api/files/rename', authenticate, async (req, res) => {
  try {
    const { path: filePath, newName } = req.body;
    
    if (!newName) {
      return res.status(400).json({ error: 'Nuevo nombre no proporcionado' });
    }
    
    const oldPath = getAbsolutePath(filePath);
    
    if (!(await fs.pathExists(oldPath))) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    const stats = await fs.stat(oldPath);
    if (stats.isDirectory()) {
      return res.status(400).json({ error: 'La ruta proporcionada es una carpeta, no un archivo' });
    }
    
    const dir = path.dirname(oldPath);
    const newPath = path.join(dir, newName);
    
    if (await fs.pathExists(newPath)) {
      return res.status(409).json({ error: 'Ya existe un archivo con ese nombre' });
    }
    
    await fs.rename(oldPath, newPath);
    
    const newStats = await fs.stat(newPath);
    const fileInfo = getFileInfo(dir, newPath, newStats);
    
    res.json(fileInfo);
  } catch (error) {
    console.error('Error al renombrar archivo:', error);
    res.status(500).json({ error: 'Error al renombrar archivo' });
  }
});

// Endpoint para renombrar carpetas
app.put('/api/folders/rename', authenticate, async (req, res) => {
  try {
    const { path: folderPath, newName } = req.body;
    
    if (!newName) {
      return res.status(400).json({ error: 'Nuevo nombre no proporcionado' });
    }
    
    const oldPath = getAbsolutePath(folderPath);
    
    if (!(await fs.pathExists(oldPath))) {
      return res.status(404).json({ error: 'Carpeta no encontrada' });
    }
    
    const stats = await fs.stat(oldPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'La ruta proporcionada es un archivo, no una carpeta' });
    }
    
    const dir = path.dirname(oldPath);
    const newPath = path.join(dir, newName);
    
    if (await fs.pathExists(newPath)) {
      return res.status(409).json({ error: 'Ya existe una carpeta con ese nombre' });
    }
    
    await fs.rename(oldPath, newPath);
    
    const newStats = await fs.stat(newPath);
    const folderInfo = getFileInfo(dir, newPath, newStats);
    
    res.json(folderInfo);
  } catch (error) {
    console.error('Error al renombrar carpeta:', error);
    res.status(500).json({ error: 'Error al renombrar carpeta' });
  }
});

// Endpoint para obtener vista previa de archivos
app.get('/api/preview', authenticate, async (req, res) => {
  try {
    const filePath = getAbsolutePath(req.query.path);
    
    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      return res.status(400).json({ error: 'La ruta proporcionada es una carpeta, no un archivo' });
    }
    
    const extension = path.extname(filePath).substring(1).toLowerCase();
    
    // Para imágenes, enviar directamente el archivo
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return res.sendFile(filePath);
    }
    
    // Para archivos de texto, leer el contenido
    if (['txt', 'md', 'json', 'html', 'css', 'js'].includes(extension)) {
      const content = await fs.readFile(filePath, 'utf-8');
      return res.json({ content });
    }
    
    // Para PDF, por ahora solo indicamos que no se puede mostrar
    if (extension === 'pdf') {
      return res.json({ content: 'Vista previa de PDF no disponible en esta versión' });
    }
    
    // Para otros tipos de archivo
    res.json({ content: 'Vista previa no disponible para este tipo de archivo' });
  } catch (error) {
    console.error('Error al obtener vista previa:', error);
    res.status(500).json({ error: 'Error al obtener vista previa' });
  }
});

// Endpoint para descargar archivos
app.get('/api/download', authenticate, async (req, res) => {
  try {
    const filePath = getAbsolutePath(req.query.path);
    
    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      return res.status(400).json({ error: 'La ruta proporcionada es una carpeta, no un archivo' });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    res.status(500).json({ error: 'Error al descargar archivo' });
  }
});

// Endpoint para autenticación (para pruebas)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // En un entorno real, verificaríamos las credenciales en una base de datos
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign(
      { id: 1, username: 'admin', role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      user: { id: 1, username: 'admin', role: 'admin' },
      token
    });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});