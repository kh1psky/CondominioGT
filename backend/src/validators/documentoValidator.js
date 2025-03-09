/**
 * Validadores para a entidade Documento
 */
const Joi = require('joi');

// Esquema de validação para criação de documento
const schemaCreate = Joi.object({
  titulo: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': 'Título deve ser um texto',
      'string.empty': 'Título é obrigatório',
      'string.min': 'Título deve ter no mínimo {#limit} caracteres',
      'string.max': 'Título deve ter no máximo {#limit} caracteres',
      'any.required': 'Título é obrigatório'
    }),

  descricao: Joi.string().max(500).allow('', null)
    .messages({
      'string.base': 'Descrição deve ser um texto',
      'string.max': 'Descrição deve ter no máximo {#limit} caracteres'
    }),

  tipo: Joi.string().valid('ata', 'contrato', 'financeiro', 'comunicado', 'regimento', 'outro').required()
    .messages({
      'string.base': 'Tipo deve ser um texto',
      'any.only': 'Tipo deve ser um valor válido',
      'any.required': 'Tipo é obrigatório'
    }),

  condominio_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID do condomínio deve ser um número',
      'number.integer': 'ID do condomínio deve ser um número inteiro',
      'number.positive': 'ID do condomínio deve ser um número positivo',
      'any.required': 'ID do condomínio é obrigatório'
    }),

  unidade_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'ID da unidade deve ser um número',
      'number.integer': 'ID da unidade deve ser um número inteiro',
      'number.positive': 'ID da unidade deve ser um número positivo'
    }),

  data_documento: Joi.date().allow(null)
    .messages({
      'date.base': 'Data do documento deve ser uma data válida'
    }),

  data_validade: Joi.date().allow(null)
    .messages({
      'date.base': 'Data de validade deve ser uma data válida'
    }),

  publico: Joi.boolean().default(false)
    .messages({
      'boolean.base': 'Público deve ser um valor booleano'
    }),

  tags: Joi.array().items(Joi.string()).allow(null)
    .messages({
      'array.base': 'Tags deve ser um array de strings'
    }),

  observacoes: Joi.string().max(500).allow('', null)
    .messages({
      'string.base': 'Observações deve ser um texto',
      'string.max': 'Observações deve ter no máximo {#limit} caracteres'
    })
});

// Esquema de validação para atualização de documento
const schemaUpdate = Joi.object({
  titulo: Joi.string().min(3).max(100)
    .messages({
      'string.base': 'Título deve ser um texto',
      'string.min': 'Título deve ter no mínimo {#limit} caracteres',
      'string.max': 'Título deve ter no máximo {#limit} caracteres'
    }),

  descricao: Joi.string().max(500).allow('', null)
    .messages({
      'string.base': 'Descrição deve ser um texto',
      'string.max': 'Descrição deve ter no máximo {#limit} caracteres'
    }),

  tipo: Joi.string().valid('ata', 'contrato', 'financeiro', 'comunicado', 'regimento', 'outro')
    .messages({
      'string.base': 'Tipo deve ser um texto',
      'any.only': 'Tipo deve ser um valor válido'
    }),

  data_documento: Joi.date().allow(null)
    .messages({
      'date.base': 'Data do documento deve ser uma data válida'
    }),

  data_validade: Joi.date().allow(null)
    .messages({
      'date.base': 'Data de validade deve ser uma data válida'
    }),

  publico: Joi.boolean()
    .messages({
      'boolean.base': 'Público deve ser um valor booleano'
    }),

  tags: Joi.array().items(Joi.string()).allow(null)
    .messages({
      'array.base': 'Tags deve ser um array de strings'
    }),

  observacoes: Joi.string().max(500).allow('', null)
    .messages({
      'string.base': 'Observações deve ser um texto',
      'string.max': 'Observações deve ter no máximo {#limit} caracteres'
    })
});

module.exports = {
  schemaCreate,
  schemaUpdate
};