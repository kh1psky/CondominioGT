const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Unidade = sequelize.define('Unidade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  condominio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'condominios',
      key: 'id'
    }
  },
  bloco: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  numero: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('apartamento', 'casa', 'sala', 'loja', 'outro'),
    allowNull: false,
    defaultValue: 'apartamento'
  },
  area: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true
  },
  quartos: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  banheiros: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  vagas_garagem: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  proprietario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  morador_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('ocupado', 'vago', 'em_reforma', 'indisponivel'),
    allowNull: false,
    defaultValue: 'vago'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  valor_aluguel: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  data_ocupacao: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  data_desocupacao: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'unidades',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['condominio_id', 'bloco', 'numero'],
      name: 'unidade_unica'
    }
  ]
});

module.exports = Unidade;