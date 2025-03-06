async testConnection() {
  try {
    if (this.isDemo) {
      // Datos de demostración para mostrar
      const demoFiles = [
        {
          name: 'Documentos',
          path: '/Documentos',
          type: 'folder',
          isFolder: true
        },
        {
          name: 'Imágenes',
          path: '/Imágenes',
          type: 'folder',
          isFolder: true
        },
        {
          name: 'Readme.txt',
          path: '/Readme.txt',
          type: 'text/plain',
          size: 1024
        },
        {
          name: 'Bienvenido.pdf',
          path: '/Bienvenido.pdf',
          type: 'application/pdf',
          size: 2048
        }
      ];
      
      return {
        success: true,
        message: 'Modo demostración activo',
        bucketId: this.demoBucket.id,
        bucketName: this.demoBucket.name,
        filesCount: demoFiles.length,  // Añadimos el conteo de archivos
        files: demoFiles  // Añadimos los archivos de demostración
      };
    }
    
    // Verificar conexión con el servidor proxy
    const response = await axios.get(`${this.apiUrl}/status`);
    
    return {
      success: response.data.success,
      message: response.data.message,
      bucketId: response.data.bucketId,
      bucketName: response.data.bucketName,
      filesCount: response.data.filesCount || 0,
      files: response.data.files || []
    };
  } catch (error) {
    console.error('Error de conexión:', error);
    return {
      success: false,
      error: error.message
    };
  }
}