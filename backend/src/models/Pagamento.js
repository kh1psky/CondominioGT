const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { STATUS_PAGAMENTO } = require('../utils/constants');

const Pagamento = sequelize.define('Pagamento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  condominio_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'condominios',
      key: 'id'
    }
  },
  unidade_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'unidades',
      key: 'id'
    }
  },
  descricao: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('receita', 'despesa'),
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  valor_final: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  juros: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  multa: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  data_vencimento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  data_pagamento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(
      STATUS_PAGAMENTO.PENDENTE,
      STATUS_PAGAMENTO.PAGO,
      STATUS_PAGAMENTO.ATRASADO,
      STATUS_PAGAMENTO.CANCELADO
    ),
    allowNull: false,
    defaultValue: STATUS_PAGAMENTO.PENDENTE
  },
  forma_pagamento: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  comprovante: {
    type: DataTypes.STRING,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  criado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  atualizado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  }
}, {
  tableName: 'pagamentos',
  timestamps: true,
  indexes: [
    {
      fields: ['condominio_id']
    },
    {
      fields: ['unidade_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['data_vencimento']
    },
    {
      fields: ['tipo']
    }
  ]
});

module.exports = Pagamento;