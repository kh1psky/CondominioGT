const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

/**
 * Middleware de autenticação JWT
 */
const auth = async (req, res, next) => {
  try {
    // Verificar se o header de autorização foi fornecido
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Token de autenticação não fornecido'
      });
    }

    // Verificar formato do header (Bearer token)
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        status: 'error',
        message: 'Formato de token inválido'
      });
    }

    const token = parts[1];

    // Verificar validade do token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar o usuário no banco de dados
    const usuario = await Usuario.findByPk(decoded.id);
    
    // Verificar se o usuário existe
    if (!usuario) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o usuário está ativo
    if (!usuario.ativo) {
      return res.status(403).json({
        status: 'error',
        message: 'Usuário inativo'
      });
    }

    // Adicionar o usuário à requisição para uso nos controllers
    req.user = usuario;
    
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expirado'
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Token inválido'
    });
  }
};

/**
 * Middleware para verificar permissões do usuário
 * @param {Array} roles - Array de perfis permitidos
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    // Verificar se o usuário tem o perfil necessário
    if (!roles.includes(req.user.perfil)) {
      return res.status(403).json({
        status: 'error',
        message: 'Acesso negado: perfil não autorizado'
      });
    }

    return next();
  };
};

module.exports = {
  auth,
  checkRole
};