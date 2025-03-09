/**
 * Validadores para a entidade Fornecedor
 */
const Joi = require('joi');
const { validarCNPJ, validarCPF } = require('../utils/validators');

// Esquema de validação para criação de fornecedor
const schemaCreate = Joi.object({
  nome: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': 'Nome deve ser um texto',
      'string.empty': 'Nome é obrigatório',
      'string.min': 'Nome deve ter no mínimo {#limit} caracteres',
      'string.max': 'Nome deve ter no máximo {#limit} caracteres',
      'any.required': 'Nome é obrigatório'
    }),

  cnpj_cpf: Joi.string().required()
    .custom((value, helpers) => {
      // Verificar se é CNPJ ou CPF baseado no tamanho
      if (value.replace(/\D/g, '').length === 11) {
        if (!validarCPF(value)) {
          return helpers.error('string.cpfInvalido');
        }
      } else {
        if (!validarCNPJ(value)) {
          return helpers.error('string.cnpjInvalido');
        }
      }
      return value;
    })
    .messages({
      'string.base': 'CNPJ/CPF deve ser um texto',
      'string.empty': 'CNPJ/CPF é obrigatório',
      'string.cpfInvalido': 'CPF inválido',
      'string.cnpjInvalido': 'CNPJ inválido',
      'any.required': 'CNPJ/CPF é obrigatório'
    }),

  email: Joi.string().email().allow('', null)
    .messages({
      'string.base': 'Email deve ser um texto',
      'string.email': 'Email deve ser um endereço de email válido'
    }),

  telefone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).required()
    .messages({
      'string.base': 'Telefone deve ser um texto',
      'string.empty': 'Telefone é obrigatório',
      'string.pattern.base': 'Telefone deve estar no formato (XX) XXXXX-XXXX',
      'any.required': 'Telefone é obrigatório'
    }),

  endereco: Joi.string().allow('', null)
    .messages({
      'string.base': 'Endereço deve ser um texto'
    }),

  cidade: Joi.string().allow('', null)
    .messages({
      'string.base': 'Cidade deve ser um texto'
    }),

  estado: Joi.string().length(2).allow('', null)
    .messages({
      'string.base': 'Estado deve ser um texto',
      'string.length': 'Estado deve ter 2 caracteres (sigla)'
    }),

  cep: Joi.string().pattern(/^\d{5}-\d{3}$/).allow('', null)
    .messages({
      'string.base': 'CEP deve ser um texto',
      'string.pattern.base': 'CEP deve estar no formato XXXXX-XXX'
    }),

  categoria: Joi.string().valid('manutenção', 'limpeza', 'segurança', 'administração', 'outros').required()
    .messages({
      'string.base': 'Categoria deve ser um texto',
      'any.only': 'Categoria deve ser um valor válido',
      'any.required': 'Categoria é obrigatória'
    }),

  condominio_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID do condomínio deve ser um número',
      'number.integer': 'ID do condomínio deve ser um número inteiro',
      'number.positive': 'ID do condomínio deve ser um número positivo',
      'any.required': 'ID do condomínio é obrigatório'
    }),

  observacoes: Joi.string().max(500).allow('', null)
    .messages({
      'string.base': 'Observações deve ser um texto',
      'string.max': 'Observações deve ter no máximo {#limit} caracteres'
    }),

  website: Joi.string().uri().allow('', null)
    .messages({
      'string.base': 'Website deve ser um texto',
      'string.uri': 'Website deve ser uma URL válida'
    }),

  contato_nome: Joi.string().allow('', null)
    .messages({
      'string.base': 'Nome do contato deve ser um texto'
    }),

  contato_email: Joi.string().email().allow('', null)
    .messages({
      'string.base': 'Email do contato deve ser um texto',
      'string.email': 'Email do contato deve ser um endereço de email válido'
    }),

  contato_telefone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).allow('', null)
    .messages({
      'string.base': 'Telefone do contato deve ser um texto',
      'string.pattern.base': 'Telefone do contato deve estar no formato (XX) XXXXX-XXXX'
    })
});

// Esquema de validação para atualização de fornecedor
const schemaUpdate = Joi.object({
  nome: Joi.string().min(3).max(100)
    .messages({
      'string.base': 'Nome deve ser um texto',
      'string.min': 'Nome deve ter no mínimo {#limit} caracteres',
      'string.max': 'Nome deve ter no máximo {#limit} caracteres'
    }),

  cnpj_cpf: Joi.string()
    .custom((value, helpers) => {
      if (!value) return value;
      
      // Verificar se é CNPJ ou CPF baseado no tamanho
      if (value.replace(/\D/g, '').length === 11) {
        if (!validarCPF(value)) {
          return helpers.error('string.cpfInvalido');
        }
      } else {
        if (!validarCNPJ(value)) {
          return helpers.error('string.cnpjInvalido');
        }
      }
      return value;
    })
    .messages({
      'string.base': 'CNPJ/CPF deve ser um texto',
      'string.cpfInvalido': 'CPF inválido',
      'string.cnpjInvalido': 'CNPJ inválido'
    }),

  email: Joi.string().email().allow('', null)
    .messages({
      'string.base': 'Email deve ser um texto',
      'string.email': 'Email deve ser um endereço de email válido'
    }),

  telefone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .messages({
      'string.base': 'Telefone deve ser um texto',
      'string.pattern.base': 'Telefone deve estar no formato (XX) XXXXX-XXXX'
    }),

  endereco: Joi.string().allow('', null)
    .messages({
      'string.base': 'Endereço deve ser um texto'
    }),

  cidade: Joi.string().allow('', null)
    .messages({
      'string.base': 'Cidade deve ser um texto'
    }),

  estado: Joi.string().length(2).allow('', null)
    .messages({
      'string.base': 'Estado deve ser um texto',
      'string.length': 'Estado deve ter 2 caracteres (sigla)'
    }),

  cep: Joi.string().pattern(/^\d{5}-\d{3}$/).allow('', null)
    .messages({
      'string.base': 'CEP deve ser um texto',
      'string.pattern.base': 'CEP deve estar no formato XXXXX-XXX'
    }),

  categoria: Joi.string().valid('manutenção', 'limpeza', 'segurança', 'administração', 'outros')
    .messages({
      'string.base': 'Categoria deve ser um texto',
      'any.only': 'Categoria deve ser um valor válido'
    }),

  observacoes: Joi.string().max(500).allow('', null)
    .messages({
      'string.base': 'Observações deve ser um texto',
      'string.max': 'Observações deve ter no máximo {#limit} caracteres'
    }),

  website: Joi.string().uri().allow('', null)
    .messages({
      'string.base': 'Website deve ser um texto',
      'string.uri': 'Website deve ser uma URL válida'
    }),

  contato_nome: Joi.string().allow('', null)
    .messages({
      'string.base': 'Nome do contato deve ser um texto'
    }),

  contato_email: Joi.string().email().allow('', null)
    .messages({
      'string.base': 'Email do contato deve ser um texto',
      'string.email': 'Email do contato deve ser um endereço de email válido'
    }),

  contato_telefone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).allow('', null)
    .messages({
      'string.base': 'Telefone do contato deve ser um texto',
      'string.pattern.base': 'Telefone do contato deve estar no formato (XX) XXXXX-XXXX'
    })
});

module.exports = {
  schemaCreate,
  schemaUpdate
};