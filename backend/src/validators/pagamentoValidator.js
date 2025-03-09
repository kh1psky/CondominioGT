/**
 * Validadores para a entidade Pagamento
 */
const Joi = require('joi');
const { STATUS_PAGAMENTO, TIPOS_PAGAMENTO } = require('../utils/constants');

// Esquema de validação para criação de pagamento
const schemaCreate = Joi.object({
  descricao: Joi.string().min(3).max(200).required()
    .messages({
      'string.base': 'Descrição deve ser um texto',
      'string.empty': 'Descrição é obrigatória',
      'string.min': 'Descrição deve ter no mínimo {#limit} caracteres',
      'string.max': 'Descrição deve ter no máximo {#limit} caracteres',
      'any.required': 'Descrição é obrigatória'
    }),

  valor: Joi.number().positive().required()
    .messages({
      'number.base': 'Valor deve ser um número',
      'number.positive': 'Valor deve ser um número positivo',
      'any.required': 'Valor é obrigatório'
    }),

  data_vencimento: Joi.date().required()
    .messages({
      'date.base': 'Data de vencimento deve ser uma data válida',
      'any.required': 'Data de vencimento é obrigatória'
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

  tipo: Joi.string().valid(...Object.values(TIPOS_PAGAMENTO)).required()
    .messages({
      'string.base': 'Tipo deve ser um texto',
      'any.only': 'Tipo deve ser um valor válido',
      'any.required': 'Tipo é obrigatório'
    }),

  status: Joi.string().valid(...Object.values(STATUS_PAGAMENTO)).default(STATUS_PAGAMENTO.PENDENTE)
    .messages({
      'string.base': 'Status deve ser um texto',
      'any.only': 'Status deve ser um valor válido'
    }),

  data_pagamento: Joi.date().allow(null)
    .messages({
      'date.base': 'Data de pagamento deve ser uma data válida'
    }),

  comprovante_url: Joi.string().allow('', null)
    .messages({
      'string.base': 'URL do comprovante deve ser um texto'
    }),

  observacoes: Joi.string().max(500).allow('', null)
    .messages({
      'string.base': 'Observações deve ser um texto',
      'string.max': 'Observações deve ter no máximo {#limit} caracteres'
    })
});

// Esquema de validação para atualização de pagamento
const schemaUpdate = Joi.object({
  descricao: Joi.string().min(3).max(200)
    .messages({
      'string.base': 'Descrição deve ser um texto',
      'string.min': 'Descrição deve ter no mínimo {#limit} caracteres',
      'string.max': 'Descrição deve ter no máximo {#limit} caracteres'
    }),

  valor: Joi.number().positive()
    .messages({
      'number.base': 'Valor deve ser um número',
      'number.positive': 'Valor deve ser um número positivo'
    }),

  data_vencimento: Joi.date()
    .messages({
      'date.base': 'Data de vencimento deve ser uma data válida'
    }),

  tipo: Joi.string().valid(...Object.values(TIPOS_PAGAMENTO))
    .messages({
      'string.base': 'Tipo deve ser um texto',
      'any.only': 'Tipo deve ser um valor válido'
    }),

  status: Joi.string().valid(...Object.values(STATUS_PAGAMENTO))
    .messages({
      'string.base': 'Status deve ser um texto',
      'any.only': 'Status deve ser um valor válido'
    }),

  data_pagamento: Joi.date().allow(null)
    .messages({
      'date.base': 'Data de pagamento deve ser uma data válida'
    }),

  comprovante_url: Joi.string().allow('', null)
    .messages({
      'string.base': 'URL do comprovante deve ser um texto'
    }),

  observacoes: Joi.string().max(500).allow('', null)
    .messages({
      'string.base': 'Observações deve ser um texto',
      'string.max': 'Observações deve ter no máximo {#limit} caracteres'
    })
});

// Esquema de validação para confirmação de pagamento
const schemaConfirmarPagamento = Joi.object({
  data_pagamento: Joi.date().required()
    .messages({
      'date.base': 'Data de pagamento deve ser uma data válida',
      'any.required': 'Data de pagamento é obrigatória'
    }),

  comprovante_url: Joi.string().allow('', null)
    .messages({
      'string.base': 'URL do comprovante deve ser um texto'
    }),

  observacoes: Joi.string().max(500).allow('', null)
    .messages({
      'string.base': 'Observações deve ser um texto',
      'string.max': 'Observações deve ter no máximo {#limit} caracteres'
    })
});

module.exports = {
  schemaCreate,
  schemaUpdate,
  schemaConfirmarPagamento
};