/**
 * Utilitários para manipulação de arquivos
 */
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const mime = require('mime-types');

// Definir diretório base de uploads
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const baseUploadPath = path.resolve(process.cwd(), uploadDir);

/**
 * Garantir que um diretório existe
 * @param {String} diretorio - Caminho do diretório
 */
const garantirDiretorio = async (diretorio) => {
  try {
    await fs.access(diretorio);
  } catch (error) {
    await fs.mkdir(diretorio, { recursive: true });
  }
};

/**
 * Salvar arquivo
 * @param {Buffer|Stream} arquivo - Dados do arquivo
 * @param {String} nome - Nome do arquivo
 * @param {String} subdir - Subdiretório (opcional)
 * @returns {String} Caminho relativo do arquivo salvo
 */
const salvarArquivo = async (arquivo, nome, subdir = '') => {
  // Garantir que o diretório existe
  const dirDestino = path.join(baseUploadPath, subdir);
  await garantirDiretorio(dirDestino);
  
  // Gerar nome único para o arquivo
  const extensao = path.extname(nome);
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const nomeArquivo = `${timestamp}_${randomString}${extensao}`;
  
  // Caminho completo para salvar o arquivo
  const caminhoArquivo = path.join(dirDestino, nomeArquivo);
  
  // Salvar o arquivo
  await fs.writeFile(caminhoArquivo, arquivo);
  
  // Retornar caminho relativo
  return path.join(subdir, nomeArquivo).replace(/\\/g, '/');
};

/**
 * Excluir arquivo
 * @param {String} caminhoRelativo - Caminho relativo do arquivo
 * @returns {Boolean} Verdadeiro se o arquivo foi excluído
 */
const excluirArquivo = async (caminhoRelativo) => {
  if (!caminhoRelativo) return false;
  
  try {
    const caminhoCompleto = path.join(baseUploadPath, caminhoRelativo);
    await fs.unlink(caminhoCompleto);
    return true;
  } catch (error) {
    // Ignorar erro se o arquivo não existir
    if (error.code === 'ENOENT') return true;
    
    throw error;
  }
};

/**
 * Ler arquivo
 * @param {String} caminhoRelativo - Caminho relativo do arquivo
 * @returns {Buffer} Conteúdo do arquivo
 */
const lerArquivo = async (caminhoRelativo) => {
  const caminhoCompleto = path.join(baseUploadPath, caminhoRelativo);
  return await fs.readFile(caminhoCompleto);
};

/**
 * Verificar se o arquivo existe
 * @param {String} caminhoRelativo - Caminho relativo do arquivo
 * @returns {Boolean} Verdadeiro se o arquivo existe
 */
const arquivoExiste = async (caminhoRelativo) => {
  try {
    const caminhoCompleto = path.join(baseUploadPath, caminhoRelativo);
    await fs.access(caminhoCompleto);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Obter informações do arquivo
 * @param {String} caminhoRelativo - Caminho relativo do arquivo
 * @returns {Object} Informações do arquivo
 */
const infoArquivo = async (caminhoRelativo) => {
  const caminhoCompleto = path.join(baseUploadPath, caminhoRelativo);
  const stats = await fs.stat(caminhoCompleto);
  
  return {
    nome: path.basename(caminhoRelativo),
    tamanho: stats.size,
    criado: stats.birthtime,
    modificado: stats.mtime,
    mimetype: mime.lookup(caminhoRelativo) || 'application/octet-stream',
    extensao: path.extname(caminhoRelativo).toLowerCase()
  };
};

/**
 * Listar arquivos em um diretório
 * @param {String} subdir - Subdiretório (opcional)
 * @returns {Array} Lista de arquivos
 */
const listarArquivos = async (subdir = '') => {
  const dirPath = path.join(baseUploadPath, subdir);
  
  try {
    // Garantir que o diretório existe
    await garantirDiretorio(dirPath);
    
    // Listar arquivos
    const files = await fs.readdir(dirPath);
    
    // Obter informações de cada arquivo
    const fileInfos = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(subdir, file);
        try {
          return await infoArquivo(filePath);
        } catch (error) {
          return null;
        }
      })
    );
    
    // Filtrar arquivos inválidos
    return fileInfos.filter(Boolean);
  } catch (error) {
    return [];
  }
};

/**
 * Mover arquivo
 * @param {String} origem - Caminho relativo do arquivo de origem
 * @param {String} destino - Caminho relativo do arquivo de destino
 * @returns {Boolean} Verdadeiro se o arquivo foi movido
 */
const moverArquivo = async (origem, destino) => {
  const caminhoOrigem = path.join(baseUploadPath, origem);
  const caminhoDestino = path.join(baseUploadPath, destino);
  
  // Garantir que o diretório de destino existe
  const dirDestino = path.dirname(caminhoDestino);
  await garantirDiretorio(dirDestino);
  
  // Mover o arquivo
  await fs.rename(caminhoOrigem, caminhoDestino);
  
  return true;
};

/**
 * Copiar arquivo
 * @param {String} origem - Caminho relativo do arquivo de origem
 * @param {String} destino - Caminho relativo do arquivo de destino
 * @returns {Boolean} Verdadeiro se o arquivo foi copiado
 */
const copiarArquivo = async (origem, destino) => {
  const caminhoOrigem = path.join(baseUploadPath, origem);
  const caminhoDestino = path.join(baseUploadPath, destino);
  
  // Garantir que o diretório de destino existe
  const dirDestino = path.dirname(caminhoDestino);
  await garantirDiretorio(dirDestino);
  
  // Copiar o arquivo
  await fs.copyFile(caminhoOrigem, caminhoDestino);
  
  return true;
};

module.exports = {
  garantirDiretorio,
  salvarArquivo,
  excluirArquivo,
  lerArquivo,
  arquivoExiste,
  infoArquivo,
  listarArquivos,
  moverArquivo,
  copiarArquivo,
  uploadDir
};