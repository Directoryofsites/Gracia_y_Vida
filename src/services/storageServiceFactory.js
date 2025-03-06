// storageServiceFactory.js
// Factory que permite cambiar entre el servicio real de Backblaze y el mockStorageService

import backblazeService from './backblazeProxyService';
import mockStorageService from './mockStorageService';

// Configuración para determinar qué servicio utilizar
// true = usar mock, false = usar Backblaze real
const USE_MOCK_SERVICE = true;

// Exportar el servicio adecuado según la configuración
const storageService = USE_MOCK_SERVICE ? mockStorageService : backblazeService;

export default storageService;

// Función para poblar el mock con datos iniciales de ejemplo (para desarrollo)
export const initializeMockWithSampleData = async () => {
  if (!USE_MOCK_SERVICE) return;
  
  try {
    // Comprobar si ya hay datos
    const items = await mockStorageService.listFiles();
    if (items.length > 0) return; // Ya hay datos, no inicializar
    
    // Crear algunas carpetas de ejemplo
    await mockStorageService.uploadFile(
      new Blob([JSON.stringify({ name: 'Documentos', type: 'folder' })], 
      { type: 'application/json' }), 
      'Documentos/.folder'
    );
    
    await mockStorageService.uploadFile(
      new Blob([JSON.stringify({ name: 'Imágenes', type: 'folder' })], 
      { type: 'application/json' }), 
      'Imágenes/.folder'
    );
    
    await mockStorageService.uploadFile(
      new Blob([JSON.stringify({ name: 'Videos', type: 'folder' })], 
      { type: 'application/json' }), 
      'Videos/.folder'
    );
    
    // Crear algunos archivos de ejemplo
    const textBlob = new Blob(['Este es un documento de texto de ejemplo'], 
      { type: 'text/plain' });
    await mockStorageService.uploadFile(textBlob, 'Documentos/ejemplo.txt');
    
    const jsonBlob = new Blob([JSON.stringify({ titulo: 'Datos de ejemplo', contenido: 'Esto es un JSON' })], 
      { type: 'application/json' });
    await mockStorageService.uploadFile(jsonBlob, 'Documentos/datos.json');
    
    // Esto simularía una imagen, pero en realidad es solo un texto
    const fakeImageBlob = new Blob(['IMAGEN_SIMULADA'], { type: 'image/jpeg' });
    await mockStorageService.uploadFile(fakeImageBlob, 'Imágenes/sample.jpg');
    
    console.log('Mock inicializado con datos de ejemplo');
  } catch (error) {
    console.error('Error al inicializar el mock con datos de ejemplo:', error);
  }
};