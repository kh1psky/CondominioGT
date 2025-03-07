const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
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
        msg: 'O nome é obrigatório'
      },
      len: {
        args: [3, 100],
        msg: 'O nome deve ter entre 3 e 100 caracteres'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      name: 'email',
      msg: 'Este email já está em uso'
    },
    validate: {
      isEmail: {
        msg: 'Email inválido'
      },
      notEmpty: {
        msg: 'O email é obrigatório'
      }
    }
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'A senha é obrigatória'
      },
      len: {
        args: [6, 100],
        msg: 'A senha deve ter pelo menos 6 caracteres'
      }
    }
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  perfil: {
    type: DataTypes.ENUM('admin', 'sindico', 'funcionario', 'morador'),
    allowNull: false,
    defaultValue: 'morador'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  ultimo_acesso: {
    type: DataTypes.DATE,
    allowNull: true
  },
  token_recuperacao: {
    type: DataTypes.STRING,
    allowNull: true
  },
  token_expiracao: {
    type: DataTypes.DATE,
    allowNull: true
  },
  foto_perfil: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  // Opções do modelo
  tableName: 'usuarios',
  timestamps: true,
  hooks: {
    // Hash da senha antes de salvar
    beforeCreate: async (usuario) => {
      if (usuario.senha) {
        usuario.senha = await bcrypt.hash(usuario.senha, 10);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('senha')) {
        usuario.senha = await bcrypt.hash(usuario.senha, 10);
      }
    }
  }
});

// Método para verificar senha
Usuario.prototype.verificarSenha = async function(senha) {
  return bcrypt.compare(senha, this.senha);
};

// Método para gerar token de recuperação de senha
Usuario.prototype.gerarTokenRecuperacao = async function() {
  this.token_recuperacao = require('crypto').randomBytes(20).toString('hex');
  this.token_expiracao = new Date(Date.now() + 3600000); // 1 hora
  await this.save();
  return this.token_recuperacao;
};

// Método para limpar campos sensíveis ao converter para JSON
Usuario.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.senha;
  delete values.token_recuperacao;
  delete values.token_expiracao;
  return values;
};

module.exports = Usuario;