const { Notificacao, Usuario, Condominio } = require('../models');
const logger = require('../config/logger');
const sequelize = require('../config/database');
const notificacaoService = require('../services/notificacaoService');

/**
 * Controller para gerenciamento de notificações
 */
const notificacaoController = {
  /**
   * Listar todas as notificações
   * @route GET /api/notificacoes
   */
  listar: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, tipo, status, condominio_id, usuario_id } = req.query;
      const offset = (page - 1) * limit;

      // Construir query de filtro
      const where = {};
      
      if (tipo) {
        where.tipo = tipo;
      }
      
      if (status) {
        where.status = status;
      }
      
      if (condominio_id) {
        where.condominio_id = condominio_id;
      }
      
      if (usuario_id) {
        where.usuario_id = usuario_id;
      }

      // Buscar notificações com paginação
      const { count, rows } = await Notificacao.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_criacao', 'DESC']],
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nome', 'email']
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
   * Obter detalhes de uma notificação específica
   * @route GET /api/notificacoes/:id
   */
  obter: async (req, res, next) => {
    try {
      const { id } = req.params;

      const notificacao = await Notificacao.findByPk(id, {
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          }
        ]
      });

      if (!notificacao) {
        return res.status(404).json({
          status: 'error',
          message: 'Notificação não encontrada'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: notificacao
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Criar nova notificação
   * @route POST /api/notificacoes
   */
  criar: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const {
        titulo,
        mensagem,
        tipo,
        prioridade,
        data_expiracao,
        enviar_email,
        enviar_push,
        usuario_id,
        condominio_id,
        dados_adicionais
      } = req.body;

      // Verificar se o usuário existe, se fornecido
      if (usuario_id) {
        const usuario = await Usuario.findByPk(usuario_id, { transaction });
        
        if (!usuario) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: 'Usuário não encontrado'
          });
        }
      }

      // Verificar se o condomínio existe, se fornecido
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

      // Criar a notificação
      const novaNotificacao = await Notificacao.create({
        titulo,
        mensagem,
        tipo: tipo || 'informacao',
        prioridade: prioridade || 'normal',
        status: 'nao_lida',
        data_criacao: new Date(),
        data_expiracao,
        usuario_id,
        condominio_id,
        dados_adicionais: dados_adicionais ? JSON.stringify(dados_adicionais) : null
      }, { transaction });

      await transaction.commit();

      // Enviar notificação por email ou push se solicitado
      if (enviar_email === true || enviar_email === 'true') {
        try {
          await notificacaoService.enviarPorEmail(novaNotificacao.id);
        } catch (emailError) {
          logger.error(`Erro ao enviar notificação por email: ${emailError.message}`);
        }
      }

      if (enviar_push === true || enviar_push === 'true') {
        try {
          await notificacaoService.enviarPorPush(novaNotificacao.id);
        } catch (pushError) {
          logger.error(`Erro ao enviar notificação push: ${pushError.message}`);
        }
      }

      logger.info(`Nova notificação criada: ${titulo} (ID: ${novaNotificacao.id})`);

      return res.status(201).json({
        status: 'success',
        message: 'Notificação criada com sucesso',
        data: novaNotificacao
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Marcar notificação como lida
   * @route PUT /api/notificacoes/:id/ler
   */
  marcarComoLida: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      // Verificar se a notificação existe
      const notificacao = await Notificacao.findByPk(id, { transaction });
      if (!notificacao) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Notificação não encontrada'
        });
      }

      // Verificar se o usuário tem permissão para marcar esta notificação como lida
      // Exemplo: verificar se a notificação pertence ao usuário logado
      // if (notificacao.usuario_id !== req.user.id) {
      //   await transaction.rollback();
      //   return res.status(403).json({
      //     status: 'error',
      //     message: 'Você não tem permissão para marcar esta notificação como lida'
      //   });
      // }

      // Atualizar o status da notificação
      notificacao.status = 'lida';
      notificacao.data_leitura = new Date();

      await notificacao.save({ transaction });
      await transaction.commit();

      return res.status(200).json({
        status: 'success',
        message: 'Notificação marcada como lida',
        data: notificacao
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Excluir uma notificação
   * @route DELETE /api/notificacoes/:id
   */
  excluir: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      // Verificar se a notificação existe
      const notificacao = await Notificacao.findByPk(id, { transaction });
      if (!notificacao) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Notificação não encontrada'
        });
      }

      // Verificar se o usuário tem permissão para excluir esta notificação
      // Exemplo: verificar se a notificação pertence ao usuário logado ou se é admin
      // if (notificacao.usuario_id !== req.user.id && req.user.role !== 'admin') {
      //   await transaction.rollback();
      //   return res.status(403).json({
      //     status: 'error',
      //     message: 'Você não tem permissão para excluir esta notificação'
      //   });
      // }

      // Excluir a notificação
      await notificacao.destroy({ transaction });

      await transaction.commit();

      logger.info(`Notificação excluída: ID ${id}`);

      return res.status(200).json({
        status: 'success',
        message: 'Notificação excluída com sucesso'
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Listar notificações por usuário
   * @route GET /api/usuarios/:usuarioId/notificacoes
   */
  listarPorUsuario: async (req, res, next) => {
    try {
      const { usuarioId } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      // Verificar se o usuário existe
      const usuario = await Usuario.findByPk(usuarioId);
      if (!usuario) {
        return res.status(404).json({
          status: 'error',
          message: 'Usuário não encontrado'
        });
      }

      // Construir query de filtro
      const where = { usuario_id: usuarioId };
      
      if (status) {
        where.status = status;
      }

      // Buscar notificações
      const { count, rows } = await Notificacao.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_criacao', 'DESC']],
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
          pages: Math.ceil(count / limit),
          nao_lidas: await Notificacao.count({ where: { usuario_id: usuarioId, status: 'nao_lida' } })
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Enviar notificação para todos os usuários de um condomínio
   * @route POST /api/condominios/:condominioId/notificacoes
   */
  enviarParaCondominio: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { condominioId } = req.params;
      const {
        titulo,
        mensagem,
        tipo,
        prioridade,
        data_expiracao,
        enviar_email,
        enviar_push,
        dados_adicionais
      } = req.body;

      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominioId, { transaction });
      if (!condominio) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }

      // Buscar todos os usuários do condomínio
      // Nota: Esta lógica depende da implementação do relacionamento entre usuários e condomínios
      const usuarios = await Usuario.findAll({
        include: [
          {
            model: Condominio,
            as: 'condominios',
            where: { id: condominioId },
            attributes: []
          }
        ],
        transaction
      });

      if (usuarios.length === 0) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Nenhum usuário encontrado para este condomínio'
        });
      }

      // Criar notificações para cada usuário
      const notificacoesCriadas = [];
      for (const usuario of usuarios) {
        const notificacao = await Notificacao.create({
          titulo,
          mensagem,
          tipo: tipo || 'informacao',
          prioridade: prioridade || 'normal',
          status: 'nao_lida',
          data_criacao: new Date(),
          data_expiracao,
          usuario_id: usuario.id,
          condominio_id: condominioId,
          dados_adicionais: dados_adicionais ? JSON.stringify(dados_adicionais) : null
        }, { transaction });

        notificacoesCriadas.push(notificacao);
      }

      await transaction.commit();

      // Enviar notificações por email ou push se solicitado
      if (enviar_email === true || enviar_email === 'true') {
        try {
          for (const notificacao of notificacoesCriadas) {
            await notificacaoService.enviarPorEmail(notificacao.id);
          }
        } catch (emailError) {
          logger.error(`Erro ao enviar notificações por email: ${emailError.message}`);
        }
      }

      if (enviar_push === true || enviar_push === 'true') {
        try {
          for (const notificacao of notificacoesCriadas) {
            await notificacaoService.enviarPorPush(notificacao.id);
          }
        } catch (pushError) {
          logger.error(`Erro ao enviar notificações push: ${pushError.message}`);
        }
      }

      logger.info(`${notificacoesCriadas.length} notificações enviadas para o condomínio ID: ${condominioId}`);

      return res.status(201).json({
        status: 'success',
        message: `${notificacoesCriadas.length} notificações enviadas com sucesso`,
        data: {
          total: notificacoesCriadas.length,
          condominio_id: condominioId
        }
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  }
};

module.exports = notificacaoController;