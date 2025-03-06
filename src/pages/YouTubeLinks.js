import React from 'react';
import { FaYoutube } from 'react-icons/fa';

const YouTubeLink = ({ url, title }) => {
  // Función para extraer el ID del video de YouTube desde la URL
  const getYouTubeVideoId = (youtubeUrl) => {
    try {
      // Intentar extraer el ID del video desde diferentes formatos de URL de YouTube
      const urlObj = new URL(youtubeUrl);
      if (urlObj.hostname.includes('youtube.com')) {
        // Para URLs como https://www.youtube.com/watch?v=VIDEO_ID
        return urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        // Para URLs acortadas como https://youtu.be/VIDEO_ID
        return urlObj.pathname.substring(1);
      }
    } catch (error) {
      console.error('URL inválida:', error);
    }
    return null;
  };

  // Función para abrir el video en YouTube
  const openYouTubeVideo = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Extrae el ID del video para usarlo en la miniatura (opcional)
  const videoId = getYouTubeVideoId(url);

  return (
    <div className="youtube-link-container p-3 border rounded mb-2 flex items-center cursor-pointer hover:bg-gray-100" onClick={openYouTubeVideo}>
      <FaYoutube className="text-red-600 text-2xl mr-3" />
      <div className="flex-1">
        <p className="font-medium">{title || 'Video de YouTube'}</p>
        <p className="text-xs text-gray-500 truncate">{url}</p>
      </div>
    </div>
  );
};

export default YouTubeLink;