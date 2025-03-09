/**
 * Validadores para a entidade Unidade
 */
const Joi = require('joi');

// Esquema de validação para criação de unidade
const schemaCreate = Joi.object({
  identificacao: Joi.string().required()
    .messages({
      'string.base': 'Identificação deve ser um texto',
      'string.empty': 'Identificação é obrigatória',
      'any.required': 'Identificação é obrigatória'
    }),

  condominio_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID do condomínio deve ser um número',
      'number.integer': 'ID do condomínio deve ser um número inteiro',
      'number.positive': 'ID do condomínio deve ser um número positivo',
      'any.required': 'ID do condomínio é obrigatório'
    }),

  bloco: Joi.string().allow('', null)
    .messages({
      'string.base': 'Bloco deve ser um texto'
    }),

  andar: Joi.number().integer().min(0).allow(null)
    .messages({
      'number.base': 'Andar deve ser um número',
      'number.integer': 'Andar deve ser um número inteiro',
      'number.min': 'Andar não pode ser negativo'
    }),

  tipo: Joi.string().valid('apartamento', 'casa', 'sala_comercial', 'outro').default('apartamento')
    .messages({
      'string.base': 'Tipo deve ser um texto',
      'any.only': 'Tipo deve ser um dos seguintes valores: apartamento, casa, sala_comercial, outro'
    }),

  area: Joi.number().positive().allow(null)
    .messages({
      'number.base': 'Área deve ser um número',
      'number.positive': 'Área deve ser um número positivo'
    }),

  fracao_ideal: Joi.number().positive().max(100).allow(null)
    .messages({
      'number.base': 'Fração ideal deve ser um número',
      'number.positive': 'Fração ideal deve ser um número positivo',
      'number.max': 'Fração ideal não pode ser maior que 100%'
    }),

  ocupada: Joi.boolean().default(false),

  proprietario_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'ID do proprietário deve ser um número',
      'number.integer': 'ID do proprietário deve ser um número inteiro',
      'number.positive': 'ID do proprietário deve ser um número positivo'
    }),

  inquilino_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'ID do inquilino deve ser um número',
      'number.integer': 'ID do inquilino deve ser um número inteiro',
      'number.positive': 'ID do inquilino deve ser um número positivo'
    }),

  observacoes: Joi.string().allow('', null)
    .messages({
      'string.base': 'Observações deve ser um texto'
    }),

  ativo: Joi.boolean().default(true)
});

// Esquema de validação para atualização de unidade
const schemaUpdate = Joi.object({
  identificacao: Joi.string()
    .messages({
      'string.base': 'Identificação deve ser um texto'
    }),

  condominio_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'ID do condomínio deve ser um número',
      'number.integer': 'ID do condomínio deve ser um número inteiro',
      'number.positive': 'ID do condomínio deve ser um número positivo'
    }),

  bloco: Joi.string().allow('', null)
    .messages({
      'string.base': 'Bloco deve ser um texto'
    }),

  andar: Joi.number().integer().min(0).allow(null)
    .messages({
      'number.base': 'Andar deve ser um número',
      'number.integer': 'Andar deve ser um número inteiro',
      'number.min': 'Andar não pode ser negativo'
    }),

  tipo: Joi.string().valid('apartamento', 'casa', 'sala_comercial', 'outro')
    .messages({
      'string.base': 'Tipo deve ser um texto',
      'any.only': 'Tipo deve ser um dos seguintes valores: apartamento, casa, sala_comercial, outro'
    }),

  area: Joi.number().positive().allow(null)
    .messages({
      'number.base': 'Área deve ser um número',
      'number.positive': 'Área deve ser um número positivo'
    }),

  fracao_ideal: Joi.number().positive().max(100).allow(null)
    .messages({
      'number.base': 'Fração ideal deve ser um número',
      'number.positive': 'Fração ideal deve ser um número positivo',
      'number.max': 'Fração ideal não pode ser maior que 100%'
    }),

  ocupada: Joi.boolean(),

  proprietario_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'ID do proprietário deve ser um número',
      'number.integer': 'ID do proprietário deve ser um número inteiro',
      'number.positive': 'ID do proprietário deve ser um número positivo'
    }),

  inquilino_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'ID do inquilino deve ser um número',
      'number.integer': 'ID do inquilino deve ser um número inteiro',
      'number.positive': 'ID do inquilino deve ser um número positivo'
    }),

  observacoes: Joi.string().allow('', null)
    .messages({
      'string.base': 'Observações deve ser um texto'
    }),

  ativo: Joi.boolean()
}).min(1);

module.exports = {
  schemaCreate,
  schemaUpdate
};