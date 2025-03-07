const { Condominio, Unidade, Usuario } = require('../models');
const logger = require('../config/logger');
const sequelize = require('../config/database');

/**
 * Controller para gerenciamento de condomínios
 */
const condominioController = {
  /**
   * Listar todos os condomínios
   * @route GET /api/condominios
   */
  listar: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      // Construir query de filtro
      const where = {};
      if (search) {
        where[sequelize.Op.or] = [
          { nome: { [sequelize.Op.like]: `%${search}%` } },
          { cnpj: { [sequelize.Op.like]: `%${search}%` } },
          { cidade: { [sequelize.Op.like]: `%${search}%` } }
        ];
      }

      // Adicionar filtro por síndico se não for admin
      if (req.user && req.user.perfil !== 'admin') {
        where.sindico_id = req.user.id;
      }

      // Buscar condomínios com paginação
      const { count, rows } = await Condominio.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nome', 'ASC']],
        include: [
          {
            model: Usuario,
            as: 'sindico',
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
   * Obter detalhes de um condomínio específico
   * @route GET /api/condominios/:id
   */
  obter: async (req, res, next) => {
    try {
      const { id } = req.params;

      const condominio = await Condominio.findByPk(id, {
        include: [
          {
            model: Usuario,
            as: 'sindico',
            attributes: ['id', 'nome', 'email', 'telefone']
          },
          {
            model: Unidade,
            as: 'unidades',
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
          }
        ]
      });

      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: condominio
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Criar novo condomínio
   * @route POST /api/condominios
   */
  criar: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const {
        nome, cnpj, endereco, numero, complemento, bairro,
        cidade, estado, cep, telefone, email, data_fundacao,
        total_unidades, area_total, sindico_id, unidades
      } = req.body;

      // Verificar se o CNPJ já existe
      const condominioExistente = await Condominio.findOne({
        where: { cnpj },
        transaction
      });

      if (condominioExistente) {
        await transaction.rollback();
        return res.status(409).json({
          status: 'error',
          message: 'CNPJ já cadastrado'
        });
      }

      // Se informou síndico_id, verificar se o usuário existe e tem perfil adequado
      if (sindico_id) {
        const sindico = await Usuario.findByPk(sindico_id, { transaction });
        
        if (!sindico) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: 'Síndico não encontrado'
          });
        }

        if (sindico.perfil !== 'sindico' && sindico.perfil !== 'admin') {
          await transaction.rollback();
          return res.status(400).json({
            status: 'error',
            message: 'Usuário não pode ser síndico (perfil inadequado)'
          });
        }
      }

      // Criar o condomínio
      const novoCondominio = await Condominio.create({
        nome,
        cnpj,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        telefone,
        email,
        data_fundacao,
        total_unidades: total_unidades || 0,
        area_total,
        sindico_id,
        ativo: true
      }, { transaction });

      // Se informou unidades, criar as unidades
      if (unidades && Array.isArray(unidades) && unidades.length > 0) {
        // Adicionar o id do condomínio a cada unidade
        const unidadesParaInserir = unidades.map(unidade => ({
          ...unidade,
          condominio_id: novoCondominio.id
        }));

        await Unidade.bulkCreate(unidadesParaInserir, { transaction });

        // Atualizar o total de unidades
        novoCondominio.total_unidades = unidades.length;
        await novoCondominio.save({ transaction });
      }

      await transaction.commit();

      logger.info(`Novo condomínio criado: ${nome} (ID: ${novoCondominio.id})`);

      return res.status(201).json({
        status: 'success',
        message: 'Condomínio criado com sucesso',
        data: novoCondominio
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Atualizar um condomínio
   * @route PUT /api/condominios/:id
   */
  atualizar: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        nome, endereco, numero, complemento, bairro,
        cidade, estado, cep, telefone, email, data_fundacao,
        area_total, sindico_id
      } = req.body;

      const condominio = await Condominio.findByPk(id);
      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }

      // Verificar permissão (apenas admin ou síndico do condomínio)
      if (
        req.user.perfil !== 'admin' &&
        condominio.sindico_id !== req.user.id
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'Você não tem permissão para editar este condomínio'
        });
      }

      // Se informou síndico_id, verificar se o usuário existe e tem perfil adequado
      if (sindico_id && sindico_id !== condominio.sindico_id) {
        const sindico = await Usuario.findByPk(sindico_id);
        
        if (!sindico) {
          return res.status(404).json({
            status: 'error',
            message: 'Síndico não encontrado'
          });
        }

        if (sindico.perfil !== 'sindico' && sindico.perfil !== 'admin') {
          return res.status(400).json({
            status: 'error',
            message: 'Usuário não pode ser síndico (perfil inadequado)'
          });
        }
      }

      // Atualizar os campos fornecidos
      if (nome) condominio.nome = nome;
      if (endereco) condominio.endereco = endereco;
      if (numero) condominio.numero = numero;
      if (complemento !== undefined) condominio.complemento = complemento;
      if (bairro) condominio.bairro = bairro;
      if (cidade) condominio.cidade = cidade;
      if (estado) condominio.estado = estado;
      if (cep) condominio.cep = cep;
      if (telefone !== undefined) condominio.telefone = telefone;
      if (email !== undefined) condominio.email = email;
      if (data_fundacao !== undefined) condominio.data_fundacao = data_fundacao;
      if (area_total !== undefined) condominio.area_total = area_total;
      if (sindico_id !== undefined) condominio.sindico_id = sindico_id;

      await condominio.save();

      logger.info(`Condomínio atualizado: ${condominio.nome} (ID: ${condominio.id})`);

      return res.status(200).json({
        status: 'success',
        message: 'Condomínio atualizado com sucesso',
        data: condominio
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Excluir um condomínio
   * @route DELETE /api/condominios/:id
   */
  excluir: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      const condominio = await Condominio.findByPk(id, { transaction });
      if (!condominio) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }

      // Verificar permissão (apenas admin pode excluir)
      if (req.user.perfil !== 'admin') {
        await transaction.rollback();
        return res.status(403).json({
          status: 'error',
          message: 'Apenas administradores podem excluir condomínios'
        });
      }

      // Verificar se existem unidades associadas
      const unidadesCount = await Unidade.count({
        where: { condominio_id: id },
        transaction
      });

      if (unidadesCount > 0) {
        // Opção 1: Impedir exclusão se houver unidades
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: `Não é possível excluir o condomínio porque ele possui ${unidadesCount} unidades associadas`
        });

        // Opção 2: Excluir também as unidades (CASCADE)
        // await Unidade.destroy({
        //   where: { condominio_id: id },
        //   transaction
        // });
      }

      // Excluir o condomínio
      await condominio.destroy({ transaction });

      await transaction.commit();

      logger.info(`Condomínio excluído: ${condominio.nome} (ID: ${condominio.id})`);

      return res.status(200).json({
        status: 'success',
        message: 'Condomínio excluído com sucesso'
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Listar condomínios por síndico
   * @route GET /api/condominios/sindico/:sindicoId
   */
  listarPorSindico: async (req, res, next) => {
    try {
      const { sindicoId } = req.params;

      // Verificar se o síndico existe
      const sindico = await Usuario.findByPk(sindicoId);
      if (!sindico) {
        return res.status(404).json({
          status: 'error',
          message: 'Síndico não encontrado'
        });
      }

      // Buscar condomínios do síndico
      const condominios = await Condominio.findAll({
        where: { sindico_id: sindicoId },
        order: [['nome', 'ASC']]
      });

      return res.status(200).json({
        status: 'success',
        data: condominios
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Obter estatísticas do condomínio
   * @route GET /api/condominios/:id/estatisticas
   */
  estatisticas: async (req, res, next) => {
    try {
      const { id } = req.params;

      const condominio = await Condominio.findByPk(id);
      if (!condominio) {
        return res.status(404).json({
          status: 'error',
          message: 'Condomínio não encontrado'
        });
      }

      // Buscar estatísticas das unidades
      const totalUnidades = await Unidade.count({
        where: { condominio_id: id }
      });

      const unidadesOcupadas = await Unidade.count({
        where: {
          condominio_id: id,
          status: 'ocupado'
        }
      });

      const unidadesVagas = await Unidade.count({
        where: {
          condominio_id: id,
          status: 'vago'
        }
      });

      const unidadesEmReforma = await Unidade.count({
        where: {
          condominio_id: id,
          status: 'em_reforma'
        }
      });

      // Calcular taxas de ocupação
      const taxaOcupacao = totalUnidades > 0 
        ? (unidadesOcupadas / totalUnidades) * 100 
        : 0;

      return res.status(200).json({
        status: 'success',
        data: {
          nome: condominio.nome,
          totalUnidades,
          unidadesOcupadas,
          unidadesVagas,
          unidadesEmReforma,
          taxaOcupacao: parseFloat(taxaOcupacao.toFixed(2))
        }
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = condominioController;