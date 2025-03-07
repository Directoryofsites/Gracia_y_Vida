import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <h2>Authentication</h2>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;