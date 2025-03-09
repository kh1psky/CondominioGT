import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const Unidades = () => {
  const { user } = useAuth();
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    search: '',
    condominio: '',
    status: 'todos'
  });
  const [condominios, setCondominios] = useState([]);
  const [paginacao, setPaginacao] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Buscar condominios para o filtro
  useEffect(() => {
    const fetchCondominios = async () => {
      try {
        const response = await api.get('/condominios', {
          params: { limit: 100 } // Buscar todos para o filtro
        });
        
        if (response.data.success) {
          setCondominios(response.data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar condominios:', error);
      }
    };

    fetchCondominios();
  }, []);

  // Buscar unidades quando os filtros ou página mudarem
  useEffect(() => {
    const fetchUnidades = async () => {
      setLoading(true);
      try {
        const params = {
          page: paginacao.page,
          limit: paginacao.limit,
          search: filtros.search,
          condominio_id: filtros.condominio || undefined,
          status: filtros.status !== 'todos' ? filtros.status : undefined
        };

        const response = await api.get('/unidades', { params });
        
        if (response.data.success) {
          setUnidades(response.data.data);
          setPaginacao(prev => ({
            ...prev,
            total: response.data.meta.total,
            totalPages: response.data.meta.pages
          }));
        } else {
          toast.error(response.data.message || 'Falha ao carregar unidades');
        }
      } catch (error) {
        console.error('Erro ao carregar unidades:', error);
        toast.error('Erro ao carregar unidades. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchUnidades();
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

  // Função para excluir uma unidade
  const handleExcluirUnidade = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade?')) {
      try {
        const response = await api.delete(`/unidades/${id}`);
        
        if (response.data.success) {
          toast.success('Unidade excluída com sucesso');
          // Atualizar lista
          setUnidades(unidades.filter(u => u.id !== id));
          setPaginacao(prev => ({
            ...prev,
            total: prev.total - 1
          }));
        } else {
          toast.error(response.data.message || 'Falha ao excluir unidade');
        }
      } catch (error) {
        console.error('Erro ao excluir unidade:', error);
        toast.error('Erro ao excluir unidade. Tente novamente mais tarde.');
      }
    }
  };

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

  // Componente de filtro
  const UnidadesFilter = ({ filtros, onChange, condominios }) => {
    const [localFiltros, setLocalFiltros] = useState(filtros);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setLocalFiltros(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onChange(localFiltros);
    };

    const handleReset = () => {
      const resetFiltros = {
        search: '',
        condominio: '',
        status: 'todos'
      };
      setLocalFiltros(resetFiltros);
      onChange(resetFiltros);
    };

    return (
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              id="search"
              name="search"
              className="form-input w-full"
              placeholder="Número, bloco..."
              value={localFiltros.search}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="condominio" className="block text-sm font-medium text-gray-700 mb-1">Condomínio</label>
            <select
              id="condominio"
              name="condominio"
              className="form-input w-full"
              value={localFiltros.condominio}
              onChange={handleChange}
            >
              <option value="">Todos os condomínios</option>
              {condominios.map(cond => (
                <option key={cond.id} value={cond.id}>{cond.nome}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              name="status"
              className="form-input w-full"
              value={localFiltros.status}
              onChange={handleChange}
            >
              <option value="todos">Todos os status</option>
              <option value="ocupado">Ocupado</option>
              <option value="vago">Vago</option>
              <option value="em_reforma">Em Reforma</option>
              <option value="indisponivel">Indisponível</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end mt-4 space-x-2">
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary"
          >
            Limpar
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            Filtrar
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Unidades</h1>
        <Link to="/app/unidades/nova" className="btn-primary">
          Nova Unidade
        </Link>
      </div>

      {/* Filtros */}
      <UnidadesFilter 
        filtros={filtros} 
        onChange={handleFilterChange} 
        condominios={condominios} 
      />

      {/* Lista de unidades */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : unidades.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Nenhuma unidade encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unidades.map(unidade => (
            <div key={unidade.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {unidade.bloco ? `Bloco ${unidade.bloco} - ` : ''}Unidade {unidade.numero}
                    </h3>
                    <p className="text-sm text-gray-600">{unidade.condominio?.nome || 'Condomínio não especificado'}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(unidade.status)}`}>
                    {getStatusText(unidade.status)}
                  </span>
                </div>
                
                <div className="mt-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Área:</span> {unidade.area_total} m²
                  </p>
                  {unidade.proprietario && (
                    <p className="text-sm">
                      <span className="font-medium">Proprietário:</span> {unidade.proprietario.nome}
                    </p>
                  )}
                  {unidade.morador && (
                    <p className="text-sm">
                      <span className="font-medium">Morador:</span> {unidade.morador.nome}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between">
                <Link 
                  to={`/app/unidades/${unidade.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Ver detalhes
                </Link>
                <div className="flex space-x-2">
                  <Link 
                    to={`/app/unidades/${unidade.id}/editar`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-800"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleExcluirUnidade(unidade.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {!loading && unidades.length > 0 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(paginacao.page - 1)}
              disabled={paginacao.page === 1}
              className={`px-3 py-1 rounded ${paginacao.page === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Anterior
            </button>
            
            {[...Array(paginacao.totalPages).keys()].map(num => (
              <button
                key={num + 1}
                onClick={() => handlePageChange(num + 1)}
                className={`px-3 py-1 rounded ${paginacao.page === num + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {num + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(paginacao.page + 1)}
              disabled={paginacao.page === paginacao.totalPages}
              className={`px-3 py-1 rounded ${paginacao.page === paginacao.totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Próxima
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Unidades;