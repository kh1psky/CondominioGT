const express = require('express');
const router = express.Router();
const notificacaoController = require('../controllers/notificacaoController');
const { auth, checkRole } = require('../middleware/auth');
const { validateIdParam, validatePaginacao } = require('../middleware/validation');

// Todas as rotas de notificação são protegidas

// Listar todas as notificações
router.get('/', auth, notificacaoController.listar);

// Obter uma notificação específica
router.get('/:id', auth, notificacaoController.obter);

// Criar nova notificação (apenas admin ou síndico)
router.post('/', auth, checkRole(['admin', 'sindico']), notificacaoController.criar);

// Marcar notificação como lida
router.put('/:id/ler', auth, notificacaoController.marcarComoLida);

// Excluir notificação
router.delete('/:id', auth, notificacaoController.excluir);

// Listar notificações por usuário
router.get('/usuario/:usuarioId', auth, notificacaoController.listarPorUsuario);

// Enviar notificação para todos os usuários de um condomínio (apenas admin ou síndico)
router.post('/condominio/:condominioId', auth, checkRole(['admin', 'sindico']), notificacaoController.enviarParaCondominio);

module.exports = router;