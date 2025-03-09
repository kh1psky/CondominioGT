const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventario = sequelize.define('Inventario', {
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
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O nome do item é obrigatório'
      }
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoria: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  numero_serie: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  codigo_patrimonio: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  data_aquisicao: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  valor_aquisicao: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  fornecedor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'fornecedores',
      key: 'id'
    }
  },
  nota_fiscal: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  localizacao: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ativo', 'em_manutencao', 'inativo', 'baixado'),
    allowNull: false,
    defaultValue: 'ativo'
  },
  data_ultima_manutencao: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  data_proxima_manutencao: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  foto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  qrcode: {
    type: DataTypes.STRING,
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
  tableName: 'inventarios',
  timestamps: true,
  indexes: [
    {
      fields: ['condominio_id']
    },
    {
      fields: ['categoria']
    },
    {
      fields: ['status']
    },
    {
      fields: ['fornecedor_id']
    }
  ]
});

module.exports = Inventario;