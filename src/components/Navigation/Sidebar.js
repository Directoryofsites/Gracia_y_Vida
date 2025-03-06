import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUser, 
  FaCog, 
  FaSignOutAlt, 
  FaChartBar, 
  FaCalendarAlt, 
  FaTasks, 
  FaFolder
} from 'react-icons/fa';
import './Sidebar.css';
import logo from '../../assets/images/logo.png';

const Sidebar = ({ isExpanded, toggleSidebar }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: <FaHome />,
      label: 'Dashboard',
    },
    {
      path: '/dashboard/analytics',
      icon: <FaChartBar />,
      label: 'Analíticas',
    },
    {
      path: '/dashboard/calendar',
      icon: <FaCalendarAlt />,
      label: 'Calendario',
    },
    {
      path: '/dashboard/tasks',
      icon: <FaTasks />,
      label: 'Tareas',
    },
    {
      path: '/dashboard/file-explorer',
      icon: <FaFolder />,
      label: 'Archivos',
    },
    {
      path: '/dashboard/profile',
      icon: <FaUser />,
      label: 'Perfil',
    },
    {
      path: '/dashboard/settings',
      icon: <FaCog />,
      label: 'Configuración',
    },
  ];

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
          {isExpanded && <span className="app-name">Admin Panel</span>}
        </div>
        <button className="toggle-button" onClick={toggleSidebar}>
          {isExpanded ? '←' : '→'}
        </button>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <div className="menu-icon">{item.icon}</div>
            {isExpanded && <span className="menu-label">{item.label}</span>}
          </Link>
        ))}
      </div>

      <div className="sidebar-footer">
        <Link to="/login" className="menu-item logout">
          <div className="menu-icon">
            <FaSignOutAlt />
          </div>
          {isExpanded && <span className="menu-label">Cerrar Sesión