const express = require('express');
const router = express.Router();
const fornecedorController = require('../controllers/fornecedorController');
const { auth, checkRole } = require('../middleware/auth');
const { validateIdParam, validatePaginacao } = require('../middleware/validation');

// Todas as rotas de fornecedor são protegidas

// Listar todos os fornecedores
router.get('/', auth, fornecedorController.listar);

// Obter um fornecedor específico
router.get('/:id', auth, fornecedorController.obter);

// Criar novo fornecedor (apenas admin ou síndico)
router.post('/', auth, checkRole(['admin', 'sindico']), fornecedorController.criar);

// Atualizar fornecedor (apenas admin ou síndico)
router.put('/:id', auth, checkRole(['admin', 'sindico']), fornecedorController.atualizar);

// Excluir fornecedor (apenas admin ou síndico)
router.delete('/:id', auth, checkRole(['admin', 'sindico']), fornecedorController.excluir);

// Listar categorias de fornecedores
router.get('/categorias', auth, fornecedorController.listarCategorias);

module.exports = router;