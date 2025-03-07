/**
 * Utilitários para formatação de dados
 */

/**
 * Formatar número como moeda (BRL)
 * @param {Number} valor - Valor a ser formatado
 * @param {String} moeda - Código da moeda (padrão: BRL)
 * @returns {String} Valor formatado
 */
const formatarMoeda = (valor, moeda = 'BRL') => {
    if (valor === null || valor === undefined) return '';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: moeda
    }).format(valor);
  };
  
  /**
   * Formatar data no padrão brasileiro
   * @param {Date|String} data - Data a ser formatada
   * @param {Boolean} incluirHora - Incluir horas na formatação
   * @returns {String} Data formatada
   */
  const formatarData = (data, incluirHora = false) => {
    if (!data) return '';
    
    const dataObj = data instanceof Date ? data : new Date(data);
    
    if (isNaN(dataObj.getTime())) return '';
    
    const opcoes = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    
    if (incluirHora) {
      Object.assign(opcoes, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    
    return dataObj.toLocaleDateString('pt-BR', opcoes);
  };
  
  /**
   * Formatar CPF (XXX.XXX.XXX-XX)
   * @param {String} cpf - CPF a ser formatado
   * @returns {String} CPF formatado
   */
  const formatarCPF = (cpf) => {
    if (!cpf) return '';
    
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) return cpf;
    
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };
  
  /**
   * Formatar CNPJ (XX.XXX.XXX/XXXX-XX)
   * @param {String} cnpj - CNPJ a ser formatado
   * @returns {String} CNPJ formatado
   */
  const formatarCNPJ = (cnpj) => {
    if (!cnpj) return '';
    
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) return cnpj;
    
    return cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };
  
  /**
   * Formatar telefone ((XX) XXXXX-XXXX ou (XX) XXXX-XXXX)
   * @param {String} telefone - Telefone a ser formatado
   * @returns {String} Telefone formatado
   */
  const formatarTelefone = (telefone) => {
    if (!telefone) return '';
    
    const telefoneLimpo = telefone.replace(/\D/g, '');
    
    if (telefoneLimpo.length < 10) return telefone;
    
    if (telefoneLimpo.length === 11) {
      return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };
  
  /**
   * Formatar CEP (XXXXX-XXX)
   * @param {String} cep - CEP a ser formatado
   * @returns {String} CEP formatado
   */
  const formatarCEP = (cep) => {
    if (!cep) return '';
    
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) return cep;
    
    return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
  };
  
  /**
   * Formatar texto para URL amigável (slug)
   * @param {String} texto - Texto a ser formatado
   * @returns {String} Slug
   */
  const formatarSlug = (texto) => {
    if (!texto) return '';
    
    return texto
      .toString()
      .normalize('NFD') // Normalizar acentos
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Substituir espaços por hífens
      .replace(/[^\w-]+/g, '') // Remover caracteres especiais
      .replace(/--+/g, '-'); // Remover hífens duplicados
  };
  
  /**
   * Formatar número de caracteres (abreviar texto)
   * @param {String} texto - Texto a ser abreviado
   * @param {Number} limite - Limite de caracteres
   * @param {String} sufixo - Sufixo a ser adicionado (padrão: "...")
   * @returns {String} Texto abreviado
   */
  const abreviarTexto = (texto, limite = 100, sufixo = '...') => {
    if (!texto) return '';
    
    if (texto.length <= limite) return texto;
    
    return texto.substring(0, limite).trim() + sufixo;
  };
  
  module.exports = {
    formatarMoeda,
    formatarData,
    formatarCPF,
    formatarCNPJ,
    formatarTelefone,
    formatarCEP,
    formatarSlug,
    abreviarTexto
  };