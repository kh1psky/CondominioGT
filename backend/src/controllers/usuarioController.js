const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const logger = require('../config/logger');

/**
 * Controller para gerenciamento de usuários
 */
const usuarioController = {
  /**
   * Registrar novo usuário
   * @route POST /api/usuarios/registrar
   */
  registrar: async (req, res, next) => {
    try {
      const { nome, email, senha, telefone, perfil } = req.body;

      // Verificar se o email já existe
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(409).json({
          status: 'error',
          message: 'Este email já está em uso'
        });
      }

      // Verificar se o perfil é válido (apenas admin pode criar outros admins)
      if (perfil === 'admin' && (!req.user || req.user.perfil !== 'admin')) {
        return res.status(403).json({
          status: 'error',
          message: 'Você não tem permissão para criar um usuário administrador'
        });
      }

      // Criar o usuário
      const novoUsuario = await Usuario.create({
        nome,
        email,
        senha,
        telefone,
        perfil: perfil || 'morador' // Default para morador
      });

      // Remover a senha do objeto de resposta
      const usuarioResponse = novoUsuario.toJSON();

      logger.info(`Novo usuário registrado: ${email}`);

      return res.status(201).json({
        status: 'success',
        message: 'Usuário registrado com sucesso',
        data: usuarioResponse
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Login de usuário
   * @route POST /api/usuarios/login
   */
  login: async (req, res, next) => {
    try {
      const { email, senha } = req.body;

      // Buscar usuário pelo email
      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        return res.status(401).json({
          status: 'error',
          message: 'Email ou senha incorretos'
        });
      }

      // Verificar se a senha está correta
      const senhaCorreta = await usuario.verificarSenha(senha);
      if (!senhaCorreta) {
        return res.status(401).json({
          status: 'error',
          message: 'Email ou senha incorretos'
        });
      }

      // Verificar se a conta está ativa
      if (!usuario.ativo) {
        return res.status(403).json({
          status: 'error',
          message: 'Sua conta está desativada'
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
        process.env.JWT_SECRET,
        { expiresIn: '1d' } // Token válido por 1 dia
      );

      // Atualizar último acesso
      usuario.ultimo_acesso = new Date();
      await usuario.save();

      logger.info(`Usuário logado: ${email}`);

      return res.status(200).json({
        status: 'success',
        message: 'Login realizado com sucesso',
        data: {
          usuario: usuario.toJSON(),
          token
        }
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Obter perfil do usuário autenticado
   * @route GET /api/usuarios/perfil
   */
  getPerfil: async (req, res, next) => {
    try {
      const usuarioId = req.user.id;

      const usuario = await Usuario.findByPk(usuarioId, {
        include: [
          { association: 'condominios_administrados' },
          { association: 'propriedades' },
          { association: 'residencias' }
        ]
      });

      if (!usuario) {
        return res.status(404).json({
          status: 'error',
          message: 'Usuário não encontrado'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: usuario
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Atualizar dados do usuário
   * @route PUT /api/usuarios/atualizar
   */
  atualizar: async (req, res, next) => {
    try {
      const usuarioId = req.user.id;
      const { nome, telefone, senha } = req.body;

      const usuario = await Usuario.findByPk(usuarioId);
      if (!usuario) {
        return res.status(404).json({
          status: 'error',
          message: 'Usuário não encontrado'
        });
      }

      // Atualizar os campos fornecidos
      if (nome) usuario.nome = nome;
      if (telefone) usuario.telefone = telefone;
      if (senha) usuario.senha = senha;

      await usuario.save();

      logger.info(`Usuário ${usuario.email} atualizou seu perfil`);

      return res.status(200).json({
        status: 'success',
        message: 'Perfil atualizado com sucesso',
        data: usuario.toJSON()
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Solicitar recuperação de senha
   * @route POST /api/usuarios/recuperar-senha
   */
  recuperarSenha: async (req, res, next) => {
    try {
      const { email } = req.body;

      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        return res.status(404).json({
          status: 'error',
          message: 'Email não encontrado'
        });
      }

      // Gerar token de recuperação
      const token = await usuario.gerarTokenRecuperacao();

      // Aqui você enviaria um email com o link de recuperação
      // Usando um serviço de email como nodemailer
      // Por simplicidade, apenas vamos retornar o token

      logger.info(`Solicitação de recuperação de senha para: ${email}`);

      return res.status(200).json({
        status: 'success',
        message: 'Instruções de recuperação enviadas para o email',
        // Em produção, não retornar o token diretamente
        ...(process.env.NODE_ENV !== 'production' && { token })
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Redefinir senha com token
   * @route POST /api/usuarios/redefinir-senha
   */
  redefinirSenha: async (req, res, next) => {
    try {
      const { token, novaSenha } = req.body;

      const usuario = await Usuario.findOne({
        where: {
          token_recuperacao: token,
          token_expiracao: {
            [sequelize.Op.gt]: new Date()
          }
        }
      });

      if (!usuario) {
        return res.status(400).json({
          status: 'error',
          message: 'Token inválido ou expirado'
        });
      }

      // Atualizar a senha
      usuario.senha = novaSenha;
      usuario.token_recuperacao = null;
      usuario.token_expiracao = null;
      await usuario.save();

      logger.info(`Senha redefinida para usuário: ${usuario.email}`);

      return res.status(200).json({
        status: 'success',
        message: 'Senha redefinida com sucesso'
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * Listar todos os usuários (apenas para admin)
   * @route GET /api/usuarios
   */
  listar: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, perfil } = req.query;
      const offset = (page - 1) * limit;

      // Construir query de filtro
      const where = {};
      if (search) {
        where[sequelize.Op.or] = [
          { nome: { [sequelize.Op.like]: `%${search}%` } },
          { email: { [sequelize.Op.like]: `%${search}%` } }
        ];
      }
      if (perfil) {
        where.perfil = perfil;
      }

      // Buscar usuários com paginação
      const { count, rows } = await Usuario.findAndCountAll({
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
  }
};

module.exports = usuarioController;