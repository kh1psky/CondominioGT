import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
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

// Dados de exemplo para o gráfico
const mockData = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  datasets: [
    {
      label: 'Receitas',
      data: [4500, 5200, 4800, 5800, 6000, 6500],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true
    },
    {
      label: 'Despesas',
      data: [3800, 4100, 3900, 4600, 4200, 4800],
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true
    }
  ]
};

const ActivityChart = () => {
  const [period, setPeriod] = useState('6m'); // '1m', '6m', '1y'

  // Opções do gráfico
  const options = {
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
        bodyFont: {
          size: 12
        },
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(context.parsed.y);
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
            return new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              maximumSignificantDigits: 3
            }).format(value);
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

  // Função para alternar o período
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    // Aqui você carregaria dados diferentes com base no período
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handlePeriodChange('1m')}
            className={`px-3 py-1 text-sm rounded-md ${
              period === '1m'
                ? 'bg-white shadow-sm text-primary-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            1 mês
          </button>
          <button
            onClick={() => handlePeriodChange('6m')}
            className={`px-3 py-1 text-sm rounded-md ${
              period === '6m'
                ? 'bg-white shadow-sm text-primary-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            6 meses
          </button>
          <button
            onClick={() => handlePeriodChange('1y')}
            className={`px-3 py-1 text-sm rounded-md ${
              period === '1y'
                ? 'bg-white shadow-sm text-primary-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            1 ano
          </button>
        </div>
      </div>
      <div className="h-72">
        <Line data={mockData} options={options} />
      </div>
    </div>
  );
};

export default ActivityChart;