import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Dados de exemplo
const activities = [
  {
    id: 1,
    type: 'payment',
    description: 'Pagamento de condomínio recebido',
    amount: 850.00,
    date: new Date(2023, 4, 15),
    condominio: 'Residencial Aurora',
    unidade: 'Apto 501'
  },
  {
    id: 2,
    type: 'maintenance',
    description: 'Manutenção da bomba d\'água realizada',
    date: new Date(2023, 4, 12),
    condominio: 'Residencial Solar',
    status: 'Concluído'
  },
  {
    id: 3,
    type: 'document',
    description: 'Nova ata de reunião adicionada',
    date: new Date(2023, 4, 10),
    condominio: 'Residencial Aurora',
    document: 'Ata de reunião ordinária'
  },
  {
    id: 4,
    type: 'payment',
    description: 'Pagamento de fornecedor',
    amount: -1200.00,
    date: new Date(2023, 4, 8),
    condominio: 'Residencial Solar',
    fornecedor: 'Elétrica Luz'
  },
  {
    id: 5,
    type: 'notification',
    description: 'Notificação enviada aos moradores',
    date: new Date(2023, 4, 5),
    condominio: 'Residencial Aurora',
    subject: 'Limpeza das caixas d\'água'
  }
];

// Ícones para os diferentes tipos de atividades
const ActivityIcon = ({ type }) => {
  switch (type) {
    case 'payment':
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600">
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      );
    case 'maintenance':
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-warning-100 text-warning-600">
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      );
    case 'document':
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-100 text-secondary-600">
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      );
    case 'notification':
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success-100 text-success-600">
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600">
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </div>
      );
  }
};

const RecentActivities = () => {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, index) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {index !== activities.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <ActivityIcon type={activity.type} />
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {activity.condominio}
                      {activity.unidade && ` - ${activity.unidade}`}
                      {activity.fornecedor && ` - ${activity.fornecedor}`}
                    </p>
                  </div>
                  <div className="text-right text-xs whitespace-nowrap text-gray-500">
                    <time dateTime={activity.date.toISOString()}>
                      {format(activity.date, "d 'de' MMM", { locale: ptBR })}
                    </time>
                    {activity.amount !== undefined && (
                      <p className={`mt-1 font-medium ${activity.amount >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(activity.amount)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivities;