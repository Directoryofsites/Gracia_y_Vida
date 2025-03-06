// Esta es una versión simplificada del servicio que usa localStorage
// Cuando configures Firebase, deberás adaptarlo para usar Firestore

const STORAGE_KEY = 'youtube_links_by_file';

/**
 * Guarda un enlace de YouTube asociado a un archivo
 * 
 * @param {string} filePath - Ruta del archivo
 * @param {string} youtubeUrl - URL de YouTube
 * @param {string} title - Título descriptivo para el enlace (opcional)
 * @returns {Object} Información del enlace guardado
 */
export const saveYoutubeLink = (filePath, youtubeUrl, title = '') => {
  try {
    const allLinks = getAllYoutubeLinks();
    
    const linkData = {
      filePath,
      youtubeUrl,
      title: title || 'Video de YouTube',
      createdAt: new Date().toISOString()
    };
    
    allLinks[filePath] = linkData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLinks));
    
    return linkData;
  } catch (error) {
    console.error('Error al guardar enlace de YouTube:', error);
    throw error;
  }
};

/**
 * Obtiene todos los enlaces de YouTube
 * 
 * @returns {Object} Objeto con todos los enlaces, indexados por filePath
 */
export const getAllYoutubeLinks = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error al obtener enlaces de YouTube:', error);
    return {};
  }
};

/**
 * Obtiene el enlace de YouTube para un archivo específico
 * 
 * @param {string} filePath - Ruta del archivo
 * @returns {Object|null} Información del enlace o null si no existe
 */
export const getYoutubeLinkForFile = (filePath) => {
  try {
    const allLinks = getAllYoutubeLinks();
    return allLinks[filePath] || null;
  } catch (error) {
    console.error('Error al obtener enlace de YouTube para archivo:', error);
    return null;
  }
};

/**
 * Elimina el enlace de YouTube asociado a un archivo
 * 
 * @param {string} filePath - Ruta del archivo
 * @returns {boolean} true si se eliminó correctamente
 */
export const removeYoutubeLink = (filePath) => {
  try {
    const allLinks = getAllYoutubeLinks();
    
    if (allLinks[filePath]) {
      delete allLinks[filePath];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allLinks));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error al eliminar enlace de YouTube:', error);
    throw error;
  }
};