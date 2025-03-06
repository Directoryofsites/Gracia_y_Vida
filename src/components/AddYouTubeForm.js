import React, { useState } from 'react';

const AddYouTubeForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: ''
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error al editar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    
    if (!formData.url.trim()) {
      newErrors.url = 'La URL es obligatoria';
    } else {
      try {
        const url = new URL(formData.url);
        if (!url.hostname.includes('youtube.com') && !url.hostname.includes('youtu.be')) {
          newErrors.url = 'La URL debe ser de YouTube';
        }
      } catch (error) {
        newErrors.url = 'URL inválida';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Añadir Enlace de YouTube</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block mb-2 text-sm font-medium">
            Título
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Ingrese un título descriptivo"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="url" className="block mb-2 text-sm font-medium">
            URL de YouTube
          </label>
          <input
            type="text"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.url ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {errors.url && <p className="mt-1 text-xs text-red-500">{errors.url}</p>}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddYouTubeForm;