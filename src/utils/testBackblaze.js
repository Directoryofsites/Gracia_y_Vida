import backblazeService from '../services/backblazeService';

// Función para probar la conexión con el servicio de almacenamiento
const testStorageConnection = async () => {
  try {
    console.log('Iniciando prueba de conexión con Backblaze B2...');
    
    // Usar el método testConnection que agregamos anteriormente
    const connectionResult = await backblazeService.testConnection();
    
    console.log('Resultado de la prueba:', connectionResult);
    
    // Asegurarse de que filesCount tenga un valor
    const filesCount = connectionResult.files ? connectionResult.files.length : 
                      (connectionResult.filesCount || 'No disponible');
    
    return {
      success: connectionResult.success,
      message: connectionResult.success 
        ? `Conexión exitosa. Bucket: ${connectionResult.bucketId}. Archivos: ${filesCount}` 
        : `Error de conexión: ${connectionResult.error}`,
      files: connectionResult.success ? connectionResult.files : null
    };
  } catch (error) {
    console.error('❌ Error inesperado en la prueba de conexión:', error);
    return {
      success: false,
      message: `Error inesperado: ${error.message}`
    };
  }
};

export default testStorageConnection;