import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../../services/api';

// Gráfico de linha com Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dados de exemplo para o gráfico financeiro
const gerarDadosGrafico = (meses = 6) => {
  const labels = [];
  const receitas = [];
  const despesas = [];
  const saldos = [];

  // Gerar dados para os últimos X meses
  const dataAtual = new Date();
  for (let i = meses - 1; i >= 0; i--) {
    const data = new Date(dataAtual);
    data.setMonth(data.getMonth() - i);
    
    // Formatar mês como "Abr/2023"
    const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    const ano = data.getFullYear();
    labels.push(`${mes}/${ano}`);
    
    // Gerar valores aleatórios
    const receitaBase = 15000 + Math.random() * 5000;
    const despesaBase = 10000 + Math.random() * 4000;
    
    receitas.push(parseFloat(receitaBase.toFixed(2)));
    despesas.push(parseFloat(despesaBase.toFixed(2)));
    saldos.push(parseFloat((receitaBase - despesaBase).toFixed(2)));
  }

  return {
    labels,
    receitas,
    despesas,
    saldos
  };
};

// Componente de card financeiro
const CardFinanceiro = ({ titulo, valor, icone, corTextoBg, corIconeBg }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-start">
      <div className={`flex items-center justify-center h-10 w-10 rounded-md ${corIconeBg} text-white`}>
        {icone}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{titulo}</p>
        <p className={`text-2xl font-semibold ${corTextoBg}`}>{valor}</p>
      </div>
    </div>
  </div>
);

const FinanceiroTab = ({ condominioId }) => {
  const [periodo, setPeriodo] = useState('6m');
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ultimosRegistros, setUltimosRegistros] = useState([]);

  // Formatar valor monetário
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Formatar data
  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(data);
  };

  // Carregar dados financeiros
  useEffect(() => {
    const fetchDadosFinanceiros = async () => {
      setLoading(true);
      try {
        // Simulação de chamada à API
        // Em uma implementação real, você faria uma chamada como:
        // const response = await api.get(`/condominios/${condominioId}/financeiro?periodo=${periodo}`);
        
        // Dados simulados para demonstração
        setTimeout(() => {
          const dadosGrafico = gerarDadosGrafico(periodo === '6m' ? 6 : periodo === '3m' ? 3 : 12);
          
          const totalReceitas = dadosGrafico.receitas.reduce((acc, curr) => acc + curr, 0);
          const totalDespesas = dadosGrafico.despesas.reduce((acc, curr) => acc + curr, 0);
          const saldoAtual = totalReceitas - totalDespesas;
          
          const registrosSimulados = [
            {
              id: 1,
              tipo: 'receita',
              descricao: 'Taxa condominial',
              valor: 12500.00,
              data: new Date(2023, 4, 15),
              categoria: 'Mensalidade'
            },
            {
              id: 2,
              tipo: 'despesa',
              descricao: 'Pagamento empresa de limpeza',
              valor: 3800.00,
              data: new Date(2023, 4, 10),
              categoria: 'Serviços'
            },
            {
              id: 3,
              tipo: 'despesa',
              descricao: 'Conta de água',
              valor: 2450.75,
              data: new Date(2023, 4, 5),
              categoria: 'Utilidades'
            },
            {
              id: 4,
              tipo: 'receita',
              descricao: 'Aluguel salão de festas',
              valor: 800.00,
              data: new Date(2023, 4, 3),
              categoria: 'Áreas comuns'
            },
            {
              id: 5,
              tipo: 'despesa',
              descricao: 'Manutenção elevador',
              valor: 1200.00,
              data: new Date(2023, 4, 1),
              categoria: 'Manutenção'
            }
          ];
          
          setDados({
            grafico: dadosGrafico,
            resumo: {
              receitas: totalReceitas,
              despesas: totalDespesas,
              saldo: saldoAtual,
              inadimplencia: 12.5, // Porcentagem fictícia
              previsaoProximoMes: saldoAtual * 0.95 // Estimativa fictícia
            }
          });
          
          setUltimosRegistros(registrosSimulados);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error);
        toast.error('Erro ao carregar informações financeiras');
        setLoading(false);
      }
    };

    fetchDadosFinanceiros();
  }, [condominioId, periodo]);

  // Configuração do gráfico
  const chartData = {
    labels: dados?.grafico.labels || [],
    datasets: [
      {
        label: 'Receitas',
        data: dados?.grafico.receitas || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Despesas',
        data: dados?.grafico.despesas || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Saldo',
        data: dados?.grafico.saldos || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: false,
        borderDash: [5, 5]
      }
    ]
  };

  // Opções do gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        boxPadding: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatarMoeda(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          callback: function(value) {
            return formatarMoeda(value);
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title">Financeiro</h2>
        <div className="flex space-x-2">
          <Link 
            to={`/app/financeiro/condominios/${condominioId}/receitas/novo`}
            className="btn-primary"
          >
            Registrar Receita
          </Link>
          <Link 
            to={`/app/financeiro/condominios/${condominioId}/despesas/novo`}
            className="btn-secondary"
          >
            Registrar Despesa
          </Link>
        </div>
      </div>

      {/* Cards com resumo financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CardFinanceiro 
          titulo="Receitas Totais" 
          valor={formatarMoeda(dados.resumo.receitas)}
          icone={
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
          corTextoBg="text-success-600"
          corIconeBg="bg-success-600"
        />
        <CardFinanceiro 
          titulo="Despesas Totais" 
          valor={formatarMoeda(dados.resumo.despesas)}
          icone={
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          }
          corTextoBg="text-danger-600"
          corIconeBg="bg-danger-600"
        />
        <CardFinanceiro 
          titulo="Saldo Atual" 
          valor={formatarMoeda(dados.resumo.saldo)}
          icone={
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          corTextoBg={dados.resumo.saldo >= 0 ? "text-primary-600" : "text-danger-600"}
          corIconeBg="bg-primary-600"
        />
        <CardFinanceiro 
          titulo="Taxa de Inadimplência" 
          valor={`${dados.resumo.inadimplencia.toFixed(2)}%`}
          icone={
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          corTextoBg={dados.resumo.inadimplencia > 15 ? "text-danger-600" : dados.resumo.inadimplencia > 10 ? "text-warning-600" : "text-success-600"}
          corIconeBg="bg-warning-600"
        />
      </div>

      {/* Gráfico Financeiro */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Evolução Financeira
            </h3>
            <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPeriodo('3m')}
                className={`px-3 py-1 text-sm rounded-md ${
                  periodo === '3m'
                    ? 'bg-white shadow-sm text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                3 meses
              </button>
              <button
                onClick={() => setPeriodo('6m')}
                className={`px-3 py-1 text-sm rounded-md ${
                  periodo === '6m'
                    ? 'bg-white shadow-sm text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                6 meses
              </button>
              <button
                onClick={() => setPeriodo('12m')}
                className={`px-3 py-1 text-sm rounded-md ${
                  periodo === '12m'
                    ? 'bg-white shadow-sm text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                12 meses
              </button>
            </div>
          </div>
          <div className="h-72">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Últimos Registros Financeiros */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Últimas Movimentações
            </h3>
            <Link
              to={`/app/financeiro/condominios/${condominioId}/movimentacoes`}
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Ver todas
            </Link>
          </div>

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
                    Categoria
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ultimosRegistros.map((registro) => (
                  <tr key={registro.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(registro.data)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {registro.descricao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registro.categoria}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      registro.tipo === 'receita' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {registro.tipo === 'receita' ? '+' : '-'} {formatarMoeda(registro.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceiroTab;