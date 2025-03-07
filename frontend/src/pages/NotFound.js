import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <h2 className="text-6xl font-extrabold text-primary-600 mb-6">404</h2>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h3>
          <p className="text-gray-600 mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/"
              className="btn-primary"
            >
              Voltar ao início
            </Link>
            <Link
              to="/app"
              className="btn-secondary"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;