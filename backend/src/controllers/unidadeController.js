const { Unidade, Condominio, Usuario } = require('../models');
const logger = require('../config/logger');
const sequelize = require('../config/database');

/**
 * Controller para gerenciamento de unidades (apartamentos/casas)
 */
const unidadeController = {
  /**
   * Listar todas as unidades de um condomínio
   * @route GET /api/condominios/:condominioId/unidades
   */
  listarPorCondominio: async (req, res, next) => {
    try {
      const { condominioId } = req.params;
      const { page = 1, limit = 10, status, bloco, numero } = req.query;
      const offset = (page - 1) * limit;

      // Construir query de filtro
      const where = { condominio_id: condominioId };
      if (status) {
        where.status = status;
      }
      if (bloco) {
        where.bloco = bloco;
      }
      if (numero) {
        where.numero = { [sequelize.Op.like]: `%${numero}%` };
      }

      // Buscar unidades com paginação
      const { count, rows } = await Unidade.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ['bloco', 'ASC'],
          ['numero', 'ASC']
        ],
        include: [
          {
            model: Usuario,
            as: 'proprietario',
            attributes: ['id', 'nome', 'email', 'telefone']
          },
          {
            model: Usuario,
            as: 'morador',
            attributes: ['id', 'nome', 'email', 'telefone']
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
   * Obter detalhes de uma unidade específica
   * @route GET /api/unidades/:id
   */
  obter: async (req, res, next) => {
    try {
      const { id } = req.params;

      const unidade = await Unidade.findByPk(id, {
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          },
          {
            model: Usuario,
            as: 'proprietario',
            attributes: ['id', 'nome', 'email', 'telefone']
          },
          {
            model: Usuario,
            as: 'morador',
            attributes: ['id', 'nome', 'email', 'telefone']
          }
        ]
      });

      if (!unidade) {
        return res.status(404).json({
          status: 'error',
          message: 'Unidade não encontrada'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: unidade
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Criar nova unidade
   * @route POST /api/unidades
   */
  criar: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const {
        condominio_id, bloco, numero, tipo, area, quartos,
        banheiros, vagas_garagem, proprietario_id, morador_id,
        status, observacoes, valor_aluguel
      } = req.body;

      // Verificar se o condomínio existe
      const condominio = await Condominio.findByPk(condominio_id, { transaction });
      if (!condominio) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }

      // Verificar se já existe uma unidade com mesmo bloco/número no condomínio
      const unidadeExistente = await Unidade.findOne({
        where: {
          condominio_id,
          bloco,
          numero
        },
        transaction
      });

      if (unidadeExistente) {
        await transaction.rollback();
        return res.status(409).json({
          status: 'error',
          message: 'Já existe uma unidade com este bloco e número neste condomínio'
        });
      }

      // Se proprietario_id informado, verificar se existe
      if (proprietario_id) {
        const proprietario = await Usuario.findByPk(proprietario_id, { transaction });
        if (!proprietario) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: 'Proprietário não encontrado'
          });
        }
      }

      // Se morador_id informado, verificar se existe
      if (morador_id) {
        const morador = await Usuario.findByPk(morador_id, { transaction });
        if (!morador) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: 'Morador não encontrado'
          });
        }
      }

      // Criar a unidade
      const novaUnidade = await Unidade.create({
        condominio_id,
        bloco,
        numero,
        tipo: tipo || 'apartamento',
        area,
        quartos,
        banheiros,
        vagas_garagem,
        proprietario_id,
        morador_id,
        status: status || 'vago',
        observacoes,
        valor_aluguel
      }, { transaction });

      // Atualizar contador de unidades no condomínio
      await Condominio.increment('total_unidades', {
        by: 1,
        where: { id: condominio_id },
        transaction
      });

      await transaction.commit();

      logger.info(`Nova unidade criada: Bloco ${bloco}, Número ${numero} (Condomínio ID: ${condominio_id})`);

      return res.status(201).json({
        status: 'success',
        message: 'Unidade criada com sucesso',
        data: novaUnidade
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Atualizar uma unidade
   * @route PUT /api/unidades/:id
   */
  atualizar: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        bloco, numero, tipo, area, quartos, banheiros,
        vagas_garagem, proprietario_id, morador_id,
        status, observacoes, valor_aluguel, data_ocupacao, data_desocupacao
      } = req.body;

      // Verificar se a unidade existe
      const unidade = await Unidade.findByPk(id, { transaction });
      if (!unidade) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Unidade não encontrada'
        });
      }

      // Verificar se o número/bloco está sendo alterado e, se sim, verificar se já existe
      if ((bloco !== undefined && bloco !== unidade.bloco) || 
          (numero !== undefined && numero !== unidade.numero)) {
        const unidadeExistente = await Unidade.findOne({
          where: {
            condominio_id: unidade.condominio_id,
            bloco: bloco !== undefined ? bloco : unidade.bloco,
            numero: numero !== undefined ? numero : unidade.numero,
            id: { [sequelize.Op.ne]: id } // Excluir a própria unidade
          },
          transaction
        });

        if (unidadeExistente) {
          await transaction.rollback();
          return res.status(409).json({
            status: 'error',
            message: 'Já existe uma unidade com este bloco e número neste condomínio'
          });
        }
      }

      // Se proprietario_id informado, verificar se existe
      if (proprietario_id !== undefined && proprietario_id !== null) {
        const proprietario = await Usuario.findByPk(proprietario_id, { transaction });
        if (!proprietario) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: 'Proprietário não encontrado'
          });
        }
      }

      // Se morador_id informado, verificar se existe
      if (morador_id !== undefined && morador_id !== null) {
        const morador = await Usuario.findByPk(morador_id, { transaction });
        if (!morador) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: 'Morador não encontrado'
          });
        }
      }

      // Atualizar os campos fornecidos
      if (bloco !== undefined) unidade.bloco = bloco;
      if (numero !== undefined) unidade.numero = numero;
      if (tipo !== undefined) unidade.tipo = tipo;
      if (area !== undefined) unidade.area = area;
      if (quartos !== undefined) unidade.quartos = quartos;
      if (banheiros !== undefined) unidade.banheiros = banheiros;
      if (vagas_garagem !== undefined) unidade.vagas_garagem = vagas_garagem;
      if (proprietario_id !== undefined) unidade.proprietario_id = proprietario_id;
      if (morador_id !== undefined) unidade.morador_id = morador_id;
      if (status !== undefined) unidade.status = status;
      if (observacoes !== undefined) unidade.observacoes = observacoes;
      if (valor_aluguel !== undefined) unidade.valor_aluguel = valor_aluguel;
      if (data_ocupacao !== undefined) unidade.data_ocupacao = data_ocupacao;
      if (data_desocupacao !== undefined) unidade.data_desocupacao = data_desocupacao;

      await unidade.save({ transaction });
      await transaction.commit();

      logger.info(`Unidade atualizada: ID ${id}, Bloco ${unidade.bloco}, Número ${unidade.numero}`);

      return res.status(200).json({
        status: 'success',
        message: 'Unidade atualizada com sucesso',
        data: unidade
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Excluir uma unidade
   * @route DELETE /api/unidades/:id
   */
  excluir: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      // Verificar se a unidade existe
      const unidade = await Unidade.findByPk(id, { transaction });
      if (!unidade) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Unidade não encontrada'
        });
      }

      // Armazenar o condomínio_id para atualizar contador depois
      const condominioId = unidade.condominio_id;

      // Excluir a unidade
      await unidade.destroy({ transaction });

      // Decrementar contador de unidades no condomínio
      await Condominio.decrement('total_unidades', {
        by: 1,
        where: { id: condominioId },
        transaction
      });

      await transaction.commit();

      logger.info(`Unidade excluída: ID ${id}, Bloco ${unidade.bloco}, Número ${unidade.numero}`);

      return res.status(200).json({
        status: 'success',
        message: 'Unidade excluída com sucesso'
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Listar todas as unidades de um proprietário
   * @route GET /api/usuarios/:proprietarioId/unidades
   */
  listarPorProprietario: async (req, res, next) => {
    try {
      const { proprietarioId } = req.params;

      const unidades = await Unidade.findAll({
        where: { proprietario_id: proprietarioId },
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          },
          {
            model: Usuario,
            as: 'morador',
            attributes: ['id', 'nome', 'email', 'telefone']
          }
        ],
        order: [
          ['condominio_id', 'ASC'],
          ['bloco', 'ASC'],
          ['numero', 'ASC']
        ]
      });

      return res.status(200).json({
        status: 'success',
        data: unidades
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Listar todas as unidades de um morador
   * @route GET /api/usuarios/:moradorId/residencias
   */
  listarPorMorador: async (req, res, next) => {
    try {
      const { moradorId } = req.params;

      const unidades = await Unidade.findAll({
        where: { morador_id: moradorId },
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          },
          {
            model: Usuario,
            as: 'proprietario',
            attributes: ['id', 'nome', 'email', 'telefone']
          }
        ],
        order: [
          ['condominio_id', 'ASC'],
          ['bloco', 'ASC'],
          ['numero', 'ASC']
        ]
      });

      return res.status(200).json({
        status: 'success',
        data: unidades
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Listar blocos de um condomínio
   * @route GET /api/condominios/:condominioId/blocos
   */
  listarBlocos: async (req, res, next) => {
    try {
      const { condominioId } = req.params;

      // Buscar blocos únicos
      const blocos = await Unidade.findAll({
        attributes: ['bloco'],
        where: { 
          condominio_id: condominioId,
          bloco: { [sequelize.Op.not]: null }
        },
        group: ['bloco'],
        order: [['bloco', 'ASC']]
      });

      return res.status(200).json({
        status: 'success',
        data: blocos.map(item => item.bloco)
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = unidadeController;