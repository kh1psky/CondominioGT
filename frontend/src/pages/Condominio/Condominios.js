import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import condominioService from '../../services/condominioService';
import { useAuth } from '../../hooks/useAuth';

// Componentes
import CondominioCard from './components/CondominioCard';
import CondominioFilter from './components/CondominioFilter';

const Condominios = () => {
  const { user } = useAuth();
  const [condominios, setCondominios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    search: '',
    estado: '',
    status: 'todos'
  });
  const [paginacao, setPaginacao] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0
  });

  // Buscar condomínios quando os filtros ou página mudarem
  useEffect(() => {
    const fetchCondominios = async () => {
      setLoading(true);
      try {
        const params = {
          page: paginacao.page,
          limit: paginacao.limit,
          search: filtros.search,
          estado: filtros.estado,
          ativo: filtros.status === 'ativos' ? true : (filtros.status === 'inativos' ? false : undefined)
        };

        const result = await condominioService.listarCondominios(params);
        
        if (result.success) {
          setCondominios(result.data.data);
          setPaginacao(prev => ({
            ...prev,
            total: result.data.meta.total,
            totalPages: result.data.meta.pages
          }));
        } else {
          toast.error(result.message || 'Falha ao carregar condomínios');
        }
      } catch (error) {
        console.error('Erro ao carregar condomínios:', error);
        toast.error('Erro ao carregar condomínios. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchCondominios();
  }, [filtros, paginacao.page, paginacao.limit]);

  // Função para mudar a página
  const handlePageChange = (newPage) => {
    setPaginacao(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Função para mudar os filtros
  const handleFilterChange = (novosFiltros) => {
    setFiltros(novosFiltros);
    setPaginacao(prev => ({
      ...prev,
      page: 1 // Voltar para primeira página quando mudar filtros
    }));
  };

  // Função para excluir um condomínio
  const handleExcluirCondominio = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este condomínio?')) {
      try {
        const result = await condominioService.excluirCondominio(id);
        
        if (result.success) {
          toast.success('Condomínio excluído com sucesso');
          // Atualizar lista
          setCondominios(condominios.filter(c => c.id !== id));
          setPaginacao(prev => ({
            ...prev,
            total: prev.total - 1
          }));
        } else {
          toast.error(result.message || 'Falha ao excluir condomínio');
        }
      } catch (error) {
        console.error('Erro ao excluir condomínio:', error);
        toast.error('Erro ao excluir condomínio. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Condomínios</h1>
        <Link to="/app/condominios/novo" className="btn-primary">
          Adicionar Condomínio
        </Link>
      </div>

      {/* Filtros */}
      <CondominioFilter 
        filtros={filtros} 
        onChange={handleFilterChange} 
      />

      {/* Lista de Condomínios */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : condominios.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="mt-2 text-base font-medium text-gray-900">
            Nenhum condomínio encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filtros.search || filtros.estado || filtros.status !== 'todos'
              ? 'Tente ajustar os filtros para encontrar o que procura.'
              : 'Comece adicionando seu primeiro condomínio.'}
          </p>
          {!filtros.search && !filtros.estado && filtros.status === 'todos' && (
            <div className="mt-6">
              <Link to="/app/condominios/novo" className="btn-primary">
                Adicionar Condomínio
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {condominios.map(condominio => (
              <CondominioCard
                key={condominio.id}
                condominio={condominio}
                onExcluir={user?.perfil === 'admin' ? () => handleExcluirCondominio(condominio.id) : null}
              />
            ))}
          </div>

          {/* Paginação */}
          {paginacao.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(1, paginacao.page - 1))}
                  disabled={paginacao.page === 1}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                    paginacao.page === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(paginacao.totalPages, paginacao.page + 1))}
                  disabled={paginacao.page === paginacao.totalPages}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                    paginacao.page === paginacao.totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Próxima
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{(paginacao.page - 1) * paginacao.limit + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(paginacao.page * paginacao.limit, paginacao.total)}
                    </span>{' '}
                    de <span className="font-medium">{paginacao.total}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(Math.max(1, paginacao.page - 1))}
                      disabled={paginacao.page === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                        paginacao.page === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:bg-gray-50'
                      } ring-1 ring-inset ring-gray-300 focus:outline-offset-0`}
                    >
                      <span className="sr-only">Anterior</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {[...Array(paginacao.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          paginacao.page === i + 1
                            ? 'z-10 bg-primary-50 text-primary-600 focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(Math.min(paginacao.totalPages, paginacao.page + 1))}
                      disabled={paginacao.page === paginacao.totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                        paginacao.page === paginacao.totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:bg-gray-50'
                      } ring-1 ring-inset ring-gray-300 focus:outline-offset-0`}
                    >
                      <span className="sr-only">Próxima</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Condominios;