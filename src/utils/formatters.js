// Formatear tamaño de archivo
export const formatFileSize = (bytes) => {
  if (bytes === 0 || !bytes) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Formatear fecha
export const formatDate = (date) => {
  if (!date) return 'Fecha desconocida';

  try {
    // Si es un objeto Date, usar directamente
    if (date instanceof Date) {
      return date.toLocaleString();
    }

    // Si es un timestamp de Firebase, convertir a Date
    if (date.toDate && typeof date.toDate === 'function') {
      return date.toDate().toLocaleString();
    }

    // Si es un string o número, convertir a Date
    return new Date(date).toLocaleString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
};

// Formatear nombre de usuario
export const formatUsername = (user) => {
  if (!user) return 'Usuario desconocido';

  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split('@')[0];
  if (user.phoneNumber) return `Usuario ${user.phoneNumber.slice(-4)}`;

  return `Usuario ${user.uid.substring(0, 6)}`;
};