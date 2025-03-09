const { Inventario, Condominio, Fornecedor } = require('../models');
const logger = require('../config/logger');
const sequelize = require('../config/database');

/**
 * Controller para gerenciamento de inventário
 */
const inventarioController = {
  /**
   * Listar todos os itens do inventário
   * @route GET /api/inventarios
   */
  listar: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, categoria, status, condominio_id } = req.query;
      const offset = (page - 1) * limit;

      // Construir query de filtro
      const where = {};
      
      if (search) {
        where[sequelize.Op.or] = [
          { nome: { [sequelize.Op.like]: `%${search}%` } },
          { codigo_patrimonio: { [sequelize.Op.like]: `%${search}%` } },
          { numero_serie: { [sequelize.Op.like]: `%${search}%` } }
        ];
      }
      
      if (categoria) {
        where.categoria = categoria;
      }
      
      if (status) {
        where.status = status;
      }
      
      if (condominio_id) {
        where.condominio_id = condominio_id;
      }

      // Buscar itens com paginação
      const { count, rows } = await Inventario.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nome', 'ASC']],
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          },
          {
            model: Fornecedor,
            as: 'fornecedor',
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
   * Obter detalhes de um item específico
   * @route GET /api/inventarios/:id
   */
  obter: async (req, res, next) => {
    try {
      const { id } = req.params;

      const item = await Inventario.findByPk(id, {
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          },
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome', 'cnpj_cpf', 'telefone', 'email']
          }
        ]
      });

      if (!item) {
        return res.status(404).json({
          status: 'error',
          message: 'Item não encontrado'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: item
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Criar novo item no inventário
   * @route POST /api/inventarios
   */
  criar: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const {
        condominio_id,
        nome,
        descricao,
        categoria,
        numero_serie,
        codigo_patrimonio,
        data_aquisicao,
        valor_aquisicao,
        fornecedor_id,
        nota_fiscal,
        localizacao,
        status,
        data_ultima_manutencao,
        data_proxima_manutencao,
        observacoes,
        foto,
        qrcode
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

      // Se fornecedor_id informado, verificar se o fornecedor existe
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

      // Criar o item no inventário
      const novoItem = await Inventario.create({
        condominio_id,
        nome,
        descricao,
        categoria,
        numero_serie,
        codigo_patrimonio,
        data_aquisicao,
        valor_aquisicao,
        fornecedor_id,
        nota_fiscal,
        localizacao,
        status: status || 'ativo',
        data_ultima_manutencao,
        data_proxima_manutencao,
        observacoes,
        foto,
        qrcode,
        criado_por: req.user ? req.user.id : null
      }, { transaction });

      await transaction.commit();

      logger.info(`Novo item de inventário criado: ${nome} (ID: ${novoItem.id})`);

      return res.status(201).json({
        status: 'success',
        message: 'Item adicionado ao inventário com sucesso',
        data: novoItem
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Atualizar um item do inventário
   * @route PUT /api/inventarios/:id
   */
  atualizar: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        nome,
        descricao,
        categoria,
        numero_serie,
        codigo_patrimonio,
        data_aquisicao,
        valor_aquisicao,
        fornecedor_id,
        nota_fiscal,
        localizacao,
        status,
        data_ultima_manutencao,
        data_proxima_manutencao,
        observacoes,
        foto,
        qrcode
      } = req.body;

      // Verificar se o item existe
      const item = await Inventario.findByPk(id, { transaction });
      if (!item) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Item não encontrado'
        });
      }

      // Se fornecedor_id informado, verificar se o fornecedor existe
      if (fornecedor_id && fornecedor_id !== item.fornecedor_id) {
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
      if (nome !== undefined) item.nome = nome;
      if (descricao !== undefined) item.descricao = descricao;
      if (categoria !== undefined) item.categoria = categoria;
      if (numero_serie !== undefined) item.numero_serie = numero_serie;
      if (codigo_patrimonio !== undefined) item.codigo_patrimonio = codigo_patrimonio;
      if (data_aquisicao !== undefined) item.data_aquisicao = data_aquisicao;
      if (valor_aquisicao !== undefined) item.valor_aquisicao = valor_aquisicao;
      if (fornecedor_id !== undefined) item.fornecedor_id = fornecedor_id;
      if (nota_fiscal !== undefined) item.nota_fiscal = nota_fiscal;
      if (localizacao !== undefined) item.localizacao = localizacao;
      if (status !== undefined) item.status = status;
      if (data_ultima_manutencao !== undefined) item.data_ultima_manutencao = data_ultima_manutencao;
      if (data_proxima_manutencao !== undefined) item.data_proxima_manutencao = data_proxima_manutencao;
      if (observacoes !== undefined) item.observacoes = observacoes;
      if (foto !== undefined) item.foto = foto;
      if (qrcode !== undefined) item.qrcode = qrcode;
      
      // Registrar quem atualizou
      if (req.user) {
        item.atualizado_por = req.user.id;
      }

      await item.save({ transaction });
      await transaction.commit();

      logger.info(`Item de inventário atualizado: ${item.nome} (ID: ${item.id})`);

      return res.status(200).json({
        status: 'success',
        message: 'Item atualizado com sucesso',
        data: item
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Excluir um item do inventário
   * @route DELETE /api/inventarios/:id
   */
  excluir: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      // Verificar se o item existe
      const item = await Inventario.findByPk(id, { transaction });
      if (!item) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Item não encontrado'
        });
      }

      // Excluir o item
      await item.destroy({ transaction });

      await transaction.commit();

      logger.info(`Item de inventário excluído: ${item.nome} (ID: ${item.id})`);

      return res.status(200).json({
        status: 'success',
        message: 'Item excluído com sucesso'
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Listar itens por condomínio
   * @route GET /api/condominios/:condominioId/inventarios
   */
  listarPorCondominio: async (req, res, next) => {
    try {
      const { condominioId } = req.params;
      const { page = 1, limit = 10, categoria, status } = req.query;
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
      
      if (categoria) {
        where.categoria = categoria;
      }
      
      if (status) {
        where.status = status;
      }

      // Buscar itens
      const { count, rows } = await Inventario.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nome', 'ASC']],
        include: [
          {
            model: Fornecedor,
            as: 'fornecedor',
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
   * Listar categorias de itens
   * @route GET /api/inventarios/categorias
   */
  listarCategorias: async (req, res, next) => {
    try {
      const { condominio_id } = req.query;

      // Construir query de filtro
      const where = {};
      if (condominio_id) {
        where.condominio_id = condominio_id;
      }

      // Buscar categorias únicas
      const categorias = await Inventario.findAll({
        attributes: ['categoria'],
        where: { 
          ...where,
          categoria: { [sequelize.Op.not]: null }
        },
        group: ['categoria'],
        order: [['categoria', 'ASC']]
      });

      return res.status(200).json({
        status: 'success',
        data: categorias.map(item => item.categoria)
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Gerar QR Code para um item
   * @route POST /api/inventarios/:id/qrcode
   */
  gerarQRCode: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Verificar se o item existe
      const item = await Inventario.findByPk(id);
      if (!item) {
        return res.status(404).json({
          status: 'error',
          message: 'Item não encontrado'
        });
      }

      // Aqui seria implementada a lógica de geração do QR Code
      // Usando um serviço específico como qrcodeService
      // const qrCodeData = await qrcodeService.gerar(`inventario/${id}`);
      
      // Por enquanto, apenas simulamos a geração
      const qrCodeData = `https://condogt.com/inventario/${id}`;
      
      // Atualizar o item com o QR Code gerado
      item.qrcode = qrCodeData;
      await item.save();
      
      return res.status(200).json({
        status: 'success',
        message: 'QR Code gerado com sucesso',
        data: {
          id: item.id,
          qrcode: item.qrcode
        }
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = inventarioController;