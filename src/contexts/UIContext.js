import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UIContext = createContext();

export const useUI = () => {
  return useContext(UIContext);
};

export const UIProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'type', 'size', 'date'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' o 'desc'
  const [configOpen, setConfigOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState({
    siteName: 'Explorador de Archivos',
    subtitle: 'Sistema de gestión documental',
    logo: null
  });

  // Cargar preferencias del usuario al iniciar
  useEffect(() => {
    // Modo oscuro
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else {
      // Verificar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }

    // Otras preferencias
    const savedSidebarOpen = localStorage.getItem('sidebarOpen');
    if (savedSidebarOpen) {
      setSidebarOpen(JSON.parse(savedSidebarOpen));
    }

    const savedSidebarWidth = localStorage.getItem('sidebarWidth');
    if (savedSidebarWidth) {
      setSidebarWidth(JSON.parse(savedSidebarWidth));
    }

    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }

    const savedSortBy = localStorage.getItem('sortBy');
    if (savedSortBy) {
      setSortBy(savedSortBy);
    }

    const savedSortDirection = localStorage.getItem('sortDirection');
    if (savedSortDirection) {
      setSortDirection(savedSortDirection);
    }

    const savedSiteConfig = localStorage.getItem('siteConfig');
    if (savedSiteConfig) {
      setSiteConfig(JSON.parse(savedSiteConfig));
    }
  }, []);

  // Aplicar modo oscuro al documento
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Guardar otras preferencias cuando cambien
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem('sidebarWidth', JSON.stringify(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('sortBy', sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem('sortDirection', sortDirection);
  }, [sortDirection]);

  useEffect(() => {
    localStorage.setItem('siteConfig', JSON.stringify(siteConfig));
  }, [siteConfig]);

  // Alternar modo oscuro
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  // Alternar barra lateral
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Cambiar ancho de la barra lateral
  const changeSidebarWidth = useCallback((width) => {
    setSidebarWidth(width);
  }, []);

  // Cambiar modo de vista
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  // Abrir vista previa
  const openPreview = useCallback((item) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  }, []);

  // Cerrar vista previa
  const closePreview = useCallback(() => {
    setPreviewOpen(false);
    setPreviewItem(null);
  }, []);

  // Cambiar orden
  const changeSortBy = useCallback((newSortBy) => {
    if (newSortBy === sortBy) {
      // Si es el mismo, cambiar dirección
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es diferente, establecer nuevo criterio y dirección ascendente
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
  }, [sortBy]);

  // Abrir configuración
  const openConfig = useCallback(() => {
    setConfigOpen(true);
  }, []);

  // Cerrar configuración
  const closeConfig = useCallback(() => {
    setConfigOpen(false);
  }, []);

  // Actualizar configuración del sitio
  const updateSiteConfig = useCallback((newConfig) => {
    setSiteConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  }, []);

  const value = {
    darkMode,
    toggleDarkMode,
    sidebarOpen,
    toggleSidebar,
    sidebarWidth,
    changeSidebarWidth,
    viewMode,
    toggleViewMode,
    previewOpen,
    previewItem,
    openPreview,
    closePreview,
    sortBy,
    sortDirection,
    changeSortBy,
    configOpen,
    openConfig,
    closeConfig,
    siteConfig,
    updateSiteConfig
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};