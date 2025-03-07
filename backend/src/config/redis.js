const { createClient } = require('redis');
const logger = require('./logger');

// Configuração do cliente Redis
const redisClient = createClient({
  url: `redis://${process.env.REDIS_PASSWORD ? `${process.env.REDIS_PASSWORD}@` : ''}${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

// Tratamento de erros e conexão
redisClient.on('error', (err) => {
  logger.error('Erro no cliente Redis:', err);
});

redisClient.on('connect', () => {
  logger.info('Cliente Redis conectado');
});

// Conectar ao Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Falha ao conectar ao Redis:', error);
  }
};

// Invocar a conexão
connectRedis();

module.exports = redisClient;