import React from 'react';

const FileViewer = ({ file, onClose }) => {
  // Determinar qué tipo de contenido mostrar basado en el tipo de archivo
  const renderContent = () => {
    if (!file) return null;
    
    switch (file.type) {
      case 'image':
        return (
          <div className="flex justify-center">
            <img 
              src={file.url || 'https://via.placeholder.com/800x600?text=Imagen+de+Ejemplo'} 
              alt={file.name} 
              className="max-h-full max-w-full object-contain" 
            />
          </div>
        );
        
      case 'pdf':
        return (
          <div className="bg-gray-200 p-8 text-center">
            <p className="text-xl mb-4">Vista previa de PDF</p>
            <p>Para este ejemplo, simulamos la vista previa de un PDF: {file.name}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => window.open(file.url || '#', '_blank')}
            >
              Ver PDF completo
            </button>
          </div>
        );
        
      case 'document':
        return (
          <div className="bg-gray-200 p-8 text-center">
            <p className="text-xl mb-4">Vista previa de Documento</p>
            <p>Para este ejemplo, simulamos la vista previa de un documento: {file.name}</p>
            <div className="mt-4 p-6 bg-white text-left max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold mb-4">Documento de Ejemplo</h1>
              <p className="mb-2">Este es un contenido de ejemplo para simular la vista previa de un documento.</p>
              <p>El documento real se podría cargar e integrar utilizando APIs específicas.</p>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="bg-gray-200 p-8 text-center">
            <p className="text-xl mb-4">Vista previa no disponible</p>
            <p>No se puede mostrar una vista previa para este tipo de archivo: {file.name}</p>
            <p className="mt-2">Tipo: {file.type}</p>
          </div>
        );
    }
  };
  
  if (!file) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
          <h3 className="font-medium">{file.name}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Contenido */}
        <div className="flex-grow overflow-auto p-4">
          {renderContent()}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-100 px-4 py-3 flex justify-between">
          <div>
            <span className="text-sm text-gray-500">Tipo: </span>
            <span className="text-sm font-medium capitalize">{file.type}</span>
            {file.size && (
              <>
                <span className="text-sm text-gray-500 ml-4">Tamaño: </span>
                <span className="text-sm font-medium">{file.size}</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;