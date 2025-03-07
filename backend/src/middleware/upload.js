const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * Configuração do diretório de uploads
 */
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const fullUploadDir = path.resolve(process.cwd(), uploadDir);

// Criar diretório de uploads se não existir
if (!fs.existsSync(fullUploadDir)) {
  fs.mkdirSync(fullUploadDir, { recursive: true });
}

// Subdiretórios por tipo de arquivo
const subDirs = {
  documentos: path.join(fullUploadDir, 'documentos'),
  perfil: path.join(fullUploadDir, 'perfil'),
  inventario: path.join(fullUploadDir, 'inventario'),
  condominio: path.join(fullUploadDir, 'condominio')
};

// Criar subdiretórios
Object.values(subDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Configuração do armazenamento para o multer
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determinar o destino com base no tipo de upload
    const tipo = req.query.tipo || 'documentos';
    const dir = subDirs[tipo] || subDirs.documentos;
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const randomName = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null, `${Date.now()}_${randomName}${extension}`);
  }
});

/**
 * Filtrar tipos de arquivos permitidos
 */
const fileFilter = (req, file, cb) => {
  const tiposPermitidos = {
    documentos: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
    perfil: ['.jpg', '.jpeg', '.png'],
    inventario: ['.jpg', '.jpeg', '.png', '.pdf'],
    condominio: ['.jpg', '.jpeg', '.png']
  };

  const tipo = req.query.tipo || 'documentos';
  const extensao = path.extname(file.originalname).toLowerCase();
  const permitidos = tiposPermitidos[tipo] || tiposPermitidos.documentos;

  if (permitidos.includes(extensao)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido. Apenas ${permitidos.join(', ')} são aceitos.`), false);
  }
};

/**
 * Middleware de upload de arquivo único
 */
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB padrão
  }
}).single('arquivo');

/**
 * Middleware de upload de múltiplos arquivos
 */
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB padrão
  }
}).array('arquivos', 5); // Máximo de 5 arquivos

/**
 * Middleware para tratar erros do multer
 */
const handleUploadError = (req, res, next) => {
  return (err) => {
    if (err instanceof multer.MulterError) {
      // Erro do Multer
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          status: 'error',
          message: 'Arquivo muito grande. Tamanho máximo permitido é 5MB.'
        });
      }
      return res.status(400).json({
        status: 'error',
        message: `Erro no upload: ${err.message}`
      });
    } else if (err) {
      // Outro erro
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
    
    next();
  };
};

/**
 * Middleware wrapper para upload de arquivo único
 */
const upload = (req, res, next) => {
  uploadSingle(req, res, handleUploadError(req, res, next));
};

/**
 * Middleware wrapper para upload de múltiplos arquivos
 */
const uploadMulti = (req, res, next) => {
  uploadMultiple(req, res, handleUploadError(req, res, next));
};

module.exports = {
  upload,
  uploadMulti,
  uploadDir
};