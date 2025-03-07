const redisClient = require('../config/redis');
const logger = require('../config/logger');

/**
 * Middleware para caching de respostas com Redis
 * @param {Number} duration - Duração do cache em segundos
 * @param {Function} keyFn - Função para gerar a chave de cache (opcional)
 * @returns {Function} Middleware de cache
 */
const cache = (duration = 300, keyFn) => {
  return async (req, res, next) => {
    // Não fazer cache se Redis não estiver conectado
    if (!redisClient.isReady) {
      return next();
    }

    // Pular cache para métodos que modificam dados
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    // Gerar chave de cache
    const key = keyFn 
      ? keyFn(req)
      : `cache:${req.originalUrl}`;

    try {
      // Verificar se a resposta está em cache
      const cachedResponse = await redisClient.get(key);
      
      if (cachedResponse) {
        // Retornar resposta do cache
        const parsedResponse = JSON.parse(cachedResponse);
        
        // Definir cabeçalho indicando cache
        res.setHeader('X-Cache', 'HIT');
        
        return res.status(200).json(parsedResponse);
      }
      
      // Se não houver cache, continuar o fluxo

      // Capturar a resposta original
      const originalSend = res.send;
      
      res.send = function(body) {
        // Restaurar o método original
        res.send = originalSend;
        
        // Se a resposta for bem-sucedida, armazenar em cache
        if (res.statusCode === 200) {
          try {
            // Armazenar em cache
            redisClient.set(key, body, {
              EX: duration
            });
            
            // Definir cabeçalho indicando miss no cache
            res.setHeader('X-Cache', 'MISS');
          } catch (error) {
            logger.error('Erro ao armazenar em cache:', error);
          }
        }
        
        // Enviar a resposta original
        return originalSend.call(this, body);
      };
      
      next();
    } catch (error) {
      logger.error('Erro ao acessar cache:', error);
      next();
    }
  };
};

/**
 * Middleware para invalidar cache
 * @param {String} pattern - Padrão para as chaves a serem invalidadas
 * @returns {Function} Middleware de invalidação de cache
 */
const invalidateCache = (pattern) => {
  return async (req, res, next) => {
    // Continuar o fluxo
    next();
    
    // Só invalidar após o processamento da requisição
    // e apenas se for bem-sucedida
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          if (!redisClient.isReady) {
            return;
          }

          // Gerar o padrão baseado na URL se não fornecido
          const keyPattern = pattern || `cache:${req.baseUrl}*`;
          
          // Encontrar todas as chaves que correspondem ao padrão
          const keys = await redisClient.keys(keyPattern);
          
          if (keys.length > 0) {
            // Excluir todas as chaves encontradas
            await redisClient.del(keys);
            logger.debug(`Cache invalidado: ${keyPattern}`);
          }
        } catch (error) {
          logger.error('Erro ao invalidar cache:', error);
        }
      }
    });
  };
};

module.exports = {
  cache,
  invalidateCache
};