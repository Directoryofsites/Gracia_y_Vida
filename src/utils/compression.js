// Función para comprimir imágenes antes de subir
export const compressImage = async (file, maxWidth = 1920, maxHeight = 1080, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    // Crear un elemento de imagen para cargar el archivo
    const img = new Image();
    const reader = new FileReader();

    // Leer el archivo como URL de datos
    reader.onload = function(e) {
      img.src = e.target.result;
    };

    img.onload = function() {
      // Calcular nuevas dimensiones manteniendo la relación de aspecto
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      // Crear un canvas para la compresión
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      // Dibujar la imagen en el canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir el canvas a Blob
      canvas.toBlob(
        (blob) => {
          // Crear un nuevo archivo a partir del blob
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: file.lastModified
          });

          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };

    img.onerror = function() {
      reject(new Error('Error al cargar la imagen para comprimir'));
    };

    reader.readAsDataURL(file);
  });
};