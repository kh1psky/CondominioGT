import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import condominioService from '../../services/condominioService';
import { useAuth } from '../../hooks/useAuth';

// Componentes
import TabsCondominio from './components/TabsCondominio';
import DetalhesBasicos from './components/DetalhesBasicos';
import UnidadesTab from './components/UnidadesTab';
import FinanceiroTab from './components/FinanceiroTab';
import DocumentosTab from './components/DocumentosTab';

const DetalhesCondominio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [condominio, setCondominio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('detalhes');
  const [estatisticas, setEstatisticas] = useState({
    totalUnidades: 0,
    unidadesOcupadas: 0,
    unidadesVagas: 0,
    taxaOcupacao: 0
  });

  // Buscar dados do condomínio
  useEffect(() => {
    const fetchCondominio = async () => {
      setLoading(true);
      try {
        const result = await condominioService.obterCondominio(id);
        
        if (result.success) {
          setCondominio(result.data.data);
        } else {
          toast.error(result.message || 'Falha ao carregar dados do condomínio');
          navigate('/app/condominios');
        }
      } catch (error) {
        console.error('Erro ao carregar condomínio:', error);
        toast.error('Erro ao carregar dados do condomínio. Tente novamente mais tarde.');
        navigate('/app/condominios');
      } finally {
        setLoading(false);
      }
    };

    // Buscar estatísticas do condomínio
    const fetchEstatisticas = async () => {
      try {
        const result = await condominioService.obterEstatisticas(id);
        
        if (result.success) {
          setEstatisticas(result.data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };

    fetchCondominio();
    fetchEstatisticas();
  }, [id, navigate]);

  // Verificar permissão de edição (admin ou síndico do condomínio)
  const podeEditar = () => {
    if (!user || !condominio) return false;
    return user.perfil === 'admin' || condominio.sindico_id === user.id;
  };

  // Handler para alternar status (ativo/inativo)
  const handleToggleStatus = async () => {
    if (!podeEditar()) return;

    try {
      const result = await condominioService.atualizarCondominio(id, {
        ativo: !condominio.ativo
      });
      
      if (result.success) {
        setCondominio(prev => ({
          ...prev,
          ativo: !prev.ativo
        }));
        toast.success(`Condomínio ${condominio.ativo ? 'desativado' : 'ativado'} com sucesso!`);
      } else {
        toast.error(result.message || 'Falha ao atualizar status do condomínio');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do condomínio. Tente novamente mais tarde.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Cabeçalho com ações */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center">
            <h1 className="page-title mr-3">{condominio.nome}</h1>
            {!condominio.ativo && (
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                Inativo
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            CNPJ: {condominio.cnpj} | {condominio.cidade}/{condominio.estado}
          </p>
        </div>
        <div className="flex space-x-2">
          {podeEditar() && (
            <>
              <button
                onClick={handleToggleStatus}
                className={`${
                  condominio.ativo ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                } px-3 py-2 rounded-md text-sm font-medium`}
              >
                {condominio.ativo ? 'Desativar' : 'Ativar'}
              </button>
              <Link
                to={`/app/condominios/${id}/editar`}
                className="btn-secondary"
              >
                Editar
              </Link>
            </>
          )}
          <Link
            to="/app/condominios"
            className="btn-primary"
          >
            Voltar
          </Link>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col">
          <span className="text-sm text-gray-500">Total de Unidades</span>
          <span className="text-2xl font-semibold">{estatisticas.totalUnidades}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col">
          <span className="text-sm text-gray-500">Unidades Ocupadas</span>
          <span className="text-2xl font-semibold">{estatisticas.unidadesOcupadas}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col">
          <span className="text-sm text-gray-500">Unidades Vagas</span>
          <span className="text-2xl font-semibold">{estatisticas.unidadesVagas}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col">
          <span className="text-sm text-gray-500">Taxa de Ocupação</span>
          <span className="text-2xl font-semibold">{estatisticas.taxaOcupacao}%</span>
        </div>
      </div>

      {/* Tabs */}
      <TabsCondominio activeTab={activeTab} onChange={setActiveTab} />

      {/* Conteúdo da Tab Selecionada */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeTab === 'detalhes' && (
          <DetalhesBasicos condominio={condominio} />
        )}
        {activeTab === 'unidades' && (
          <UnidadesTab condominioId={id} unidades={condominio.unidades || []} />
        )}
        {activeTab === 'financeiro' && (
          <FinanceiroTab condominioId={id} />
        )}
        {activeTab === 'documentos' && (
          <DocumentosTab condominioId={id} />
        )}
      </div>
    </div>
  );
};

export default DetalhesCondominio;