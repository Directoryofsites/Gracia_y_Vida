const B2 = require('backblaze-b2');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');



// Crear instancia B2 con comprobación de variables de entorno
let b2;
try {
  // Verificar que existan las variables de entorno necesarias
  if (!process.env.B2_KEY_ID) {
    throw new Error('Variable de entorno B2_KEY_ID no definida');
  }
  if (!process.env.B2_APPLICATION_KEY) {
    throw new Error('Variable de entorno B2_APPLICATION_KEY no definida');
  }
  
  // En Backblaze B2, applicationKeyId es el keyId
  b2 = new B2({
    applicationKeyId: process.env.B2_KEY_ID,
    applicationKey: process.env.B2_APPLICATION_KEY
  });



  
// Mostrar la configuración exacta que se está usando
console.log('Configuración exacta B2:');
console.log('applicationKeyId:', process.env.B2_KEY_ID);
console.log('applicationKey primer 4 caracteres:', process.env.B2_APPLICATION_KEY.substring(0, 4));




  
  console.log('Instancia B2 creada correctamente');
} catch (error) {
  console.error('Error al crear instancia B2:', error.message);



  console.error('Variables de entorno presentes:', {
    B2_KEY_ID: !!process.env.B2_KEY_ID,
    B2_APPLICATION_KEY: !!process.env.B2_APPLICATION_KEY,
    B2_BUCKET_NAME: !!process.env.B2_BUCKET_NAME
  });




}


// Añadir logs de depuración
console.log('Configuración B2:');
console.log('Key ID:', process.env.B2_KEY_ID);
console.log('Application Key:', process.env.B2_APPLICATION_KEY ? 'Presente' : 'NO PRESENTE');
console.log('Bucket Name:', process.env.B2_BUCKET_NAME);

// Variable para almacenar el estado de autenticación
let authStatus = {
  authorized: false,
  lastAuth: null,
  authData: null,
  error: null
};

// Función para autorizar (con reintento si es necesario)
async function authorizeB2() {
  // Si ya estamos autorizados y la autorización es reciente (menos de 23 horas), reutilizar
  const now = new Date();
  if (authStatus.authorized && authStatus.lastAuth && 
      (now - authStatus.lastAuth) < (23 * 60 * 60 * 1000)) {
    return authStatus.authData;
  }




  try {
    console.log('Iniciando autorización con Backblaze B2...');



    console.log('Usando Key ID:', process.env.B2_KEY_ID);
    console.log('Application Key (longitud):', process.env.B2_APPLICATION_KEY ? process.env.B2_APPLICATION_KEY.length : 0);
    console.log('Bucket Name:', process.env.B2_BUCKET_NAME);



    
    // Mostrar los primeros y últimos caracteres de la clave para verificación
    if (process.env.B2_APPLICATION_KEY) {
      const key = process.env.B2_APPLICATION_KEY;
      console.log('Key preview:', key.substring(0, 4) + '...' + key.substring(key.length - 4));
    }
    
    console.log('Llamando a b2.authorize()...');
    const authResponse = await b2.authorize();
    
    console.log('Respuesta de autorización:', JSON.stringify(authResponse.data, null, 2));
    
    authStatus = {
      authorized: true,
      lastAuth: new Date(),
      authData: authResponse.data,
      error: null
    };
    
    console.log('Autorización exitosa con Backblaze B2');
    return authResponse.data;
  } catch (error) {
    console.error('Error autorizando con Backblaze B2:', error.message);
    console.error('Tipo de error:', error.name);
    console.error('Stack trace:', error.stack);
    
    // Información detallada sobre las variables de entorno
    console.error('Estado de variables de entorno:');


    console.error('- B2_KEY_ID existe:', 'B2_KEY_ID' in process.env);
console.error('- B2_KEY_ID valor (parcial):', process.env.B2_KEY_ID ? 
  `${process.env.B2_KEY_ID.substring(0, 4)}...${process.env.B2_KEY_ID.substring(process.env.B2_KEY_ID.length - 4)}` : 'undefined');
    
    
      console.error('- B2_APPLICATION_KEY existe:', 'B2_APPLICATION_KEY' in process.env);
    console.error('- B2_APPLICATION_KEY longitud:', process.env.B2_APPLICATION_KEY ? process.env.B2_APPLICATION_KEY.length : 0);
    console.error('- B2_BUCKET_NAME:', process.env.B2_BUCKET_NAME);
    
    authStatus = {
      authorized: false,
      lastAuth: new Date(),
      authData: null,
      error: error.message
    };
    throw error;
  }






}

// Obtener el ID del bucket



async function getBucketId() {
  try {
    const authData = await authorizeB2();
    
    // Usar directamente el bucketId de la autorización
    if (authData.allowed && authData.allowed.bucketId) {
      console.log('Usando bucketId desde autorización:', authData.allowed.bucketId);
      return authData.allowed.bucketId;
    } else {
      throw new Error('No se pudo obtener el bucketId desde la autorización');
    }
  } catch (error) {
    console.error('Error obteniendo ID de bucket:', error);
    throw error;
  }
}

// Controladores





exports.checkStatus = async (req, res) => {
  try {
    console.log('Iniciando verificación de estado...');
    
    // Paso 1: Autenticar
    const authData = await authorizeB2();
    console.log('Autenticación completada');
    
    // Paso 2: Usar directamente el bucketId de la autorización
    if (authData.allowed && authData.allowed.bucketId) {
      const bucketId = authData.allowed.bucketId;
      console.log('Usando bucketId directo:', bucketId);
      
      res.json({
        success: true,
        message: 'Conexión exitosa con Backblaze B2',
        bucketId: bucketId,
        bucketName: authData.allowed.bucketName || process.env.B2_BUCKET_NAME,
        authData: {
          accountId: authData.accountId,
          downloadUrl: authData.downloadUrl,
          apiUrl: authData.apiUrl,
          capabilities: authData.allowed.capabilities
        }
      });
    } else {
      console.error('No se encontró bucketId en la autorización');
      res.status(500).json({
        success: false,
        message: 'No se pudo obtener el ID del bucket',
        error: 'BucketId no disponible en los datos de autorización'
      });
    }
  } catch (error) {
    console.error('Error en verificación de estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error de conexión con Backblaze B2',
      error: error.message
    });
  }
};







exports.listFiles = async (req, res) => {
  try {
    await authorizeB2();
    const bucketId = await getBucketId();
    
    // Obtener el prefijo de la consulta o usar vacío
    const prefix = req.query.prefix || '';
    
    // Normalizar el prefijo para Backblaze
    const normalizedPrefix = prefix ? 
      (prefix.startsWith('/') ? prefix.substring(1) : prefix) : 
      '';
    
    // Añadir / al final si es necesario
    const finalPrefix = normalizedPrefix ? 
      (normalizedPrefix.endsWith('/') ? normalizedPrefix : `${normalizedPrefix}/`) : 
      '';
    
    console.log("Prefijo normalizado:", finalPrefix);
    
    const response = await b2.listFileNames({
      bucketId: bucketId,
      prefix: finalPrefix,
      delimiter: '/',
      maxFileCount: 1000
    });
    
   
// Procesar carpetas
console.log('Carpetas devueltas por Backblaze:', response.data.folders);
const folders = (response.data.folders || []).map(folderPath => {
  const parts = folderPath.split('/').filter(Boolean);
  const name = parts[parts.length - 1];
  
  console.log(`Procesando carpeta: ${folderPath}, nombre extraído: ${name}`);
  
  return {
    name: name,
    path: `/${folderPath}`,
    type: 'folder',
    size: 0
  };
});
console.log('Objetos de carpetas procesados:', folders);

    
    // Procesar archivos
    const files = response.data.files
      .filter(file => {
        const fileName = file.fileName;
        return !fileName.endsWith('/.folder') && 
               !fileName.endsWith('.folder') && 
               !fileName.startsWith('.');
      })
      .map(file => {
        const fileName = file.fileName;
        const name = fileName.split('/').pop();
        
        return {
          name: name,
          path: `/${fileName}`,
          type: getFileMimeType(fileName),
          size: file.contentLength || 0,
          lastModified: file.uploadTimestamp
        };
      });
    
    res.json([...folders, ...files]);
  } catch (error) {
    console.error('Error listando archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar archivos',
      error: error.message
    });
  }
};

exports.getFile = async (req, res) => {
  try {
    await authorizeB2();
    
    // Obtener la ruta del archivo desde los parámetros
    let filePath = req.params.path;
    if (filePath.startsWith('/')) {
      filePath = filePath.substring(1);
    }
    
    // Obtener cabeceras de autorización para descargar
    const authData = authStatus.authData;
    const downloadUrl = `${authData.downloadUrl}/file/${process.env.B2_BUCKET_NAME}/${filePath}`;
    
    // Redirigir al cliente directamente al URL de descarga con autorización
    const headers = {
      'Authorization': authData.authorizationToken
    };
    
    // Obtener el archivo de Backblaze
    const response = await fetch(downloadUrl, { headers });
    
    if (!response.ok) {
      throw new Error(`Error descargando archivo: ${response.statusText}`);
    }
    
    // Obtener el tipo de contenido para establecer el header correcto
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    
    // Configurar headers de respuesta
    res.setHeader('Content-Type', contentType);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    
    // Transmitir el contenido al cliente
    const fileStream = response.body;
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error descargando archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar el archivo',
      error: error.message
    });
  }
};

