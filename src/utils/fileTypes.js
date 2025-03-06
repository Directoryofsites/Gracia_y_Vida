import React from 'react';

// Función para obtener el icono según el tipo de archivo
export const getFileIcon = (fileType, size = 24) => {
  const iconSize = { width: size, height: size };

  // Iconos por tipo de archivo
  if (!fileType) {
    // Archivo desconocido
    return (
      <svg xmlns="http://www.w3.org/2000/svg" style={iconSize} className="text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  } else if (fileType.startsWith('image/')) {
    // Imágenes
    return (
      <svg xmlns="http://www.w3.org/2000/svg" style={iconSize} className="text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  } else if (fileType.startsWith('video/')) {
    // Videos
    return (
      <svg xmlns="http://www.w3.org/2000/svg" style={iconSize} className="text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    );
  } else if (fileType.startsWith('audio/')) {
    // Audios
    return (
      <svg xmlns="http://www.w3.org/2000/svg" style={iconSize} className="text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    );
  } else if (fileType === 'application/pdf') {
    // PDFs
    return (
      <svg xmlns="http://www.w3.org/2000/svg" style={iconSize} className="text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  } else if (
    fileType === 'application/msword' ||
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    // Documentos de Word
    return (
      <svg xmlns="http://www.w3.org/2000/svg" style={iconSize} className="text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  } else if (
    fileType === 'application/vnd.ms-excel' ||
    fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    // Hojas de cálculo de Excel
    return (
      <svg xmlns="http://www.w3.org/2000/svg" style={iconSize} className="text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  } else if (
    fileType === 'application/vnd.ms-powerpoint' ||
    fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ) {
    // Presentaciones de PowerPoint
    return (
      <svg xmlns="http://www.w3.org/2000/svg" style={iconSize} className="text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    );
  } else if (
    fileType === 'text/plain' ||
    fileType === 'text/html' ||
    fileType === 'text/css' ||
    fileType === 'text/javascript'
  ) {
    // Archivos de texto/código
    return (
      <svg xmlns="http://www.w3.org/2000/svg" style={iconSize} className="text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    );
  } else if (
    fileType === 'application/zip' ||
    fileType === 'application/x-zip-compressed' ||
    fileType === 'application/x-rar-compressed'
  ) {
    // Archivos comprimidos
    return (
      <svg xmlns="http://www.w3.org/2000/svg" style={iconSize} className="text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    );
  } else {
    // Cualquier otro tipo
    return (
      <svg xmlns="http://www.w3.org/2000/svg" style={iconSize} className="text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
};

// Obtener etiqueta descriptiva del tipo de archivo
export const getFileTypeLabel = (fileType) => {
  if (!fileType) return 'Archivo desconocido';

  // Mapa de tipos MIME a etiquetas legibles
  const typeMap = {
    // Imágenes
    'image/jpeg': 'Imagen JPEG',
    'image/png': 'Imagen PNG',
    'image/gif': 'Imagen GIF',
    'image/svg+xml': 'Imagen SVG',
    'image/webp': 'Imagen WebP',
    'image/bmp': 'Imagen BMP',
    'image/tiff': 'Imagen TIFF',

    // Documentos
    'application/pdf': 'Documento PDF',
    'application/msword': 'Documento Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Documento Word',
    'application/vnd.ms-excel': 'Hoja de cálculo Excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Hoja de cálculo Excel',
    'application/vnd.ms-powerpoint': 'Presentación PowerPoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Presentación PowerPoint',

    // Audio
    'audio/mpeg': 'Audio MP3',
    'audio/wav': 'Audio WAV',
    'audio/ogg': 'Audio OGG',
    'audio/midi': 'Audio MIDI',
    'audio/aac': 'Audio AAC',
    'audio/flac': 'Audio FLAC',

    // Video
    'video/mp4': 'Video MP4',
    'video/mpeg': 'Video MPEG',
    'video/webm': 'Video WebM',
    'video/ogg': 'Video OGG',
    'video/quicktime': 'Video QuickTime',

    // Texto
    'text/plain': 'Archivo de texto',
    'text/html': 'Archivo HTML',
    'text/css': 'Archivo CSS',
    'text/javascript': 'Archivo JavaScript',
    'text/xml': 'Archivo XML',
    'text/csv': 'Archivo CSV',
    'application/json': 'Archivo JSON',
    'application/xml': 'Archivo XML',

    // Comprimidos
    'application/zip': 'Archivo ZIP',
    'application/x-zip-compressed': 'Archivo ZIP',
    'application/x-rar-compressed': 'Archivo RAR',
    'application/x-7z-compressed': 'Archivo 7Z',
    'application/x-tar': 'Archivo TAR',
    'application/gzip': 'Archivo GZIP',
  };

  // Si el tipo está en el mapa, devolver la etiqueta
  if (typeMap[fileType]) return typeMap[fileType];

  // Para tipos genéricos, devolver una etiqueta basada en la categoría
  if (fileType.startsWith('image/')) return 'Imagen';
  if (fileType.startsWith('audio/')) return 'Audio';
  if (fileType.startsWith('video/')) return 'Video';
  if (fileType.startsWith('text/')) return 'Archivo de texto';
  if (fileType.startsWith('application/')) return 'Archivo de aplicación';

  // Si no hay coincidencia, devolver el tipo MIME
  return fileType;
};