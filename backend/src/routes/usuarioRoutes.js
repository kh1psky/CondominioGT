const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { auth, checkRole } = require('../middleware/auth');
const { validateIdParam, validateUsuarioIdParam, validatePaginacao } = require('../middleware/validation');

// Rotas públicas
router.post('/login', usuarioController.login);
router.post('/recuperar-senha', usuarioController.recuperarSenha);
router.post('/redefinir-senha', usuarioController.redefinirSenha);

// Rota para registro (pode ser pública ou protegida dependendo do requisito)
router.post('/registrar', usuarioController.registrar);

// Rotas protegidas
router.get('/perfil', auth, usuarioController.getPerfil);
router.put('/atualizar', auth, usuarioController.atualizar);

// Rotas administrativas
router.get('/', auth, checkRole(['admin', 'sindico']), usuarioController.listar);

module.exports = router;