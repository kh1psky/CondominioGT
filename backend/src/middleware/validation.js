const Joi = require('joi');

/**
 * Middleware para validação de requisições usando Joi
 * @param {Object} schema - Schema Joi para validação
 * @param {String} property - Propriedade a ser validada (body, params, query)
 * @returns {Function} Middleware de validação
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false, // Retorna todos os erros de uma vez
      stripUnknown: true, // Remove campos desconhecidos
      errors: {
        wrap: {
          label: ''
        }
      }
    });

    if (!error) {
      return next();
    }

    // Formatar erros
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    // Responder com erro de validação
    return res.status(422).json({
      status: 'error',
      message: 'Erro de validação',
      errors
    });
  };
};

/**
 * Validação para IDs numéricos
 */
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID deve ser um número',
      'number.integer': 'ID deve ser um número inteiro',
      'number.positive': 'ID deve ser um número positivo',
      'any.required': 'ID é obrigatório'
    })
});

/**
 * Validação para parâmetros condominioId
 */
const condominioIdParamSchema = Joi.object({
  condominioId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID do condomínio deve ser um número',
      'number.integer': 'ID do condomínio deve ser um número inteiro',
      'number.positive': 'ID do condomínio deve ser um número positivo',
      'any.required': 'ID do condomínio é obrigatório'
    })
});

/**
 * Validação para parâmetros usuarioId, proprietarioId, moradorId
 */
const usuarioIdParamSchema = Joi.object({
  usuarioId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID do usuário deve ser um número',
      'number.integer': 'ID do usuário deve ser um número inteiro',
      'number.positive': 'ID do usuário deve ser um número positivo',
      'any.required': 'ID do usuário é obrigatório'
    })
});

/**
 * Validação para paginação
 */
const paginacaoSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1)
    .messages({
      'number.base': 'Página deve ser um número',
      'number.integer': 'Página deve ser um número inteiro',
      'number.min': 'Página deve ser maior ou igual a 1'
    }),
  limit: Joi.number().integer().min(1).max(100).default(10)
    .messages({
      'number.base': 'Limite deve ser um número',
      'number.integer': 'Limite deve ser um número inteiro',
      'number.min': 'Limite deve ser maior ou igual a 1',
      'number.max': 'Limite deve ser menor ou igual a 100'
    })
});

/**
 * Middleware para validar ID nos parâmetros
 */
const validateIdParam = validate(idParamSchema, 'params');

/**
 * Middleware para validar condominioId nos parâmetros
 */
const validateCondominioIdParam = validate(condominioIdParamSchema, 'params');

/**
 * Middleware para validar usuarioId nos parâmetros
 */
const validateUsuarioIdParam = validate(usuarioIdParamSchema, 'params');

/**
 * Middleware para validar paginação na query
 */
const validatePaginacao = validate(paginacaoSchema, 'query');

module.exports = {
  validate,
  validateIdParam,
  validateCondominioIdParam,
  validateUsuarioIdParam,
  validatePaginacao
};