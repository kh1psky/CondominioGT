import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const Inventario = () => {
  const { user } = useAuth();
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    search: '',
    categoria: '',
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

  // Buscar itens quando os filtros ou página mudarem
  useEffect(() => {
    const fetchItens = async () => {
      setLoading(true);
      try {
        const params = {
          page: paginacao.page,
          limit: paginacao.limit,
          search: filtros.search,
          categoria: filtros.categoria || undefined,
          condominio_id: filtros.condominio || undefined,
          status: filtros.status !== 'todos' ? filtros.status : undefined
        };

        const response = await api.get('/inventario', { params });
        
        if (response.data.success) {
          setItens(response.data.data);
          setPaginacao(prev => ({
            ...prev,
            total: response.data.meta.total,
            totalPages: response.data.meta.pages
          }));
        } else {
          toast.error(response.data.message || 'Falha ao carregar itens do inventário');
        }
      } catch (error) {
        console.error('Erro ao carregar itens do inventário:', error);
        toast.error('Erro ao carregar itens do inventário. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchItens();
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

  // Função para excluir um item
  const handleExcluirItem = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        const response = await api.delete(`/inventario/${id}`);
        
        if (response.data.success) {
          toast.success('Item excluído com sucesso');
          // Atualizar lista
          setItens(itens.filter(item => item.id !== id));
          setPaginacao(prev => ({
            ...prev,
            total: prev.total - 1
          }));
        } else {
          toast.error(response.data.message || 'Falha ao excluir item');
        }
      } catch (error) {
        console.error('Erro ao excluir item:', error);
        toast.error('Erro ao excluir item. Tente novamente mais tarde.');
      }
    }
  };

  // Função para obter a cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'disponivel':
        return 'bg-green-100 text-green-800';
      case 'em_uso':
        return 'bg-blue-100 text-blue-800';
      case 'manutencao':
        return 'bg-yellow-100 text-yellow-800';
      case 'danificado':
        return 'bg-red-100 text-red-800';
      case 'baixado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter o texto do status
  const getStatusText = (status) => {
    switch (status) {
      case 'disponivel':
        return 'Disponível';
      case 'em_uso':
        return 'Em Uso';
      case 'manutencao':
        return 'Em Manutenção';
      case 'danificado':
        return 'Danificado';
      case 'baixado':
        return 'Baixado';
      default:
        return status;
    }
  };

  // Componente de filtro
  const InventarioFilter = ({ filtros, onChange, condominios }) => {
    const [localFiltros, setLocalFiltros] = useState(filtros);
    const categorias = [
      'Móveis',
      'Eletrônicos',
      'Equipamentos',
      'Ferramentas',
      'Utensílios',
      'Decoração',
      'Segurança',
      'Limpeza',
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
        condominio: '',
        status: 'todos'
      };
      setLocalFiltros(resetFiltros);
      onChange(resetFiltros);
    };

    return (
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              id="search"
              name="search"
              className="form-input w-full"
              placeholder="Nome, código, descrição..."
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
              <option value="disponivel">Disponível</option>
              <option value="em_uso">Em Uso</option>
              <option value="manutencao">Em Manutenção</option>
              <option value="danificado">Danificado</option>
              <option value="baixado">Baixado</option>
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

  // Função para formatar valor monetário
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventário</h1>
        <Link to="/app/inventario/novo" className="btn-primary">
          Novo Item
        </Link>
      </div>

      {/* Filtros */}
      <InventarioFilter 
        filtros={filtros} 
        onChange={handleFilterChange} 
        condominios={condominios} 
      />

      {/* Lista de itens */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : itens.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Nenhum item encontrado no inventário.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itens.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{item.nome}</h3>
                    <p className="text-sm text-gray-600">{item.codigo || 'Sem código'}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                </div>
                
                <div className="mt-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Categoria:</span> {item.categoria}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Condomínio:</span> {item.condominio?.nome || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Valor:</span> {formatarMoeda(item.valor)}
                  </p>
                  {item.localizacao && (
                    <p className="text-sm">
                      <span className="font-medium">Localização:</span> {item.localizacao}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between">
                <Link 
                  to={`/app/inventario/${item.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Ver detalhes
                </Link>
                <div className="flex space-x-2">
                  <Link 
                    to={`/app/inventario/${item.id}/editar`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-800"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleExcluirItem(item.id)}
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
      {!loading && itens.length > 0 && paginacao.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(paginacao.page - 1)}
              disabled={paginacao.page === 1}
              className={`px-3 py-1 border rounded-md ${paginacao.page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
            >
              Anterior
            </button>
            
            {Array.from({ length: paginacao.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 border rounded-md ${paginacao.page === page ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(paginacao.page + 1)}
              disabled={paginacao.page === paginacao.totalPages}
              className={`px-3 py-1 border rounded-md ${paginacao.page === paginacao.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
            >
              Próxima
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Inventario;