const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');
const { auth, checkRole } = require('../middleware/auth');
const { validateIdParam, validatePaginacao } = require('../middleware/validation');

// Todas as rotas de pagamentos são protegidas

// Listar todos os pagamentos (com filtros)
router.get('/', auth, validatePaginacao, pagamentoController.listar);

// Gerar relatório de pagamentos
router.get('/relatorio', auth, pagamentoController.gerarRelatorio);

// Obter um pagamento específico
router.get('/:id', auth, validateIdParam, pagamentoController.obter);

// Criar novo pagamento
router.post('/', auth, checkRole(['admin', 'sindico']), pagamentoController.criar);

// Atualizar pagamento
router.put('/:id', auth, checkRole(['admin', 'sindico']), validateIdParam, pagamentoController.atualizar);

// Excluir pagamento
router.delete('/:id', auth, checkRole(['admin']), validateIdParam, pagamentoController.excluir);

// Registrar pagamento
router.post('/:id/registrar', auth, validateIdParam, pagamentoController.registrarPagamento);

// Cancelar pagamento
router.post('/:id/cancelar', auth, checkRole(['admin', 'sindico']), validateIdParam, pagamentoController.cancelarPagamento);

module.exports = router;