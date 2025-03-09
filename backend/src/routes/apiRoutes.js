const express = require('express');
const router = express.Router();

// Importar todas as rotas
const usuarioRoutes = require('./usuarioRoutes');
const condominioRoutes = require('./condominioRoutes');
const unidadeRoutes = require('./unidadeRoutes');
// TODO: Create condominioUnidadeRoutes file or implement this functionality
const pagamentoRoutes = require('./pagamentoRoutes');
const inventarioRoutes = require('./inventarioRoutes');

// Montar as rotas
router.use('/usuarios', usuarioRoutes);
router.use('/condominios', condominioRoutes);
router.use('/unidades', unidadeRoutes);
// TODO: Uncomment when condominioUnidadeRoutes is implemented
// router.use('/condominios/:condominioId/unidades', condominioUnidadeRoutes);
router.use('/pagamentos', pagamentoRoutes);
router.use('/inventario', inventarioRoutes);

// Rota base da API
router.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo à API do Sistema de Gerenciamento de Condomínios',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

module.exports = router;