const express = require('express');
const router = express.Router();
const condominioController = require('../controllers/condominioController');
const { auth, checkRole } = require('../middleware/auth');
const { validateIdParam, validatePaginacao } = require('../middleware/validation');

// Todas as rotas de condomínio são protegidas

// Listar todos os condomínios
router.get('/', auth, condominioController.listar);

// Obter um condomínio específico
router.get('/:id', auth, condominioController.obter);

// Criar novo condomínio (apenas admin ou síndico)
router.post('/', auth, checkRole(['admin', 'sindico']), condominioController.criar);

// Atualizar condomínio (apenas admin ou síndico do condomínio)
router.put('/:id', auth, condominioController.atualizar);

// Excluir condomínio (apenas admin)
router.delete('/:id', auth, checkRole(['admin']), condominioController.excluir);

// Listar condomínios por síndico
router.get('/sindico/:sindicoId', auth, condominioController.listarPorSindico);

// Obter estatísticas do condomínio
router.get('/:id/estatisticas', auth, condominioController.estatisticas);

module.exports = router;