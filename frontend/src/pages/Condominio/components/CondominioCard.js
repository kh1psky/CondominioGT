import React from 'react';
import { Link } from 'react-router-dom';

const CondominioCard = ({ condominio, onExcluir }) => {
  // Formatar endereço completo
  const formatarEndereco = () => {
    const partes = [
      condominio.endereco,
      condominio.numero,
      condominio.bairro,
      `${condominio.cidade}/${condominio.estado}`,
      condominio.cep
    ].filter(Boolean);
    
    return partes.join(', ');
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border ${condominio.ativo ? 'border-gray-200' : 'border-gray-300 bg-gray-50'}`}>
      {/* Cabeçalho */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {condominio.nome}
          </h3>
          {!condominio.ativo && (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
              Inativo
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          CNPJ: {condominio.cnpj}
        </p>
      </div>

      {/* Corpo */}
      <div className="p-5">
        <div className="mb-4">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-2 text-sm text-gray-500 leading-tight">
              {formatarEndereco()}
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <div>
            <p className="text-xs text-gray-500">Unidades</p>
            <p className="text-sm font-medium">{condominio.total_unidades || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Síndico</p>
            <p className="text-sm font-medium">
              {condominio.sindico?.nome || 'Não definido'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Área</p>
            <p className="text-sm font-medium">
              {condominio.area_total ? `${condominio.area_total} m²` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Informações de contato */}
        <div className="mt-4 grid grid-cols-1 gap-2">
          {condominio.telefone && (
            <div className="flex items-center">
              <svg
                className="h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
                />
              </svg>
              <span className="ml-2 text-sm text-gray-500">
                {condominio.telefone}
              </span>
            </div>
          )}
          {condominio.email && (
            <div className="flex items-center">
              <svg
                className="h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                />
                <path
                  d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
                />
              </svg>
              <span className="ml-2 text-sm text-gray-500 truncate max-w-[200px]">
                {condominio.email}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Rodapé com ações */}
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between">
        <Link
          to={`/app/condominios/${condominio.id}`}
          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
        >
          Ver detalhes
        </Link>
        <div className="flex space-x-4">
          <Link
            to={`/app/condominios/${condominio.id}/editar`}
            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
          >
            Editar
          </Link>
          {onExcluir && (
            <button
              onClick={onExcluir}
              className="text-danger-600 hover:text-danger-900 text-sm font-medium"
            >
              Excluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CondominioCard;