import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <img
            className="mx-auto h-12 w-auto"
            src="/logo.svg"
            alt="Condos App"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Sistema de Gerenciamento de Condomínios
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
        
        <div className="mt-4 text-center text-sm text-white">
          <p>© {new Date().getFullYear()} Sistema de Gerenciamento de Condomínios</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;