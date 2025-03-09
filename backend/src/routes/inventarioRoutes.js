const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const { auth, checkRole } = require('../middleware/auth');
const { validateIdParam, validatePaginacao } = require('../middleware/validation');

// Todas as rotas de inventário são protegidas

// Listar todos os itens do inventário
router.get('/', auth, inventarioController.listar);

// Obter um item específico
router.get('/:id', auth, inventarioController.obter);

// Criar novo item (apenas admin ou síndico)
router.post('/', auth, checkRole(['admin', 'sindico']), inventarioController.criar);

// Atualizar item (apenas admin ou síndico)
router.put('/:id', auth, checkRole(['admin', 'sindico']), inventarioController.atualizar);

// Excluir item (apenas admin ou síndico)
router.delete('/:id', auth, checkRole(['admin', 'sindico']), inventarioController.excluir);

// Listar categorias de itens
router.get('/categorias', auth, inventarioController.listarCategorias);

// Listar itens por condomínio
router.get('/condominio/:condominioId', auth, inventarioController.listarPorCondominio);

// Registrar manutenção para um item
router.post('/:id/manutencao', auth, checkRole(['admin', 'sindico']), inventarioController.registrarManutencao);

module.exports = router;