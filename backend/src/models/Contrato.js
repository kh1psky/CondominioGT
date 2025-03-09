const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contrato = sequelize.define('Contrato', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fornecedor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'fornecedores',
      key: 'id'
    }
  },
  condominio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'condominios',
      key: 'id'
    }
  },
  numero_contrato: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  objeto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  data_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  data_fim: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ativo', 'encerrado', 'suspenso', 'cancelado'),
    allowNull: false,
    defaultValue: 'ativo'
  },
  forma_pagamento: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  dia_vencimento: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 31
    }
  },
  periodicidade: {
    type: DataTypes.ENUM('mensal', 'bimestral', 'trimestral', 'semestral', 'anual', 'unico'),
    allowNull: false,
    defaultValue: 'mensal'
  },
  arquivo_contrato: {
    type: DataTypes.STRING,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  renovacao_automatica: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  prazo_renovacao: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Prazo em meses para renovação'
  },
  notificar_vencimento: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  dias_notificacao: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 30,
    comment: 'Dias antes do vencimento para notificar'
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
  tableName: 'contratos',
  timestamps: true,
  indexes: [
    {
      fields: ['fornecedor_id']
    },
    {
      fields: ['condominio_id']
    },
    {
      fields: ['status']
    },
    {
      unique: true,
      fields: ['numero_contrato']
    }
  ]
});

module.exports = Contrato;