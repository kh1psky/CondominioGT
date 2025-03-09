const { Documento, Condominio } = require('../models');
const logger = require('../config/logger');
const sequelize = require('../config/database');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const uploadConfig = require('../config/upload');

/**
 * Controller para gerenciamento de documentos
 */
const documentoController = {
  /**
   * Listar todos os documentos
   * @route GET /api/documentos
   */
  listar: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, tipo, condominio_id, search } = req.query;
      const offset = (page - 1) * limit;

      // Construir query de filtro
      const where = {};
      
      if (tipo) {
        where.tipo = tipo;
      }
      
      if (condominio_id) {
        where.condominio_id = condominio_id;
      }
      
      if (search) {
        where[sequelize.Op.or] = [
          { titulo: { [sequelize.Op.like]: `%${search}%` } },
          { descricao: { [sequelize.Op.like]: `%${search}%` } },
          { nome_arquivo: { [sequelize.Op.like]: `%${search}%` } }
        ];
      }

      // Buscar documentos com paginação
      const { count, rows } = await Documento.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_upload', 'DESC']],
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
   * Obter detalhes de um documento específico
   * @route GET /api/documentos/:id
   */
  obter: async (req, res, next) => {
    try {
      const { id } = req.params;

      const documento = await Documento.findByPk(id, {
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          }
        ]
      });

      if (!documento) {
        return res.status(404).json({
          status: 'error',
          message: 'Documento não encontrado'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: documento
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Fazer upload de um novo documento
   * @route POST /api/documentos
   */
  upload: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      // Verificar se o arquivo foi enviado
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Nenhum arquivo foi enviado'
        });
      }

      const {
        titulo,
        descricao,
        tipo,
        data_documento,
        tags,
        condominio_id,
        publico
      } = req.body;

      // Verificar se o condomínio existe
      if (condominio_id) {
        const condominio = await Condominio.findByPk(condominio_id, { transaction });
        
        if (!condominio) {
          await transaction.rollback();
          // Remover o arquivo enviado
          fs.unlinkSync(req.file.path);
          return res.status(404).json({
            status: 'error',
            message: 'Condomínio não encontrado'
          });
        }
      }

      // Gerar nome único para o arquivo
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(uploadConfig.directory, fileName);

      // Mover o arquivo para o diretório de destino
      fs.renameSync(req.file.path, filePath);

      // Criar o documento no banco de dados
      const novoDocumento = await Documento.create({
        titulo,
        descricao,
        tipo: tipo || 'geral',
        nome_arquivo: req.file.originalname,
        caminho_arquivo: fileName,
        tamanho_arquivo: req.file.size,
        tipo_arquivo: req.file.mimetype,
        data_documento: data_documento || new Date(),
        data_upload: new Date(),
        tags: tags ? JSON.stringify(tags.split(',').map(tag => tag.trim())) : null,
        condominio_id,
        publico: publico === 'true' || publico === true
      }, { transaction });

      await transaction.commit();

      logger.info(`Novo documento enviado: ${titulo} (ID: ${novoDocumento.id})`);

      return res.status(201).json({
        status: 'success',
        message: 'Documento enviado com sucesso',
        data: novoDocumento
      });
    } catch (error) {
      await transaction.rollback();
      // Remover o arquivo enviado em caso de erro
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return next(error);
    }
  },

  /**
   * Atualizar informações de um documento
   * @route PUT /api/documentos/:id
   */
  atualizar: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        titulo,
        descricao,
        tipo,
        data_documento,
        tags,
        publico
      } = req.body;

      // Verificar se o documento existe
      const documento = await Documento.findByPk(id, { transaction });
      if (!documento) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Documento não encontrado'
        });
      }

      // Atualizar os campos fornecidos
      if (titulo !== undefined) documento.titulo = titulo;
      if (descricao !== undefined) documento.descricao = descricao;
      if (tipo !== undefined) documento.tipo = tipo;
      if (data_documento !== undefined) documento.data_documento = data_documento;
      if (tags !== undefined) {
        documento.tags = tags ? JSON.stringify(tags.split(',').map(tag => tag.trim())) : null;
      }
      if (publico !== undefined) {
        documento.publico = publico === 'true' || publico === true;
      }

      await documento.save({ transaction });
      await transaction.commit();

      logger.info(`Documento atualizado: ${documento.titulo} (ID: ${documento.id})`);

      return res.status(200).json({
        status: 'success',
        message: 'Documento atualizado com sucesso',
        data: documento
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Excluir um documento
   * @route DELETE /api/documentos/:id
   */
  excluir: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      // Verificar se o documento existe
      const documento = await Documento.findByPk(id, { transaction });
      if (!documento) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Documento não encontrado'
        });
      }

      // Remover o arquivo físico
      const filePath = path.join(uploadConfig.directory, documento.caminho_arquivo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Excluir o documento do banco de dados
      await documento.destroy({ transaction });

      await transaction.commit();

      logger.info(`Documento excluído: ${documento.titulo} (ID: ${documento.id})`);

      return res.status(200).json({
        status: 'success',
        message: 'Documento excluído com sucesso'
      });
    } catch (error) {
      await transaction.rollback();
      return next(error);
    }
  },

  /**
   * Fazer download de um documento
   * @route GET /api/documentos/:id/download
   */
  download: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Buscar o documento
      const documento = await Documento.findByPk(id);
      if (!documento) {
        return res.status(404).json({
          status: 'error',
          message: 'Documento não encontrado'
        });
      }

      // Verificar se o usuário tem permissão para acessar o documento
      // Se o documento não for público, verificar se o usuário pertence ao condomínio
      if (!documento.publico && documento.condominio_id) {
        // Lógica de verificação de permissão aqui
        // Exemplo: verificar se o usuário pertence ao condomínio do documento
        // const usuarioPertenceAoCondominio = await verificarPermissao(req.user.id, documento.condominio_id);
        // if (!usuarioPertenceAoCondominio) {
        //   return res.status(403).json({
        //     status: 'error',
        //     message: 'Você não tem permissão para acessar este documento'
        //   });
        // }
      }

      // Caminho do arquivo
      const filePath = path.join(uploadConfig.directory, documento.caminho_arquivo);

      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          status: 'error',
          message: 'Arquivo não encontrado no servidor'
        });
      }

      // Registrar o download
      logger.info(`Download de documento: ${documento.titulo} (ID: ${documento.id})`);

      // Enviar o arquivo para download
      res.download(filePath, documento.nome_arquivo);
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Listar documentos por condomínio
   * @route GET /api/condominios/:condominioId/documentos
   */
  listarPorCondominio: async (req, res, next) => {
    try {
      const { condominioId } = req.params;
      const { page = 1, limit = 10, tipo } = req.query;
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
      
      if (tipo) {
        where.tipo = tipo;
      }

      // Buscar documentos
      const { count, rows } = await Documento.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_upload', 'DESC']]
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
   * Listar tipos de documentos
   * @route GET /api/documentos/tipos
   */
  listarTipos: async (req, res, next) => {
    try {
      // Buscar tipos únicos
      const tipos = await Documento.findAll({
        attributes: ['tipo'],
        where: { 
          tipo: { [sequelize.Op.not]: null }
        },
        group: ['tipo'],
        order: [['tipo', 'ASC']]
      });

      return res.status(200).json({
        status: 'success',
        data: tipos.map(item => item.tipo)
      });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = documentoController;