const express = require('express');
const router = express.Router();
const financeiroAvancadoController = require('../controllers/financeiroAvancadoController');
const { auth, checkRole } = require('../middleware/auth');
const { validateIdParam, validatePaginacao } = require('../middleware/validation');

// Todas as rotas de financeiro avançado são protegidas

// Listar todas as operações financeiras avançadas
router.get('/', auth, checkRole(['admin', 'sindico']), financeiroAvancadoController.listar);

// Obter uma operação financeira específica
router.get('/:id', auth, checkRole(['admin', 'sindico']), financeiroAvancadoController.obter);

// Criar nova operação financeira (apenas admin ou síndico)
router.post('/', auth, checkRole(['admin', 'sindico']), financeiroAvancadoController.criar);

// Atualizar operação financeira (apenas admin ou síndico)
router.put('/:id', auth, checkRole(['admin', 'sindico']), financeiroAvancadoController.atualizar);

// Excluir operação financeira (apenas admin ou síndico)
router.delete('/:id', auth, checkRole(['admin', 'sindico']), financeiroAvancadoController.excluir);

// Gerar relatório financeiro avançado
router.get('/relatorio', auth, checkRole(['admin', 'sindico']), financeiroAvancadoController.gerarRelatorio);

// Projeção financeira
router.get('/projecao', auth, checkRole(['admin', 'sindico']), financeiroAvancadoController.gerarProjecao);

// Fluxo de caixa
router.get('/fluxo-caixa', auth, checkRole(['admin', 'sindico']), financeiroAvancadoController.fluxoCaixa);

// Balanço patrimonial
router.get('/balanco', auth, checkRole(['admin', 'sindico']), financeiroAvancadoController.balancoPatrimonial);

module.exports = router;