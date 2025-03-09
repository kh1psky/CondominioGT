import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../services/api';

const DetalhesUnidade = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [unidade, setUnidade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('detalhes');

  useEffect(() => {
    const fetchUnidade = async () => {
      try {
        const response = await api.get(`/unidades/${id}`);
        
        if (response.data.success) {
          setUnidade(response.data.data);
        } else {
          toast.error(response.data.message || 'Falha ao carregar dados da unidade');
          navigate('/app/unidades');
        }
      } catch (error) {
        console.error('Erro ao carregar unidade:', error);
        toast.error('Erro ao carregar dados da unidade. Tente novamente mais tarde.');
        navigate('/app/unidades');
      } finally {
        setLoading(false);
      }
    };

    fetchUnidade();
  }, [id, navigate]);

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

  // Função para excluir a unidade
  const handleExcluirMorador = async (moradorId) => {
    if (window.confirm('Tem certeza que deseja remover este morador?')) {
      try {
        const response = await api.delete(`/unidades/${id}/moradores/${moradorId}`);
        
        if (response.data.success) {
          toast.success('Morador removido com sucesso');
          // Atualizar a lista de moradores
          setUnidade(prev => ({
            ...prev,
            moradores: prev.moradores.filter(m => m.id !== moradorId)
          }));
        } else {
          toast.error(response.data.message || 'Falha ao remover morador');
        }
      } catch (error) {
        console.error('Erro ao remover morador:', error);
        toast.error('Erro ao remover morador. Tente novamente mais tarde.');
      }
    }
  };

  const handleExcluir = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade?')) {
      try {
        const response = await api.delete(`/unidades/${id}`);
        
        if (response.data.success) {
          toast.success('Unidade excluída com sucesso');
          navigate('/app/unidades');
        } else {
          toast.error(response.data.message || 'Falha ao excluir unidade');
        }
      } catch (error) {
        console.error('Erro ao excluir unidade:', error);
        toast.error('Erro ao excluir unidade. Tente novamente mais tarde.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!unidade) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Unidade não encontrada.</p>
          <Link to="/app/unidades" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Voltar para lista de unidades
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {unidade.bloco ? `Bloco ${unidade.bloco} - ` : ''}Unidade {unidade.numero}
            </h1>
            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(unidade.status)}`}>
              {getStatusText(unidade.status)}
            </span>
          </div>
          <p className="text-gray-600 mt-1">{unidade.condominio?.nome || 'Condomínio não especificado'}</p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Link 
            to={`/app/unidades/${unidade.id}/editar`}
            className="btn-secondary"
          >
            Editar
          </Link>
          <button
            onClick={handleExcluir}
            className="btn-danger"
          >
            Excluir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('detalhes')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'detalhes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Detalhes
            </button>
            <button
              onClick={() => setActiveTab('moradores')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'moradores' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Moradores
            </button>
            <button
              onClick={() => setActiveTab('financeiro')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'financeiro' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Financeiro
            </button>
            <button
              onClick={() => setActiveTab('documentos')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'documentos' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Documentos
            </button>
          </nav>
        </div>

        {/* Conteúdo da Tab */}
        <div className="p-6">
          {activeTab === 'detalhes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Unidade</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Número</p>
                    <p className="mt-1">{unidade.numero}</p>
                  </div>
                  {unidade.bloco && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bloco</p>
                      <p className="mt-1">{unidade.bloco}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Área Total</p>
                    <p className="mt-1">{unidade.area_total} m²</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quartos</p>
                    <p className="mt-1">{unidade.quartos || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Banheiros</p>
                    <p className="mt-1">{unidade.banheiros || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vagas de Garagem</p>
                    <p className="mt-1">{unidade.vagas_garagem || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1">{getStatusText(unidade.status)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Adicionais</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Registro</p>
                    <p className="mt-1">{formatarData(unidade.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Última Atualização</p>
                    <p className="mt-1">{formatarData(unidade.updatedAt)}</p>
                  </div>
                  {unidade.observacoes && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Observações</p>
                      <p className="mt-1">{unidade.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'moradores' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Proprietário e Moradores</h3>
                <Link 
                  to={`/app/unidades/${unidade.id}/moradores/adicionar`}
                  className="btn-primary-sm"
                >
                  Adicionar Morador
                </Link>
              </div>
              
              {/* Proprietário */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Proprietário</h4>
                {unidade.proprietario ? (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {unidade.proprietario.nome.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h5 className="text-sm font-medium text-gray-900">{unidade.proprietario.nome}</h5>
                      <p className="text-sm text-gray-500">{unidade.proprietario.email}</p>
                      <p className="text-sm text-gray-500">{unidade.proprietario.telefone}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum proprietário registrado</p>
                )}
              </div>
              
              {/* Moradores */}
              <h4 className="text-md font-medium text-gray-800 mb-3">Moradores</h4>
              {unidade.moradores && unidade.moradores.length > 0 ? (
                <div className="space-y-4">
                  {unidade.moradores.map(morador => (
                    <div key={morador.id} className="bg-white border border-gray-200 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {morador.nome.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <h5 className="text-sm font-medium text-gray-900">{morador.nome}</h5>
                            <p className="text-sm text-gray-500">{morador.email}</p>
                            <p className="text-sm text-gray-500">{morador.telefone}</p>
                            {morador.tipo && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                {morador.tipo}
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleExcluirMorador(morador.id)}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum morador registrado</p>
              )}
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Informações Financeiras</h3>
                <Link 
                  to={`/app/unidades/${unidade.id}/financeiro/novo`}
                  className="btn-primary-sm"
                >
                  Novo Lançamento
                </Link>
              </div>
              
              {/* Resumo Financeiro */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Total Recebido</p>
                  <p className="text-2xl font-semibold text-green-600">{formatarMoeda(unidade.total_recebido || 0)}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-red-800">Total em Aberto</p>
                  <p className="text-2xl font-semibold text-red-600">{formatarMoeda(unidade.total_aberto || 0)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Próximo Vencimento</p>
                  <p className="text-2xl font-semibold text-blue-600">{formatarData(unidade.proximo_vencimento)}</p>
                </div>
              </div>

              {/* Lista de Lançamentos */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <p className="p-4 text-gray-500 text-center">Funcionalidade em desenvolvimento</p>
              </div>
            </div>
          )}

          {activeTab === 'documentos' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Documentos da Unidade</h3>
                <Link 
                  to={`/app/unidades/${unidade.id}/documentos/novo`}
                  className="btn-primary-sm"
                >
                  Novo Documento
                </Link>
              </div>
              
              {/* Lista de Documentos */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <p className="p-4 text-gray-500 text-center">Funcionalidade em desenvolvimento</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalhesUnidade;