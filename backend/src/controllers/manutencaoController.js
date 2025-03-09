const { Manutencao, Condominio, Fornecedor, Inventario } = require('../models');
const logger = require('../config/logger');
const sequelize = require('../config/database');

/**
 * Controller para gerenciamento de manutenções
 */
const manutencaoController = {
  /**
   * Listar todas as manutenções
   * @route GET /api/manutencoes
   */
  listar: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, status, prioridade, condominio_id, fornecedor_id, search } = req.query;
      const offset = (page - 1) * limit;

      // Construir query de filtro
      const where = {};
      
      if (status) {
        where.status = status;
      }
      
      if (prioridade) {
        where.prioridade = prioridade;
      }
      
      if (condominio_id) {
        where.condominio_id = condominio_id;
      }
      
      if (fornecedor_id) {
        where.fornecedor_id = fornecedor_id;
      }
      
      if (search) {
        where[sequelize.Op.or] = [
          { titulo: { [sequelize.Op.like]: `%${search}%` } },
          { descricao: { [sequelize.Op.like]: `%${search}%` } },
          { local: { [sequelize.Op.like]: `%${search}%` } }
        ];
      }

      // Buscar manutenções com paginação
      const { count, rows } = await Manutencao.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ['prioridade', 'ASC'],
          ['data_solicitacao', 'DESC']
        ],
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          },
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome', 'telefone']
          },
          {
            model: Inventario,
            as: 'item',
            attributes: ['id', 'nome', 'codigo_patrimonio']
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
   * Obter detalhes de uma manutenção específica
   * @route GET /api/manutencoes/:id
   */
  obter: async (req, res, next) => {
    try {
      const { id } = req.params;

      const manutencao = await Manutencao.findByPk(id, {
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          },
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome', 'cnpj_cpf', 'telefone', 'email', 'contato_nome']
          },
          {
            model: Inventario,
            as: 'item',
            attributes: ['id', 'nome', 'codigo_patrimonio', 'numero_serie', 'categoria']
          }
        ]
      });

      if (!manutencao) {
        return res.status(404).json({
          status: 'error',
          message: 'Manutenção não encontrada'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: manutencao
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Criar nova manutenção
   * @route POST /api/manutencoes
   */
  criar: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const {
        titulo,
        descricao,
        tipo,
        prioridade,
        status,
        data_solicitacao,
        data_agendamento,
        data_conclusao,
        custo_estimado,
        custo_real,
        local,
        observacoes,
        condominio_id,
        fornecedor_id,
        item_id
      } = req.body;

      // Verificar se o condomínio existe
      if (condominio_id) {
        const condominio = await Condominio.findByPk(condominio_id, { transaction });
        
        if (!condominio) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: 'Condomínio não encontrado'
          });
        }
      }

      // Verificar se o fornecedor existe, se fornecido
      if (fornecedor_id) {
        const fornecedor = await Fornecedor.findByPk(fornecedor_id, { transaction });
        
        if (!fornecedor) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: 'Fornecedor não encontrado'
          });
        }
      }

      // Verificar se o item existe, se fornecido
      if (item_id) {
        const item = await Inventario.findByPk(item_id, { transaction });
        
        if (!item) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: 'Item de inventário não encontrado'
          });
        }
      }

      // Criar a manutenção
      const novaManutencao = await Manutencao.create({
        titulo,
        descricao,
        tipo: tipo || 'corretiva',
        prioridade: prioridade || 'media',
        status: status || 'pendente',
        data_solicitacao: data_solicitacao || new Date(),
        data_agendamento,
        data_conclusao,
        custo_estimado,
        custo_real,
        local,
        observacoes,
        condominio_id,
        fornecedor_id,
        item_id
      }, { transaction });

      await transaction.commit();

      logger.info(`Nova manutenção criada: ${titulo} (ID: ${novaManutencao.id})`);

      return res.status(201).json({
        status: 'success',
        message: 'Manutenção criada com sucesso',
        data: novaManutencao
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Atualizar uma manutenção
   * @route PUT /api/manutencoes/:id
   */
  atualizar: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        titulo,
        descricao,
        tipo,
        prioridade,
        status,
        data_agendamento,
        data_conclusao,
        custo_estimado,
        custo_real,
        local,
        observacoes,
        fornecedor_id
      } = req.body;

      // Verificar se a manutenção existe
      const manutencao = await Manutencao.findByPk(id, { transaction });
      if (!manutencao) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Manutenção não encontrada'
        });
      }

      // Verificar se o fornecedor existe, se fornecido
      if (fornecedor_id && fornecedor_id !== manutencao.fornecedor_id) {
        const fornecedor = await Fornecedor.findByPk(fornecedor_id, { transaction });
        
        if (!fornecedor) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: 'Fornecedor não encontrado'
          });
        }
      }

      // Atualizar os campos fornecidos
      if (titulo !== undefined) manutencao.titulo = titulo;
      if (descricao !== undefined) manutencao.descricao = descricao;
      if (tipo !== undefined) manutencao.tipo = tipo;
      if (prioridade !== undefined) manutencao.prioridade = prioridade;
      if (status !== undefined) manutencao.status = status;
      if (data_agendamento !== undefined) manutencao.data_agendamento = data_agendamento;
      if (data_conclusao !== undefined) manutencao.data_conclusao = data_conclusao;
      if (custo_estimado !== undefined) manutencao.custo_estimado = custo_estimado;
      if (custo_real !== undefined) manutencao.custo_real = custo_real;
      if (local !== undefined) manutencao.local = local;
      if (observacoes !== undefined) manutencao.observacoes = observacoes;
      if (fornecedor_id !== undefined) manutencao.fornecedor_id = fornecedor_id;

      // Se o status for alterado para 'concluido', definir a data de conclusão
      if (status === 'concluido' && !manutencao.data_conclusao) {
        manutencao.data_conclusao = new Date();
      }

      await manutencao.save({ transaction });
      await transaction.commit();

      logger.info(`Manutenção atualizada: ${manutencao.titulo} (ID: ${manutencao.id})`);

      return res.status(200).json({
        status: 'success',
        message: 'Manutenção atualizada com sucesso',
        data: manutencao
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Excluir uma manutenção
   * @route DELETE /api/manutencoes/:id
   */
  excluir: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      // Verificar se a manutenção existe
      const manutencao = await Manutencao.findByPk(id, { transaction });
      if (!manutencao) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Manutenção não encontrada'
        });
      }

      // Excluir a manutenção
      await manutencao.destroy({ transaction });

      await transaction.commit();

      logger.info(`Manutenção excluída: ${manutencao.titulo} (ID: ${manutencao.id})`);

      return res.status(200).json({
        status: 'success',
        message: 'Manutenção excluída com sucesso'
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Listar manutenções por condomínio
   * @route GET /api/condominios/:condominioId/manutencoes
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

      // Buscar manutenções
      const { count, rows } = await Manutencao.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ['prioridade', 'ASC'],
          ['data_solicitacao', 'DESC']
        ],
        include: [
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome']
          },
          {
            model: Inventario,
            as: 'item',
            attributes: ['id', 'nome', 'codigo_patrimonio']
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
   * Obter estatísticas de manutenções
   * @route GET /api/manutencoes/estatisticas
   */
  estatisticas: async (req, res, next) => {
    try {
      const { condominio_id } = req.query;
      
      // Filtro por condomínio se fornecido
      const where = {};
      if (condominio_id) {
        where.condominio_id = condominio_id;
      }
      
      // Estatísticas por status
      const statusCount = await Manutencao.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        where,
        group: ['status']
      });
      
      // Estatísticas por prioridade
      const prioridadeCount = await Manutencao.findAll({
        attributes: [
          'prioridade',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        where,
        group: ['prioridade']
      });
      
      // Estatísticas por tipo
      const tipoCount = await Manutencao.findAll({
        attributes: [
          'tipo',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        where,
        group: ['tipo']
      });
      
      // Custo total
      const custoTotal = await Manutencao.sum('custo_real', {
        where: {
          ...where,
          custo_real: { [sequelize.Op.not]: null }
        }
      });
      
      // Manutenções recentes (últimos 30 dias)
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);
      
      const recentes = await Manutencao.count({
        where: {
          ...where,
          data_solicitacao: { [sequelize.Op.gte]: dataLimite }
        }
      });
      
      return res.status(200).json({
        status: 'success',
        data: {
          por_status: statusCount,
          por_prioridade: prioridadeCount,
          por_tipo: tipoCount,
          custo_total: custoTotal || 0,
          recentes
        }
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = manutencaoController;