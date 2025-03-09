const { Contrato, Fornecedor, Condominio } = require('../models');
const logger = require('../config/logger');
const sequelize = require('../config/database');

/**
 * Controller para gerenciamento de contratos
 */
const contratoController = {
  /**
   * Listar todos os contratos
   * @route GET /api/contratos
   */
  listar: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, status, condominio_id, fornecedor_id, search } = req.query;
      const offset = (page - 1) * limit;

      // Construir query de filtro
      const where = {};
      
      if (status) {
        where.status = status;
      }
      
      if (condominio_id) {
        where.condominio_id = condominio_id;
      }
      
      if (fornecedor_id) {
        where.fornecedor_id = fornecedor_id;
      }
      
      if (search) {
        where[sequelize.Op.or] = [
          { numero_contrato: { [sequelize.Op.like]: `%${search}%` } },
          { objeto: { [sequelize.Op.like]: `%${search}%` } }
        ];
      }

      // Buscar contratos com paginação
      const { count, rows } = await Contrato.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_inicio', 'DESC']],
        include: [
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome', 'cnpj_cpf']
          },
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          }
        ]
      });

      return res.status(200).json({
        status: 'success',
        data: rows,
        meta: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Obter detalhes de um contrato específico
   * @route GET /api/contratos/:id
   */
  obter: async (req, res, next) => {
    try {
      const { id } = req.params;

      const contrato = await Contrato.findByPk(id, {
        include: [
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome', 'cnpj_cpf', 'telefone', 'email', 'contato_nome']
          },
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          }
        ]
      });

      if (!contrato) {
        return res.status(404).json({
          status: 'error',
          message: 'Contrato não encontrado'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: contrato
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Criar novo contrato
   * @route POST /api/contratos
   */
  criar: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const {
        fornecedor_id,
        condominio_id,
        numero_contrato,
        objeto,
        valor,
        data_inicio,
        data_fim,
        status,
        forma_pagamento,
        dia_vencimento,
        periodicidade,
        arquivo_contrato,
        observacoes,
        renovacao_automatica,
        prazo_renovacao,
        notificar_vencimento,
        dias_notificacao
      } = req.body;

      // Verificar se o fornecedor existe
      const fornecedor = await Fornecedor.findByPk(fornecedor_id, { transaction });
      if (!fornecedor) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Fornecedor não encontrado'
        });
      }

      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominio_id, { transaction });
      if (!condominio) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }

      // Verificar se já existe um contrato com o mesmo número
      const contratoExistente = await Contrato.findOne({
        where: { numero_contrato },
        transaction
      });

      if (contratoExistente) {
        await transaction.rollback();
        return res.status(409).json({
          status: 'error',
          message: 'Já existe um contrato com este número'
        });
      }

      // Criar o contrato
      const novoContrato = await Contrato.create({
        fornecedor_id,
        condominio_id,
        numero_contrato,
        objeto,
        valor,
        data_inicio,
        data_fim,
        status: status || 'ativo',
        forma_pagamento,
        dia_vencimento,
        periodicidade: periodicidade || 'mensal',
        arquivo_contrato,
        observacoes,
        renovacao_automatica: renovacao_automatica || false,
        prazo_renovacao,
        notificar_vencimento: notificar_vencimento || true,
        dias_notificacao: dias_notificacao || 30,
        criado_por: req.user ? req.user.id : null
      }, { transaction });

      await transaction.commit();

      logger.info(`Novo contrato criado: ${numero_contrato} (ID: ${novoContrato.id})`);

      return res.status(201).json({
        status: 'success',
        message: 'Contrato criado com sucesso',
        data: novoContrato
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Atualizar um contrato
   * @route PUT /api/contratos/:id
   */
  atualizar: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        objeto,
        valor,
        data_inicio,
        data_fim,
        status,
        forma_pagamento,
        dia_vencimento,
        periodicidade,
        arquivo_contrato,
        observacoes,
        renovacao_automatica,
        prazo_renovacao,
        notificar_vencimento,
        dias_notificacao
      } = req.body;

      // Verificar se o contrato existe
      const contrato = await Contrato.findByPk(id, { transaction });
      if (!contrato) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Contrato não encontrado'
        });
      }

      // Atualizar os campos fornecidos
      if (objeto !== undefined) contrato.objeto = objeto;
      if (valor !== undefined) contrato.valor = valor;
      if (data_inicio !== undefined) contrato.data_inicio = data_inicio;
      if (data_fim !== undefined) contrato.data_fim = data_fim;
      if (status !== undefined) contrato.status = status;
      if (forma_pagamento !== undefined) contrato.forma_pagamento = forma_pagamento;
      if (dia_vencimento !== undefined) contrato.dia_vencimento = dia_vencimento;
      if (periodicidade !== undefined) contrato.periodicidade = periodicidade;
      if (arquivo_contrato !== undefined) contrato.arquivo_contrato = arquivo_contrato;
      if (observacoes !== undefined) contrato.observacoes = observacoes;
      if (renovacao_automatica !== undefined) contrato.renovacao_automatica = renovacao_automatica;
      if (prazo_renovacao !== undefined) contrato.prazo_renovacao = prazo_renovacao;
      if (notificar_vencimento !== undefined) contrato.notificar_vencimento = notificar_vencimento;
      if (dias_notificacao !== undefined) contrato.dias_notificacao = dias_notificacao;
      
      // Registrar quem atualizou
      if (req.user) {
        contrato.atualizado_por = req.user.id;
      }

      await contrato.save({ transaction });
      await transaction.commit();

      logger.info(`Contrato atualizado: ${contrato.numero_contrato} (ID: ${contrato.id})`);

      return res.status(200).json({
        status: 'success',
        message: 'Contrato atualizado com sucesso',
        data: contrato
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Excluir um contrato
   * @route DELETE /api/contratos/:id
   */
  excluir: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      // Verificar se o contrato existe
      const contrato = await Contrato.findByPk(id, { transaction });
      if (!contrato) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Contrato não encontrado'
        });
      }

      // Excluir o contrato
      await contrato.destroy({ transaction });

      await transaction.commit();

      logger.info(`Contrato excluído: ${contrato.numero_contrato} (ID: ${contrato.id})`);

      return res.status(200).json({
        status: 'success',
        message: 'Contrato excluído com sucesso'
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Listar contratos por condomínio
   * @route GET /api/condominios/:condominioId/contratos
   */
  listarPorCondominio: async (req, res, next) => {
    try {
      const { condominioId } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominioId);
      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }

      // Construir query de filtro
      const where = { condominio_id: condominioId };
      
      if (status) {
        where.status = status;
      }

      // Buscar contratos
      const { count, rows } = await Contrato.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_inicio', 'DESC']],
        include: [
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome', 'cnpj_cpf']
          }
        ]
      });

      return res.status(200).json({
        status: 'success',
        data: rows,
        meta: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Listar contratos por fornecedor
   * @route GET /api/fornecedores/:fornecedorId/contratos
   */
  listarPorFornecedor: async (req, res, next) => {
    try {
      const { fornecedorId } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      // Verificar se o fornecedor existe
      const fornecedor = await Fornecedor.findByPk(fornecedorId);
      if (!fornecedor) {
        return res.status(404).json({
          status: 'error',
          message: 'Fornecedor não encontrado'
        });
      }

      // Construir query de filtro
      const where = { fornecedor_id: fornecedorId };
      
      if (status) {
        where.status = status;
      }

      // Buscar contratos
      const { count, rows } = await Contrato.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_inicio', 'DESC']],
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          }
        ]
      });

      return res.status(200).json({
        status: 'success',
        data: rows,
        meta: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = contratoController;