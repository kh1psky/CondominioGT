/**
 * Validadores para a entidade Condomínio
 */
const Joi = require('joi');
const { validarCNPJ } = require('../utils/validators');

// Esquema de validação para criação de condomínio
const schemaCreate = Joi.object({
  nome: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': 'Nome deve ser um texto',
      'string.empty': 'Nome é obrigatório',
      'string.min': 'Nome deve ter no mínimo {#limit} caracteres',
      'string.max': 'Nome deve ter no máximo {#limit} caracteres',
      'any.required': 'Nome é obrigatório'
    }),

  cnpj: Joi.string()
    .custom((value, helpers) => {
      if (!validarCNPJ(value)) {
        return helpers.error('string.cnpjInvalido');
      }
      return value;
    })
    .messages({
      'string.base': 'CNPJ deve ser um texto',
      'string.empty': 'CNPJ é obrigatório',
      'string.cnpjInvalido': 'CNPJ inválido'
    }),

  endereco: Joi.string().required()
    .messages({
      'string.base': 'Endereço deve ser um texto',
      'string.empty': 'Endereço é obrigatório',
      'any.required': 'Endereço é obrigatório'
    }),

  numero: Joi.string().required()
    .messages({
      'string.base': 'Número deve ser um texto',
      'string.empty': 'Número é obrigatório',
      'any.required': 'Número é obrigatório'
    }),

  complemento: Joi.string().allow('', null),

  bairro: Joi.string().required()
    .messages({
      'string.base': 'Bairro deve ser um texto',
      'string.empty': 'Bairro é obrigatório',
      'any.required': 'Bairro é obrigatório'
    }),

  cidade: Joi.string().required()
    .messages({
      'string.base': 'Cidade deve ser um texto',
      'string.empty': 'Cidade é obrigatória',
      'any.required': 'Cidade é obrigatória'
    }),

  estado: Joi.string().length(2).required()
    .messages({
      'string.base': 'Estado deve ser um texto',
      'string.empty': 'Estado é obrigatório',
      'string.length': 'Estado deve ter 2 caracteres',
      'any.required': 'Estado é obrigatório'
    }),

  cep: Joi.string().pattern(/^\d{5}-\d{3}$/)
    .required()
    .messages({
      'string.base': 'CEP deve ser um texto',
      'string.empty': 'CEP é obrigatório',
      'string.pattern.base': 'CEP deve estar no formato 00000-000',
      'any.required': 'CEP é obrigatório'
    }),

  telefone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .messages({
      'string.base': 'Telefone deve ser um texto',
      'string.pattern.base': 'Telefone deve estar no formato (XX) XXXXX-XXXX'
    }),

  email: Joi.string().email()
    .messages({
      'string.base': 'Email deve ser um texto',
      'string.email': 'Email deve ser um endereço de email válido'
    }),

  data_fundacao: Joi.date()
    .messages({
      'date.base': 'Data de fundação deve ser uma data válida'
    }),

  area_total: Joi.number().positive()
    .messages({
      'number.base': 'Área total deve ser um número',
      'number.positive': 'Área total deve ser um número positivo'
    }),

  total_unidades: Joi.number().integer().positive()
    .messages({
      'number.base': 'Total de unidades deve ser um número',
      'number.integer': 'Total de unidades deve ser um número inteiro',
      'number.positive': 'Total de unidades deve ser um número positivo'
    }),

  sindico_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'ID do síndico deve ser um número',
      'number.integer': 'ID do síndico deve ser um número inteiro',
      'number.positive': 'ID do síndico deve ser um número positivo'
    }),

  ativo: Joi.boolean().default(true)
});

// Esquema de validação para atualização de condomínio
const schemaUpdate = Joi.object({
  nome: Joi.string().min(3).max(100),
  cnpj: Joi.string().custom((value, helpers) => {
    if (!validarCNPJ(value)) {
      return helpers.error('string.cnpjInvalido');
    }
    return value;
  }),
  endereco: Joi.string(),
  numero: Joi.string(),
  complemento: Joi.string().allow('', null),
  bairro: Joi.string(),
  cidade: Joi.string(),
  estado: Joi.string().length(2),
  cep: Joi.string().pattern(/^\d{5}-\d{3}$/),
  telefone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/),
  email: Joi.string().email(),
  data_fundacao: Joi.date(),
  area_total: Joi.number().positive(),
  total_unidades: Joi.number().integer().positive(),
  sindico_id: Joi.number().integer().positive(),
  ativo: Joi.boolean()
}).min(1);

module.exports = {
  schemaCreate,
  schemaUpdate
};