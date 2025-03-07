/**
 * Funções auxiliares diversas
 */
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

/**
 * Gerar string aleatória
 * @param {Number} tamanho - Tamanho da string (padrão: 16)
 * @returns {String} String aleatória
 */
const gerarStringAleatoria = (tamanho = 16) => {
  return crypto.randomBytes(tamanho).toString('hex');
};

/**
 * Gerar token de recuperação de senha
 * @returns {String} Token
 */
const gerarTokenRecuperacao = () => {
  return crypto.randomBytes(20).toString('hex');
};

/**
 * Gerar código alfanumérico (ex: para códigos de verificação)
 * @param {Number} tamanho - Tamanho do código (padrão: 6)
 * @returns {String} Código alfanumérico
 */
const gerarCodigoAlfanumerico = (tamanho = 6) => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let resultado = '';
  
  for (let i = 0; i < tamanho; i++) {
    resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  
  return resultado;
};

/**
 * Gerar número de série para inventário
 * @param {String} prefixo - Prefixo do número de série (padrão: "INV")
 * @returns {String} Número de série
 */
const gerarNumeroSerie = (prefixo = 'INV') => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${prefixo}-${timestamp}-${random}`;
};

/**
 * Remover arquivo
 * @param {String} caminho - Caminho do arquivo
 * @returns {Promise} Promise
 */
const removerArquivo = async (caminho) => {
  if (!caminho) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    fs.unlink(caminho, (err) => {
      if (err && err.code !== 'ENOENT') {
        return reject(err);
      }
      
      resolve();
    });
  });
};

/**
 * Obter extensão de arquivo
 * @param {String} nomeArquivo - Nome do arquivo
 * @returns {String} Extensão do arquivo
 */
const obterExtensaoArquivo = (nomeArquivo) => {
  if (!nomeArquivo) return '';
  
  return path.extname(nomeArquivo).toLowerCase();
};

/**
 * Verificar se é uma imagem
 * @param {String} nomeArquivo - Nome do arquivo
 * @returns {Boolean} Verdadeiro se for uma imagem
 */
const ehImagem = (nomeArquivo) => {
  if (!nomeArquivo) return false;
  
  const extensoesImagem = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'];
  const extensao = obterExtensaoArquivo(nomeArquivo);
  
  return extensoesImagem.includes(extensao);
};

/**
 * Verificar se é um PDF
 * @param {String} nomeArquivo - Nome do arquivo
 * @returns {Boolean} Verdadeiro se for um PDF
 */
const ehPDF = (nomeArquivo) => {
  if (!nomeArquivo) return false;
  
  return obterExtensaoArquivo(nomeArquivo) === '.pdf';
};

/**
 * Verificar se é um documento do Office
 * @param {String} nomeArquivo - Nome do arquivo
 * @returns {Boolean} Verdadeiro se for um documento do Office
 */
const ehDocumentoOffice = (nomeArquivo) => {
  if (!nomeArquivo) return false;
  
  const extensoesOffice = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
  const extensao = obterExtensaoArquivo(nomeArquivo);
  
  return extensoesOffice.includes(extensao);
};

/**
 * Remover acentos
 * @param {String} texto - Texto com acentos
 * @returns {String} Texto sem acentos
 */
const removerAcentos = (texto) => {
  if (!texto) return '';
  
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

/**
 * Calcular idade a partir da data de nascimento
 * @param {Date|String} dataNascimento - Data de nascimento
 * @returns {Number} Idade
 */
const calcularIdade = (dataNascimento) => {
  if (!dataNascimento) return 0;
  
  const dataNasc = dataNascimento instanceof Date 
    ? dataNascimento 
    : new Date(dataNascimento);
  
  if (isNaN(dataNasc.getTime())) return 0;
  
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNasc.getFullYear();
  const meses = hoje.getMonth() - dataNasc.getMonth();
  
  if (meses < 0 || (meses === 0 && hoje.getDate() < dataNasc.getDate())) {
    idade--;
  }
  
  return idade;
};

/**
 * Paginar array
 * @param {Array} array - Array a ser paginado
 * @param {Number} pagina - Número da página (começando em 1)
 * @param {Number} limite - Itens por página
 * @returns {Object} Resultado paginado
 */
const paginarArray = (array, pagina = 1, limite = 10) => {
  const pag = parseInt(pagina);
  const lim = parseInt(limite);
  
  const inicio = (pag - 1) * lim;
  const fim = inicio + lim;
  
  const itens = array.slice(inicio, fim);
  
  return {
    data: itens,
    meta: {
      total: array.length,
      page: pag,
      limit: lim,
      pages: Math.ceil(array.length / lim)
    }
  };
};

/**
 * Calcular juros simples
 * @param {Number} valor - Valor principal
 * @param {Number} taxa - Taxa de juros (ex: 0.02 para 2%)
 * @param {Number} dias - Número de dias
 * @returns {Number} Valor com juros
 */
const calcularJurosSimples = (valor, taxa, dias) => {
  if (!valor || !taxa || !dias) return valor || 0;
  
  const taxaDiaria = taxa / 30; // Taxa mensal para diária
  const juros = valor * taxaDiaria * dias;
  
  return valor + juros;
};

/**
 * Calcular multa
 * @param {Number} valor - Valor principal
 * @param {Number} percentual - Percentual da multa (ex: 0.02 para 2%)
 * @returns {Number} Valor da multa
 */
const calcularMulta = (valor, percentual) => {
  if (!valor || !percentual) return 0;
  
  return valor * percentual;
};

module.exports = {
  gerarStringAleatoria,
  gerarTokenRecuperacao,
  gerarCodigoAlfanumerico,
  gerarNumeroSerie,
  removerArquivo,
  obterExtensaoArquivo,
  ehImagem,
  ehPDF,
  ehDocumentoOffice,
  removerAcentos,
  calcularIdade,
  paginarArray,
  calcularJurosSimples,
  calcularMulta
};