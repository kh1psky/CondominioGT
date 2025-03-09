/**
 * Validadores para a entidade Usuário
 */
const Joi = require('joi');
const { validarCPF } = require('../utils/validators');

// Esquema de validação para criação de usuário
const schemaCreate = Joi.object({
  nome: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': 'Nome deve ser um texto',
      'string.empty': 'Nome é obrigatório',
      'string.min': 'Nome deve ter no mínimo {#limit} caracteres',
      'string.max': 'Nome deve ter no máximo {#limit} caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  
  email: Joi.string().email().required()
    .messages({
      'string.base': 'Email deve ser um texto',
      'string.empty': 'Email é obrigatório',
      'string.email': 'Email deve ser um endereço de email válido',
      'any.required': 'Email é obrigatório'
    }),
  
  senha: Joi.string().min(6).required()
    .messages({
      'string.base': 'Senha deve ser um texto',
      'string.empty': 'Senha é obrigatória',
      'string.min': 'Senha deve ter no mínimo {#limit} caracteres',
      'any.required': 'Senha é obrigatória'
    }),
  
  cpf: Joi.string()
    .custom((value, helpers) => {
      if (!validarCPF(value)) {
        return helpers.error('string.cpfInvalido');
      }
      return value;
    })
    .messages({
      'string.base': 'CPF deve ser um texto',
      'string.empty': 'CPF é obrigatório',
      'string.cpfInvalido': 'CPF inválido'
    }),
  
  telefone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .messages({
      'string.base': 'Telefone deve ser um texto',
      'string.pattern.base': 'Telefone deve estar no formato (XX) XXXXX-XXXX'
    }),
  
  tipo: Joi.string().valid('admin', 'sindico', 'morador', 'funcionario')
    .default('morador')
    .messages({
      'string.base': 'Tipo deve ser um texto',
      'any.only': 'Tipo deve ser um dos seguintes valores: admin, sindico, morador, funcionario'
    }),
  
  condominio_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'ID do condomínio deve ser um número',
      'number.integer': 'ID do condomínio deve ser um número inteiro',
      'number.positive': 'ID do condomínio deve ser um número positivo'
    }),
  
  unidade_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'ID da unidade deve ser um número',
      'number.integer': 'ID da unidade deve ser um número inteiro',
      'number.positive': 'ID da unidade deve ser um número positivo'
    }),
  
  ativo: Joi.boolean().default(true)
});

// Esquema de validação para atualização de usuário
const schemaUpdate = Joi.object({
  nome: Joi.string().min(3).max(100)
    .messages({
      'string.base': 'Nome deve ser um texto',
      'string.min': 'Nome deve ter no mínimo {#limit} caracteres',
      'string.max': 'Nome deve ter no máximo {#limit} caracteres'
    }),
  
  email: Joi.string().email()
    .messages({
      'string.base': 'Email deve ser um texto',
      'string.email': 'Email deve ser um endereço de email válido'
    }),
  
  senha: Joi.string().min(6)
    .messages({
      'string.base': 'Senha deve ser um texto',
      'string.min': 'Senha deve ter no mínimo {#limit} caracteres'
    }),
  
  cpf: Joi.string()
    .custom((value, helpers) => {
      if (!validarCPF(value)) {
        return helpers.error('string.cpfInvalido');
      }
      return value;
    })
    .messages({
      'string.base': 'CPF deve ser um texto',
      'string.cpfInvalido': 'CPF inválido'
    }),
  
  telefone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .messages({
      'string.base': 'Telefone deve ser um texto',
      'string.pattern.base': 'Telefone deve estar no formato (XX) XXXXX-XXXX'
    }),
  
  tipo: Joi.string().valid('admin', 'sindico', 'morador', 'funcionario')
    .messages({
      'string.base': 'Tipo deve ser um texto',
      'any.only': 'Tipo deve ser um dos seguintes valores: admin, sindico, morador, funcionario'
    }),
  
  condominio_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'ID do condomínio deve ser um número',
      'number.integer': 'ID do condomínio deve ser um número inteiro',
      'number.positive': 'ID do condomínio deve ser um número positivo'
    }),
  
  unidade_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'ID da unidade deve ser um número',
      'number.integer': 'ID da unidade deve ser um número inteiro',
      'number.positive': 'ID da unidade deve ser um número positivo'
    }),
  
  ativo: Joi.boolean()
});

// Esquema de validação para login
const schemaLogin = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.base': 'Email deve ser um texto',
      'string.empty': 'Email é obrigatório',
      'string.email': 'Email deve ser um endereço de email válido',
      'any.required': 'Email é obrigatório'
    }),
  
  senha: Joi.string().required()
    .messages({
      'string.base': 'Senha deve ser um texto',
      'string.empty': 'Senha é obrigatória',
      'any.required': 'Senha é obrigatória'
    })
});

module.exports = {
  schemaCreate,
  schemaUpdate,
  schemaLogin
};