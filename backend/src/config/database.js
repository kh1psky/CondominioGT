const { Sequelize } = require('sequelize');
const logger = require('./logger');

// Configuração do banco de dados
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '-03:00', // Timezone para Brasil (GMT-3)
    define: {
      timestamps: true, // Adiciona created_at e updated_at automaticamente
      underscored: true, // Usa snake_case em vez de camelCase
      freezeTableName: true, // Não pluraliza nomes de tabelas
      charset: 'utf8',
      dialectOptions: {
        collate: 'utf8_general_ci'
      }
    }
  }
);

module.exports = sequelize;