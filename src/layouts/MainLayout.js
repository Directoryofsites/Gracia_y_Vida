import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <header>
        <h1>File Explorer</h1>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <p>&copy; 2025 File Explorer</p>
      </footer>
    </div>
  );
};

export default MainLayout;