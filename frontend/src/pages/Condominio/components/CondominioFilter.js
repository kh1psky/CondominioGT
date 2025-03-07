import React, { useState } from 'react';

// Lista de estados brasileiros
const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const CondominioFilter = ({ filtros, onChange }) => {
  const [localFiltros, setLocalFiltros] = useState(filtros);
  const [isExpanded, setIsExpanded] = useState(false);

  // Handler para atualizar localmente os filtros
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler para aplicar os filtros
  const handleSubmit = (e) => {
    e.preventDefault();
    onChange(localFiltros);
  };

  // Handler para limpar todos os filtros
  const handleClear = () => {
    const clearedFiltros = {
      search: '',
      estado: '',
      status: 'todos'
    };
    setLocalFiltros(clearedFiltros);
    onChange(clearedFiltros);
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Filtros
          </h3>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-600 hover:text-primary-900 text-sm"
          >
            {isExpanded ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Busca Simples - Sempre visível */}
          <div className="mt-2 max-w-xl flex flex-col sm:flex-row sm:space-x-4">
            <div className="flex-1 mb-2 sm:mb-0">
              <label htmlFor="search" className="sr-only">
                Buscar condomínio
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={localFiltros.search}
                  onChange={handleChange}
                  className="form-input pl-10"
                  placeholder="Buscar por nome, CNPJ ou cidade"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="btn-primary"
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="btn-secondary"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Filtros Expandidos */}
          {isExpanded && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="estado" className="form-label">
                  Estado
                </label>
                <select
                  id="estado"
                  name="estado"
                  value={localFiltros.estado}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Todos os estados</option>
                  {estados.map(estado => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={localFiltros.status}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="todos">Todos</option>
                  <option value="ativos">Ativos</option>
                  <option value="inativos">Inativos</option>
                </select>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CondominioFilter;