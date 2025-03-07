const express = require('express');
const router = express.Router();
const unidadeController = require('../controllers/unidadeController');
const { auth, checkRole } = require('../middleware/auth');
const { validateIdParam } = require('../middleware/validation');

// Todas as rotas de unidades são protegidas

// Obter uma unidade específica
router.get('/:id', auth, validateIdParam, unidadeController.obter);

// Criar nova unidade
router.post('/', auth, checkRole(['admin', 'sindico']), unidadeController.criar);

// Atualizar unidade
router.put('/:id', auth, checkRole(['admin', 'sindico']), validateIdParam, unidadeController.atualizar);

// Excluir unidade
router.delete('/:id', auth, checkRole(['admin', 'sindico']), validateIdParam, unidadeController.excluir);

module.exports = router;