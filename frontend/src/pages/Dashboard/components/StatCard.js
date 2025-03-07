import React from 'react';

const StatCard = ({ title, value, icon, change, changeType = 'increase' }) => {
  return (
    <div className="card flex flex-col p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 rounded-full bg-gray-50">{icon}</div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {change && (
          <div className="flex items-center mt-2">
            {changeType === 'increase' ? (
              <svg
                className="h-4 w-4 text-success-500 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 text-danger-500 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p
              className={`text-sm ${
                changeType === 'increase'
                  ? 'text-success-600'
                  : 'text-danger-600'
              }`}
            >
              {change}{' '}
              <span className="text-gray-500">em relação ao mês anterior</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;