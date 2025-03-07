import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import condominioService from '../../services/condominioService';
import { toast } from 'react-toastify';

// Componentes do Dashboard
import StatCard from './components/StatCard';
import ActivityChart from './components/ActivityChart';
import RecentActivities from './components/RecentActivities';
import CondominiosCard from './components/CondominiosCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [condominios, setCondominios] = useState([]);
  const [stats, setStats] = useState({
    totalCondominios: 0,
    totalUnidades: 0,
    unidadesOcupadas: 0,
    taxaOcupacao: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar lista de condomínios
        const result = await condominioService.listarCondominios({
          limit: 10,
          page: 1
        });

        if (result.success) {
          setCondominios(result.data.data);
          
          // Calcular estatísticas
          const totalCondominios = result.data.meta.total;
          let totalUnidades = 0;
          let unidadesOcupadas = 0;
          
          // Calcular totais com base nos condomínios carregados
          result.data.data.forEach(condominio => {
            totalUnidades += condominio.total_unidades || 0;
            // Considerando que não temos acesso direto às unidades ocupadas aqui
            // Você pode carregar isso separadamente ou estimá-lo
          });
          
          // Valores de exemplo (você deve substituir por dados reais)
          unidadesOcupadas = Math.floor(totalUnidades * 0.75); // Exemplo: 75% ocupação
          
          setStats({
            totalCondominios,
            totalUnidades,
            unidadesOcupadas,
            taxaOcupacao: totalUnidades > 0 
              ? Math.round((unidadesOcupadas / totalUnidades) * 100) 
              : 0
          });
        } else {
          toast.error('Falha ao carregar dados do dashboard');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        toast.error('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Dashboard</h1>
        <div>
          <Link to="/app/condominios/novo" className="btn-primary">
            Adicionar Condomínio
          </Link>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total de Condomínios"
          value={stats.totalCondominios}
          icon={
            <svg
              className="h-6 w-6 text-primary-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
          change={"+12%"}
          changeType="increase"
        />
        <StatCard
          title="Total de Unidades"
          value={stats.totalUnidades}
          icon={
            <svg
              className="h-6 w-6 text-secondary-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          }
          change={"+5%"}
          changeType="increase"
        />
        <StatCard
          title="Unidades Ocupadas"
          value={stats.unidadesOcupadas}
          icon={
            <svg
              className="h-6 w-6 text-success-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
          change={"+8%"}
          changeType="increase"
        />
        <StatCard
          title="Taxa de Ocupação"
          value={`${stats.taxaOcupacao}%`}
          icon={
            <svg
              className="h-6 w-6 text-warning-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          change={"+2%"}
          changeType="increase"
        />
      </div>

      {/* Gráfico e Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card lg:col-span-2">
          <h2 className="section-title">Atividades Mensais</h2>
          <ActivityChart />
        </div>
        <div className="card">
          <h2 className="section-title">Atividades Recentes</h2>
          <RecentActivities />
        </div>
      </div>

      {/* Condomínios */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-title">Seus Condomínios</h2>
          <Link
            to="/app/condominios"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Ver Todos
          </Link>
        </div>
        <CondominiosCard condominios={condominios} />
      </div>
    </div>
  );
};

export default Dashboard;