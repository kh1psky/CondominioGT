/**
 * Utilitários para validação de dados
 */

/**
 * Validar CPF
 * @param {String} cpf - CPF a ser validado
 * @returns {Boolean} Verdadeiro se o CPF for válido
 */
const validarCPF = (cpf) => {
    if (!cpf) return false;
    
    // Remover caracteres não numéricos
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    // Verificar tamanho
    if (cpfLimpo.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpfLimpo)) return false;
    
    // Validar dígitos verificadores
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;
    
    return true;
  };
  
  /**
   * Validar CNPJ
   * @param {String} cnpj - CNPJ a ser validado
   * @returns {Boolean} Verdadeiro se o CNPJ for válido
   */
  const validarCNPJ = (cnpj) => {
    if (!cnpj) return false;
    
    // Remover caracteres não numéricos
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    // Verificar tamanho
    if (cnpjLimpo.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpjLimpo)) return false;
    
    // Validar dígitos verificadores
    let tamanho = cnpjLimpo.length - 2;
    let numeros = cnpjLimpo.substring(0, tamanho);
    const digitos = cnpjLimpo.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    tamanho += 1;
    numeros = cnpjLimpo.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
  };
  
  /**
   * Validar endereço de e-mail
   * @param {String} email - E-mail a ser validado
   * @returns {Boolean} Verdadeiro se o e-mail for válido
   */
  const validarEmail = (email) => {
    if (!email) return false;
    
    // Expressão regular para validar e-mail
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    return regex.test(email);
  };
  
  /**
   * Validar telefone
   * @param {String} telefone - Telefone a ser validado
   * @returns {Boolean} Verdadeiro se o telefone for válido
   */
  const validarTelefone = (telefone) => {
    if (!telefone) return false;
    
    // Remover caracteres não numéricos
    const telefoneLimpo = telefone.replace(/\D/g, '');
    
    // Verificar tamanho
    return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
  };
  
  /**
   * Validar CEP
   * @param {String} cep - CEP a ser validado
   * @returns {Boolean} Verdadeiro se o CEP for válido
   */
  const validarCEP = (cep) => {
    if (!cep) return false;
    
    // Remover caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Verificar tamanho
    return cepLimpo.length === 8;
  };
  
  /**
   * Validar valor monetário
   * @param {Number|String} valor - Valor a ser validado
   * @returns {Boolean} Verdadeiro se o valor for válido
   */
  const validarValorMonetario = (valor) => {
    if (valor === null || valor === undefined || valor === '') return false;
    
    // Converter para número se for string
    const valorNumerico = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
    
    // Verificar se é um número e se é não-negativo
    return !isNaN(valorNumerico) && valorNumerico >= 0;
  };
  
  /**
   * Validar data
   * @param {Date|String} data - Data a ser validada
   * @returns {Boolean} Verdadeiro se a data for válida
   */
  const validarData = (data) => {
    if (!data) return false;
    
    const dataObj = data instanceof Date ? data : new Date(data);
    
    return !isNaN(dataObj.getTime());
  };
  
  /**
   * Validar senha forte
   * @param {String} senha - Senha a ser validada
   * @param {Object} opcoes - Opções de validação
   * @returns {Boolean} Verdadeiro se a senha for forte
   */
  const validarSenhaForte = (senha, opcoes = {}) => {
    if (!senha) return false;
    
    const {
      minimo = 8,
      maiuscula = true,
      minuscula = true,
      numero = true,
      especial = true
    } = opcoes;
    
    // Verificar tamanho mínimo
    if (senha.length < minimo) return false;
    
    // Verificar letras maiúsculas
    if (maiuscula && !/[A-Z]/.test(senha)) return false;
    
    // Verificar letras minúsculas
    if (minuscula && !/[a-z]/.test(senha)) return false;
    
    // Verificar números
    if (numero && !/[0-9]/.test(senha)) return false;
    
    // Verificar caracteres especiais
    if (especial && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha)) return false;
    
    return true;
  };
  
  module.exports = {
    validarCPF,
    validarCNPJ,
    validarEmail,
    validarTelefone,
    validarCEP,
    validarValorMonetario,
    validarData,
    validarSenhaForte
  };