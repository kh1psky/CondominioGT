const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fornecedor = sequelize.define('Fornecedor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O nome do fornecedor é obrigatório'
      }
    }
  },
  cnpj_cpf: {
    type: DataTypes.STRING(18),
    allowNull: false,
    unique: {
      name: 'cnpj_cpf',
      msg: 'Este CNPJ/CPF já está cadastrado'
    },
    validate: {
      notEmpty: {
        msg: 'O CNPJ/CPF é obrigatório'
      }
    }
  },
  tipo_pessoa: {
    type: DataTypes.ENUM('fisica', 'juridica'),
    allowNull: false,
    defaultValue: 'juridica'
  },
  categoria: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  endereco: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  numero: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  complemento: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bairro: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  cep: {
    type: DataTypes.STRING(9),
    allowNull: true
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Email inválido'
      }
    }
  },
  contato_nome: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  contato_telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  condominio_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'condominios',
      key: 'id'
    }
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'fornecedores',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['cnpj_cpf']
    },
    {
      fields: ['condominio_id']
    },
    {
      fields: ['categoria']
    }
  ]
});

module.exports = Fornecedor;