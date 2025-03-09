import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const Fornecedores = () => {
  const { user } = useAuth();
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    search: '',
    categoria: '',
    status: 'todos'
  });
  const [paginacao, setPaginacao] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Buscar fornecedores quando os filtros ou página mudarem
  useEffect(() => {
    const fetchFornecedores = async () => {
      setLoading(true);
      try {
        const params = {
          page: paginacao.page,
          limit: paginacao.limit,
          search: filtros.search,
          categoria: filtros.categoria || undefined,
          ativo: filtros.status === 'ativos' ? true : (filtros.status === 'inativos' ? false : undefined)
        };

        const response = await api.get('/fornecedores', { params });
        
        if (response.data.success) {
          setFornecedores(response.data.data);
          setPaginacao(prev => ({
            ...prev,
            total: response.data.meta.total,
            totalPages: response.data.meta.pages
          }));
        } else {
          toast.error(response.data.message || 'Falha ao carregar fornecedores');
        }
      } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
        toast.error('Erro ao carregar fornecedores. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchFornecedores();
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

  // Função para excluir um fornecedor
  const handleExcluirFornecedor = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        const response = await api.delete(`/fornecedores/${id}`);
        
        if (response.data.success) {
          toast.success('Fornecedor excluído com sucesso');
          // Atualizar lista
          setFornecedores(fornecedores.filter(f => f.id !== id));
          setPaginacao(prev => ({
            ...prev,
            total: prev.total - 1
          }));
        } else {
          toast.error(response.data.message || 'Falha ao excluir fornecedor');
        }
      } catch (error) {
        console.error('Erro ao excluir fornecedor:', error);
        toast.error('Erro ao excluir fornecedor. Tente novamente mais tarde.');
      }
    }
  };

  // Componente de filtro
  const FornecedoresFilter = ({ filtros, onChange }) => {
    const [localFiltros, setLocalFiltros] = useState(filtros);
    const categorias = [
      'Manutenção',
      'Limpeza',
      'Segurança',
      'Jardinagem',
      'Construção',
      'Elétrica',
      'Hidráulica',
      'Pintura',
      'Outros'
    ];

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
        categoria: '',
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
              placeholder="Nome, CNPJ, contato..."
              value={localFiltros.search}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              id="categoria"
              name="categoria"
              className="form-input w-full"
              value={localFiltros.categoria}
              onChange={handleChange}
            >
              <option value="">Todas as categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
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
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
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
        <h1 className="text-2xl font-bold text-gray-800">Fornecedores</h1>
        <Link to="/app/fornecedores/novo" className="btn-primary">
          Novo Fornecedor
        </Link>
      </div>

      {/* Filtros */}
      <FornecedoresFilter 
        filtros={filtros} 
        onChange={handleFilterChange} 
      />

      {/* Lista de fornecedores */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : fornecedores.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Nenhum fornecedor encontrado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ/CPF
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fornecedores.map(fornecedor => (
                  <tr key={fornecedor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {fornecedor.nome.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{fornecedor.nome}</div>
                          <div className="text-sm text-gray-500">{fornecedor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fornecedor.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fornecedor.telefone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fornecedor.documento}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${fornecedor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          to={`/app/fornecedores/${fornecedor.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver
                        </Link>
                        <Link 
                          to={`/app/fornecedores/${fornecedor.id}/editar`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleExcluirFornecedor(fornecedor.id)}
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
      {!loading && fornecedores.length > 0 && paginacao.totalPages > 1 && (
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