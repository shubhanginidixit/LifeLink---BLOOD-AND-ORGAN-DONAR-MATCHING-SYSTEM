import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-navy relative flex items-center justify-center overflow-hidden">
      {/* Animated Orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      
      <div className="z-10 w-full max-w-md p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
