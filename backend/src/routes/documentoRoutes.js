const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');
const { auth, checkRole } = require('../middleware/auth');
const { validateIdParam, validatePaginacao } = require('../middleware/validation');
const upload = require('../middleware/upload');

// Todas as rotas de documento são protegidas

// Listar todos os documentos
router.get('/', auth, documentoController.listar);

// Obter um documento específico
router.get('/:id', auth, documentoController.obter);

// Fazer upload de um novo documento (apenas admin ou síndico)
router.post('/', auth, checkRole(['admin', 'sindico']), upload.single('arquivo'), documentoController.upload);

// Atualizar informações de um documento (apenas admin ou síndico)
router.put('/:id', auth, checkRole(['admin', 'sindico']), documentoController.atualizar);

// Excluir documento (apenas admin ou síndico)
router.delete('/:id', auth, checkRole(['admin', 'sindico']), documentoController.excluir);

// Download de documento
router.get('/:id/download', auth, documentoController.download);

// Listar tipos de documentos
router.get('/tipos', auth, documentoController.listarTipos);

// Listar documentos por condomínio
router.get('/condominio/:condominioId', auth, documentoController.listarPorCondominio);

module.exports = router;