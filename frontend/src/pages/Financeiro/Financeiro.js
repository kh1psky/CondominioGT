import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

// Componentes
import FinanceiroFilter from './components/FinanceiroFilter';

const Financeiro = () => {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    search: '',
    tipo: 'todos',
    dataInicio: '',
    dataFim: '',
    condominio: ''
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

  // Buscar transações quando os filtros ou página mudarem
  useEffect(() => {
    const fetchTransacoes = async () => {
      setLoading(true);
      try {
        const params = {
          page: paginacao.page,
          limit: paginacao.limit,
          search: filtros.search,
          tipo: filtros.tipo !== 'todos' ? filtros.tipo : undefined,
          data_inicio: filtros.dataInicio || undefined,
          data_fim: filtros.dataFim || undefined,
          condominio_id: filtros.condominio || undefined
        };

        const response = await api.get('/financeiro/transacoes', { params });
        
        if (response.data.success) {
          setTransacoes(response.data.data);
          setPaginacao(prev => ({
            ...prev,
            total: response.data.meta.total,
            totalPages: response.data.meta.pages
          }));
        } else {
          toast.error(response.data.message || 'Falha ao carregar transações');
        }
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        toast.error('Erro ao carregar transações. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransacoes();
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

  // Função para excluir uma transação
  const handleExcluirTransacao = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        const response = await api.delete(`/financeiro/transacoes/${id}`);
        
        if (response.data.success) {
          toast.success('Transação excluída com sucesso');
          // Atualizar lista
          setTransacoes(transacoes.filter(t => t.id !== id));
          setPaginacao(prev => ({
            ...prev,
            total: prev.total - 1
          }));
        } else {
          toast.error(response.data.message || 'Falha ao excluir transação');
        }
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
        toast.error('Erro ao excluir transação. Tente novamente mais tarde.');
      }
    }
  };

  // Função para formatar data
  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Função para formatar valor monetário
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  // Função para obter a cor do tipo de transação
  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'receita':
        return 'bg-green-100 text-green-800';
      case 'despesa':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter o texto do tipo de transação
  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'receita':
        return 'Receita';
      case 'despesa':
        return 'Despesa';
      default:
        return tipo;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
        <div className="flex space-x-2">
          <Link to="/app/financeiro/relatorios" className="btn-secondary">
            Relatórios
          </Link>
          <Link to="/app/financeiro/nova-transacao" className="btn-primary">
            Nova Transação
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <FinanceiroFilter 
        filtros={filtros} 
        onChange={handleFilterChange} 
        condominios={condominios} 
      />

      {/* Resumo financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Receitas (período)</h3>
          <p className="text-2xl font-semibold text-green-600">
            {formatarMoeda(transacoes.reduce((acc, t) => t.tipo === 'receita' ? acc + t.valor : acc, 0))}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Despesas (período)</h3>
          <p className="text-2xl font-semibold text-red-600">
            {formatarMoeda(transacoes.reduce((acc, t) => t.tipo === 'despesa' ? acc + t.valor : acc, 0))}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Saldo (período)</h3>
          <p className="text-2xl font-semibold text-blue-600">
            {formatarMoeda(
              transacoes.reduce((acc, t) => {
                if (t.tipo === 'receita') return acc + t.valor;
                if (t.tipo === 'despesa') return acc - t.valor;
                return acc;
              }, 0)
            )}
          </p>
        </div>
      </div>

      {/* Lista de transações */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : transacoes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Nenhuma transação encontrada.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condomínio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transacoes.map(transacao => (
                  <tr key={transacao.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(transacao.data)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transacao.descricao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(transacao.tipo)}`}>
                        {getTipoText(transacao.tipo)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transacao.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transacao.condominio?.nome || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                        {formatarMoeda(transacao.valor)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          to={`/app/financeiro/transacoes/${transacao.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver
                        </Link>
                        <Link 
                          to={`/app/financeiro/transacoes/${transacao.id}/editar`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleExcluirTransacao(transacao.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginação */}
      {!loading && transacoes.length > 0 && paginacao.totalPages > 1 && (
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

export default Financeiro;