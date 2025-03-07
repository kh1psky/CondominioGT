import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:flex md:items-center md:justify-between text-sm text-gray-500">
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="#" className="hover:text-gray-900">
            Suporte
          </a>
          <a href="#" className="hover:text-gray-900">
            Termos de Uso
          </a>
          <a href="#" className="hover:text-gray-900">
            Privacidade
          </a>
        </div>
        <div className="mt-2 md:mt-0 md:order-1 text-center md:text-left">
          &copy; {currentYear} Sistema de Gerenciamento de Condomínios. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;