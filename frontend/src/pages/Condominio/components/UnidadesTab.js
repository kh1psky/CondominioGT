import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const UnidadesTab = ({ condominioId, unidades = [] }) => {
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');

  // Filtrar unidades
  const unidadesFiltradas = unidades.filter(unidade => {
    const matchTexto = unidade.numero.toLowerCase().includes(filtro.toLowerCase()) ||
      (unidade.bloco && unidade.bloco.toLowerCase().includes(filtro.toLowerCase()));
    
    const matchStatus = statusFiltro === 'todos' || 
      (statusFiltro === 'ocupado' && unidade.status === 'ocupado') ||
      (statusFiltro === 'vago' && unidade.status === 'vago') ||
      (statusFiltro === 'reforma' && unidade.status === 'em_reforma');

    return matchTexto && matchStatus;
  });

  // Função para obter a cor de status
  const getStatusColor = (status) => {
    switch (status) {
      case 'ocupado':
        return 'bg-green-100 text-green-800';
      case 'vago':
        return 'bg-yellow-100 text-yellow-800';
      case 'em_reforma':
        return 'bg-orange-100 text-orange-800';
      case 'indisponivel':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter o texto do status
  const getStatusText = (status) => {
    switch (status) {
      case 'ocupado':
        return 'Ocupado';
      case 'vago':
        return 'Vago';
      case 'em_reforma':
        return 'Em Reforma';
      case 'indisponivel':
        return 'Indisponível';
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title">Unidades do Condomínio</h2>
        <Link 
          to={`/app/condominios/${condominioId}/unidades/nova`}
          className="btn-primary"
        >
          Adicionar Unidade
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0 md:space-x-4 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            className="form-input pl-10"
            placeholder="Buscar por número ou bloco..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="w-full md:w-auto">
          <select
            className="form-input"
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
          >
            <option value="todos">Todos os status</option>
            <option value="ocupado">Ocupados</option>
            <option value="vago">Vagos</option>
            <option value="reforma">Em Reforma</option>
          </select>
        </div>
      </div>

      {/* Lista de Unidades */}
      {unidadesFiltradas.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhuma unidade encontrada
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filtro || statusFiltro !== 'todos'
              ? 'Tente ajustar os filtros para encontrar o que procura.'
              : 'Comece adicionando sua primeira unidade.'}
          </p>
          {!filtro && statusFiltro === 'todos' && (
            <div className="mt-6">
              <Link 
                to={`/app/condominios/${condominioId}/unidades/nova`}
                className="btn-primary"
              >
                Adicionar Unidade
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Bloco/Número
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tipo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Área
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Morador
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {unidadesFiltradas.map((unidade) => (
                <tr key={unidade.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {unidade.bloco && `${unidade.bloco} - `}{unidade.numero}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">
                      {unidade.tipo?.replace('_', ' ') || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {unidade.area ? `${unidade.area} m²` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(unidade.status)}`}>
                      {getStatusText(unidade.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {unidade.morador?.nome || 'Sem morador'}
                    </div>
                    {unidade.morador && (
                      <div className="text-xs text-gray-500">{unidade.morador.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/app/condominios/${condominioId}/unidades/${unidade.id}`}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Detalhes
                    </Link>
                    <Link
                      to={`/app/condominios/${condominioId}/unidades/${unidade.id}/editar`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UnidadesTab;