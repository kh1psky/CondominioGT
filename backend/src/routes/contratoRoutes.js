const express = require('express');
const router = express.Router();
const contratoController = require('../controllers/contratoController');
const { auth, checkRole } = require('../middleware/auth');
const { validateIdParam, validatePaginacao } = require('../middleware/validation');

// Todas as rotas de contrato são protegidas

// Listar todos os contratos
router.get('/', auth, contratoController.listar);

// Obter um contrato específico
router.get('/:id', auth, contratoController.obter);

// Criar novo contrato (apenas admin ou síndico)
router.post('/', auth, checkRole(['admin', 'sindico']), contratoController.criar);

// Atualizar contrato (apenas admin ou síndico)
router.put('/:id', auth, checkRole(['admin', 'sindico']), contratoController.atualizar);

// Excluir contrato (apenas admin ou síndico)
router.delete('/:id', auth, checkRole(['admin', 'sindico']), contratoController.excluir);

// Renovar contrato (apenas admin ou síndico)
router.post('/:id/renovar', auth, checkRole(['admin', 'sindico']), contratoController.renovar);

// Cancelar contrato (apenas admin ou síndico)
router.post('/:id/cancelar', auth, checkRole(['admin', 'sindico']), contratoController.cancelar);

module.exports = router;