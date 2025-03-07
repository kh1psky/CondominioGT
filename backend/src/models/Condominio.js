const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Condominio = sequelize.define('Condominio', {
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
        msg: 'O nome do condomínio é obrigatório'
      }
    }
  },
  cnpj: {
    type: DataTypes.STRING(18),
    allowNull: false,
    unique: {
      name: 'cnpj',
      msg: 'Este CNPJ já está cadastrado'
    },
    validate: {
      notEmpty: {
        msg: 'O CNPJ é obrigatório'
      },
      is: {
        args: /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/,
        msg: 'Formato de CNPJ inválido (XX.XXX.XXX/XXXX-XX)'
      }
    }
  },
  endereco: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O endereço é obrigatório'
      }
    }
  },
  numero: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  complemento: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bairro: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING(2),
    allowNull: false,
    validate: {
      isIn: {
        args: [['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']],
        msg: 'Estado inválido'
      }
    }
  },
  cep: {
    type: DataTypes.STRING(9),
    allowNull: false,
    validate: {
      is: {
        args: /^\d{5}\-\d{3}$/,
        msg: 'Formato de CEP inválido (XXXXX-XXX)'
      }
    }
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
  data_fundacao: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  total_unidades: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'O total de unidades não pode ser negativo'
      }
    }
  },
  area_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'A área total não pode ser negativa'
      }
    }
  },
  sindico_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'condominios',
  timestamps: true
});

module.exports = Condominio;