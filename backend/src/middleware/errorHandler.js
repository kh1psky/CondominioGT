const logger = require('../config/logger');

/**
 * Middleware centralizado para tratamento de erros
 */
const errorHandler = (err, req, res, next) => {
  // Status HTTP padrão para erros internos
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor';
  let errors = err.errors || null;

  // Tratamento de erros específicos
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Erro de validação dos dados';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Registro duplicado';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Registrar o erro no log
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel](`[${req.method}] ${req.path} - ${statusCode}: ${message}`, {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    requestId: req.id,
    user: req.user ? req.user.id : 'anônimo',
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Responder ao cliente com o erro formatado
  res.status(statusCode).json({
    status: 'error',
    message,
    errors,
    timestamp: new Date().toISOString(),
    requestId: req.id,
    // Apenas incluir o stack em ambientes de desenvolvimento
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorHandler;