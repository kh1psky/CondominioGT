const { Fornecedor, Condominio } = require('../models');
const logger = require('../config/logger');
const sequelize = require('../config/database');

/**
 * Controller para gerenciamento de fornecedores
 */
const fornecedorController = {
  /**
   * Listar todos os fornecedores
   * @route GET /api/fornecedores
   */
  listar: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, categoria, condominio_id } = req.query;
      const offset = (page - 1) * limit;

      // Construir query de filtro
      const where = {};
      
      if (search) {
        where[sequelize.Op.or] = [
          { nome: { [sequelize.Op.like]: `%${search}%` } },
          { cnpj_cpf: { [sequelize.Op.like]: `%${search}%` } },
          { email: { [sequelize.Op.like]: `%${search}%` } }
        ];
      }
      
      if (categoria) {
        where.categoria = categoria;
      }
      
      if (condominio_id) {
        where.condominio_id = condominio_id;
      }

      // Buscar fornecedores com paginação
      const { count, rows } = await Fornecedor.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nome', 'ASC']],
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
  },

  /**
   * Obter detalhes de um fornecedor específico
   * @route GET /api/fornecedores/:id
   */
  obter: async (req, res, next) => {
    try {
      const { id } = req.params;

      const fornecedor = await Fornecedor.findByPk(id, {
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          }
        ]
      });

      if (!fornecedor) {
        return res.status(404).json({
          status: 'error',
          message: 'Fornecedor não encontrado'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: fornecedor
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Criar novo fornecedor
   * @route POST /api/fornecedores
   */
  criar: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const {
        nome,
        cnpj_cpf,
        tipo_pessoa,
        categoria,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        telefone,
        email,
        contato_nome,
        contato_telefone,
        website,
        observacoes,
        condominio_id
      } = req.body;

      // Verificar se o CNPJ/CPF já existe
      if (cnpj_cpf) {
        const fornecedorExistente = await Fornecedor.findOne({
          where: { cnpj_cpf },
          transaction
        });

        if (fornecedorExistente) {
          await transaction.rollback();
          return res.status(409).json({
            status: 'error',
            message: 'CNPJ/CPF já cadastrado'
          });
        }
      }

      // Se informou condominio_id, verificar se o condomínio existe
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

      // Criar o fornecedor
      const novoFornecedor = await Fornecedor.create({
        nome,
        cnpj_cpf,
        tipo_pessoa: tipo_pessoa || 'juridica',
        categoria,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        telefone,
        email,
        contato_nome,
        contato_telefone,
        website,
        observacoes,
        condominio_id,
        ativo: true
      }, { transaction });

      await transaction.commit();

      logger.info(`Novo fornecedor criado: ${nome} (ID: ${novoFornecedor.id})`);

      return res.status(201).json({
        status: 'success',
        message: 'Fornecedor criado com sucesso',
        data: novoFornecedor
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Atualizar um fornecedor
   * @route PUT /api/fornecedores/:id
   */
  atualizar: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        nome,
        tipo_pessoa,
        categoria,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        telefone,
        email,
        contato_nome,
        contato_telefone,
        website,
        observacoes,
        ativo
      } = req.body;

      // Verificar se o fornecedor existe
      const fornecedor = await Fornecedor.findByPk(id, { transaction });
      if (!fornecedor) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Fornecedor não encontrado'
        });
      }

      // Atualizar os campos fornecidos
      if (nome !== undefined) fornecedor.nome = nome;
      if (tipo_pessoa !== undefined) fornecedor.tipo_pessoa = tipo_pessoa;
      if (categoria !== undefined) fornecedor.categoria = categoria;
      if (endereco !== undefined) fornecedor.endereco = endereco;
      if (numero !== undefined) fornecedor.numero = numero;
      if (complemento !== undefined) fornecedor.complemento = complemento;
      if (bairro !== undefined) fornecedor.bairro = bairro;
      if (cidade !== undefined) fornecedor.cidade = cidade;
      if (estado !== undefined) fornecedor.estado = estado;
      if (cep !== undefined) fornecedor.cep = cep;
      if (telefone !== undefined) fornecedor.telefone = telefone;
      if (email !== undefined) fornecedor.email = email;
      if (contato_nome !== undefined) fornecedor.contato_nome = contato_nome;
      if (contato_telefone !== undefined) fornecedor.contato_telefone = contato_telefone;
      if (website !== undefined) fornecedor.website = website;
      if (observacoes !== undefined) fornecedor.observacoes = observacoes;
      if (ativo !== undefined) fornecedor.ativo = ativo;

      await fornecedor.save({ transaction });
      await transaction.commit();

      logger.info(`Fornecedor atualizado: ${fornecedor.nome} (ID: ${fornecedor.id})`);

      return res.status(200).json({
        status: 'success',
        message: 'Fornecedor atualizado com sucesso',
        data: fornecedor
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Excluir um fornecedor
   * @route DELETE /api/fornecedores/:id
   */
  excluir: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      // Verificar se o fornecedor existe
      const fornecedor = await Fornecedor.findByPk(id, { transaction });
      if (!fornecedor) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Fornecedor não encontrado'
        });
      }

      // Verificar se existem contratos associados
      // Nota: Isso depende da implementação do modelo de Contrato
      // const contratosCount = await Contrato.count({
      //   where: { fornecedor_id: id },
      //   transaction
      // });
      // 
      // if (contratosCount > 0) {
      //   await transaction.rollback();
      //   return res.status(400).json({
      //     status: 'error',
      //     message: `Não é possível excluir o fornecedor porque ele possui ${contratosCount} contratos associados`
      //   });
      // }

      // Excluir o fornecedor
      await fornecedor.destroy({ transaction });

      await transaction.commit();

      logger.info(`Fornecedor excluído: ${fornecedor.nome} (ID: ${fornecedor.id})`);

      return res.status(200).json({
        status: 'success',
        message: 'Fornecedor excluído com sucesso'
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Listar fornecedores por condomínio
   * @route GET /api/condominios/:condominioId/fornecedores
   */
  listarPorCondominio: async (req, res, next) => {
    try {
      const { condominioId } = req.params;
      const { page = 1, limit = 10, categoria } = req.query;
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
      const where = { 
        [sequelize.Op.or]: [
          { condominio_id: condominioId },
          { condominio_id: null } // Incluir fornecedores gerais (sem condomínio específico)
        ]
      };
      
      if (categoria) {
        where.categoria = categoria;
      }

      // Buscar fornecedores
      const { count, rows } = await Fornecedor.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nome', 'ASC']]
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
   * Listar categorias de fornecedores
   * @route GET /api/fornecedores/categorias
   */
  listarCategorias: async (req, res, next) => {
    try {
      // Buscar categorias únicas
      const categorias = await Fornecedor.findAll({
        attributes: ['categoria'],
        where: { 
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
  }
};

module.exports = fornecedorController;