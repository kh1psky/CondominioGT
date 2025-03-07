const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redisClient = require('../config/redis');

/**
 * Configuração padrão do rate limiter
 */
const defaultOptions = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutos padrão
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requisições por IP
  standardHeaders: true, // Incluir headers padrão (X-RateLimit-*)
  legacyHeaders: false, // Desabilitar headers antigos (X-Rate-Limit-*)
  message: {
    status: 429,
    message: 'Muitas requisições, por favor tente novamente mais tarde.'
  }
};

/**
 * Rate limiter para uso geral
 */
const apiLimiter = rateLimit({
  ...defaultOptions,
  // Opcional: Usar Redis como store se estiver disponível
  store: redisClient.isReady 
    ? new RedisStore({
        client: redisClient,
        prefix: 'rate-limit:'
      })
    : undefined
});

/**
 * Rate limiter mais restrito para rotas de autenticação
 */
const authLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 tentativas por IP
  message: {
    status: 429,
    message: 'Muitas tentativas de login. Tente novamente mais tarde.'
  },
  store: redisClient.isReady 
    ? new RedisStore({
        client: redisClient,
        prefix: 'rate-limit:auth:'
      })
    : undefined
});

/**
 * Rate limiter específico para rotas sensíveis
 * @param {Object} options - Opções personalizadas
 * @returns {Function} Middleware de rate limiter
 */
const createLimiter = (options = {}) => {
  return rateLimit({
    ...defaultOptions,
    ...options,
    store: redisClient.isReady && options.useRedis !== false
      ? new RedisStore({
          client: redisClient,
          prefix: options.prefix || 'rate-limit:'
        })
      : undefined
  });
};

module.exports = {
  apiLimiter,
  authLimiter,
  createLimiter
};