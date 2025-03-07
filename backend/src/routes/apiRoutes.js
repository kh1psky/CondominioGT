const express = require('express');
const router = express.Router();

// Importar todas as rotas
const usuarioRoutes = require('./usuarioRoutes');
const condominioRoutes = require('./condominioRoutes');
const unidadeRoutes = require('./unidadeRoutes');
const condominioUnidadeRoutes = require('./condominioUnidadeRoutes');
const pagamentoRoutes = require('./pagamentoRoutes');

// Montar as rotas
router.use('/usuarios', usuarioRoutes);
router.use('/condominios', condominioRoutes);
router.use('/unidades', unidadeRoutes);
router.use('/condominios/:condominioId/unidades', condominioUnidadeRoutes);
router.use('/pagamentos', pagamentoRoutes);

// Rota base da API
router.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo à API do Sistema de Gerenciamento de Condomínios',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

module.exports = router;