exports.uploadFile = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      await authorizeB2();
      const bucketId = await getBucketId();
      
      // Obtener la ruta del archivo desde los parámetros
      let filePath = req.params.path;
      if (filePath.startsWith('/')) {
        filePath = filePath.substring(1);
      }
      
      // Obtener URL para subir
      const uploadUrlResponse = await b2.getUploadUrl({
        bucketId: bucketId
      });
      
      // Subir archivo
      const uploadResponse = await b2.uploadFile({
        uploadUrl: uploadUrlResponse.data.uploadUrl,
        uploadAuthToken: uploadUrlResponse.data.authorizationToken,
        fileName: filePath,
        data: req.file.buffer,
        contentType: req.file.mimetype
      });
      
      res.json({
        success: true,
        message: 'Archivo subido correctamente',
        fileId: uploadResponse.data.fileId,
        fileName: uploadResponse.data.fileName
      });
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir el archivo',
        error: error.message
      });
    }
  }
];



exports.deleteFile = async (req, res) => {
  try {
    console.log('Solicitud de eliminar archivo recibida para:', req.params.path);
    await authorizeB2();
    
    // Obtener la ruta del archivo desde los parámetros
    let filePath = req.params.path;
    if (filePath.startsWith('/')) {
      filePath = filePath.substring(1);
    }
    console.log('Ruta de archivo normalizada:', filePath);
    
    // Verificar si es una carpeta (termina con /)
    const isFolder = filePath.endsWith('/');
    
    if (isFolder) {
      console.log('Detectada solicitud de eliminación de carpeta');
      
      // Obtener el ID del bucket
      const bucketId = await getBucketId();
      
      // Listar todos los archivos con el prefijo de la carpeta
      console.log('Listando archivos con prefijo:', filePath);
      const response = await b2.listFileNames({
        bucketId: bucketId,
        prefix: filePath,
        maxFileCount: 1000
      });
      
      console.log(`Encontrados ${response.data.files.length} archivos para eliminar`);
      
      // Eliminar cada archivo en la carpeta
      const deletePromises = response.data.files.map(async (file) => {
        console.log(`Eliminando archivo: ${file.fileName} (ID: ${file.fileId})`);
        return b2.deleteFileVersion({
          fileId: file.fileId,
          fileName: file.fileName
        });
      });
      
      await Promise.all(deletePromises);
      console.log('Todos los archivos en la carpeta eliminados correctamente');
      
      res.json({
        success: true,
        message: 'Carpeta eliminada correctamente'
      });



    } else {
      // Código para eliminar un solo archivo
      console.log('Buscando información del archivo...');
      
      try {
        // Obtener el ID del bucket
        const bucketId = await getBucketId();
        
        // Listar archivos para encontrar coincidencias exactas
        console.log('Listando archivos para encontrar:', filePath);
        const response = await b2.listFileNames({
          bucketId: bucketId,
          prefix: filePath,
          maxFileCount: 10
        });
        
        console.log(`Encontrados ${response.data.files.length} archivos con el prefijo.`);
        
        // Buscar una coincidencia exacta con el nombre del archivo
        const exactMatch = response.data.files.find(file => file.fileName === filePath);
        
        if (exactMatch) {
          console.log(`Coincidencia exacta encontrada: ${exactMatch.fileName} (ID: ${exactMatch.fileId})`);
          
          // Eliminar el archivo
          await b2.deleteFileVersion({
            fileId: exactMatch.fileId,
            fileName: exactMatch.fileName
          });
          
          console.log('Archivo eliminado correctamente');
          res.json({
            success: true,
            message: 'Archivo eliminado correctamente'
          });
        } else {
          console.log('No se encontró una coincidencia exacta para:', filePath);
          console.log('Archivos encontrados con este prefijo:', response.data.files.map(f => f.fileName));
          
          return res.status(404).json({
            success: false,
            message: 'Archivo no encontrado',
            detail: 'No se encontró una coincidencia exacta para el archivo'
          });
        }
      } catch (error) {
        console.error('Error en el flujo de eliminación de archivos:', error);
        throw error; // Propagar el error para que sea capturado por el bloque principal
      }
    }




  } catch (error) {
    console.error('Error eliminando archivo:', error);
    console.error('Detalles del error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No hay respuesta'
    });
    
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el archivo',
      error: error.message,
      details: error.response ? error.response.data : null
    });
  }
};



// Función auxiliar para encontrar una versión de archivo
async function findFileVersion(fileName) {
  try {
    console.log('Buscando versión de archivo para:', fileName);
    const bucketId = await getBucketId();
    
    const response = await b2.listFileVersions({
      bucketId: bucketId,
      prefix: fileName,
      maxFileCount: 1
    });

    console.log('Respuesta de listFileVersions:', 
      response.data.files.length > 0 ? 'Archivos encontrados' : 'No se encontraron archivos');
    
    if (response.data.files.length === 0) {
      console.log('No se encontraron archivos con el prefijo:', fileName);
      return null;
    }
    
    return response.data.files[0] || null;
  } catch (error) {
    console.error('Error buscando versión de archivo:', error);
    throw error;
  }
}





// Función auxiliar para determinar el tipo MIME
function getFileMimeType(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4'
  };

  if (fileName.endsWith('.folder')) {
    return 'folder';
  }

  return mimeTypes[extension] || 'application/octet-stream';
}