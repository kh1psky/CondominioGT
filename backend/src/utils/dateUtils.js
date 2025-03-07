/**
 * Utilitários para manipulação de datas
 */

/**
 * Formatar data para o banco de dados (ISO)
 * @param {Date|String} data - Data a ser formatada
 * @returns {String} Data formatada (YYYY-MM-DD)
 */
const formatarDataIso = (data) => {
    if (!data) return null;
    
    const dataObj = data instanceof Date ? data : new Date(data);
    
    if (isNaN(dataObj.getTime())) return null;
    
    return dataObj.toISOString().split('T')[0];
  };
  
  /**
   * Formatar data e hora para o banco de dados (ISO)
   * @param {Date|String} data - Data a ser formatada
   * @returns {String} Data e hora formatada (YYYY-MM-DD HH:MM:SS)
   */
  const formatarDataHoraIso = (data) => {
    if (!data) return null;
    
    const dataObj = data instanceof Date ? data : new Date(data);
    
    if (isNaN(dataObj.getTime())) return null;
    
    return dataObj.toISOString().replace('T', ' ').split('.')[0];
  };
  
  /**
   * Adicionar dias a uma data
   * @param {Date|String} data - Data base
   * @param {Number} dias - Número de dias a adicionar
   * @returns {Date} Nova data
   */
  const adicionarDias = (data, dias) => {
    if (!data) return null;
    
    const dataObj = data instanceof Date ? new Date(data) : new Date(data);
    
    if (isNaN(dataObj.getTime())) return null;
    
    dataObj.setDate(dataObj.getDate() + dias);
    
    return dataObj;
  };
  
  /**
   * Adicionar meses a uma data
   * @param {Date|String} data - Data base
   * @param {Number} meses - Número de meses a adicionar
   * @returns {Date} Nova data
   */
  const adicionarMeses = (data, meses) => {
    if (!data) return null;
    
    const dataObj = data instanceof Date ? new Date(data) : new Date(data);
    
    if (isNaN(dataObj.getTime())) return null;
    
    dataObj.setMonth(dataObj.getMonth() + meses);
    
    return dataObj;
  };
  
  /**
   * Adicionar anos a uma data
   * @param {Date|String} data - Data base
   * @param {Number} anos - Número de anos a adicionar
   * @returns {Date} Nova data
   */
  const adicionarAnos = (data, anos) => {
    if (!data) return null;
    
    const dataObj = data instanceof Date ? new Date(data) : new Date(data);
    
    if (isNaN(dataObj.getTime())) return null;
    
    dataObj.setFullYear(dataObj.getFullYear() + anos);
    
    return dataObj;
  };
  
  /**
   * Calcular diferença entre datas em dias
   * @param {Date|String} dataInicial - Data inicial
   * @param {Date|String} dataFinal - Data final
   * @returns {Number} Diferença em dias
   */
  const diferencaEmDias = (dataInicial, dataFinal) => {
    if (!dataInicial || !dataFinal) return 0;
    
    const dataIni = dataInicial instanceof Date ? dataInicial : new Date(dataInicial);
    const dataFim = dataFinal instanceof Date ? dataFinal : new Date(dataFinal);
    
    if (isNaN(dataIni.getTime()) || isNaN(dataFim.getTime())) return 0;
    
    // Converter para UTC para evitar problemas com horário de verão
    const utc1 = Date.UTC(dataIni.getFullYear(), dataIni.getMonth(), dataIni.getDate());
    const utc2 = Date.UTC(dataFim.getFullYear(), dataFim.getMonth(), dataFim.getDate());
    
    // Converter para dias (86400000 = 1000 * 60 * 60 * 24)
    return Math.floor((utc2 - utc1) / 86400000);
  };
  
  /**
   * Calcular diferença entre datas em meses
   * @param {Date|String} dataInicial - Data inicial
   * @param {Date|String} dataFinal - Data final
   * @returns {Number} Diferença em meses
   */
  const diferencaEmMeses = (dataInicial, dataFinal) => {
    if (!dataInicial || !dataFinal) return 0;
    
    const dataIni = dataInicial instanceof Date ? dataInicial : new Date(dataInicial);
    const dataFim = dataFinal instanceof Date ? dataFinal : new Date(dataFinal);
    
    if (isNaN(dataIni.getTime()) || isNaN(dataFim.getTime())) return 0;
    
    const anos = dataFim.getFullYear() - dataIni.getFullYear();
    const meses = dataFim.getMonth() - dataIni.getMonth();
    
    return anos * 12 + meses;
  };
  
  /**
   * Calcular diferença entre datas em anos
   * @param {Date|String} dataInicial - Data inicial
   * @param {Date|String} dataFinal - Data final
   * @returns {Number} Diferença em anos
   */
  const diferencaEmAnos = (dataInicial, dataFinal) => {
    if (!dataInicial || !dataFinal) return 0;
    
    const dataIni = dataInicial instanceof Date ? dataInicial : new Date(dataInicial);
    const dataFim = dataFinal instanceof Date ? dataFinal : new Date(dataFinal);
    
    if (isNaN(dataIni.getTime()) || isNaN(dataFim.getTime())) return 0;
    
    let anos = dataFim.getFullYear() - dataIni.getFullYear();
    
    if (dataFim.getMonth() < dataIni.getMonth() || 
        (dataFim.getMonth() === dataIni.getMonth() && dataFim.getDate() < dataIni.getDate())) {
      anos--;
    }
    
    return anos;
  };
  
  /**
   * Verificar se a data é hoje
   * @param {Date|String} data - Data a ser verificada
   * @returns {Boolean} Verdadeiro se a data for hoje
   */
  const ehHoje = (data) => {
    if (!data) return false;
    
    const dataObj = data instanceof Date ? data : new Date(data);
    
    if (isNaN(dataObj.getTime())) return false;
    
    const hoje = new Date();
    
    return dataObj.getDate() === hoje.getDate() &&
           dataObj.getMonth() === hoje.getMonth() &&
           dataObj.getFullYear() === hoje.getFullYear();
  };
  
  /**
   * Verificar se a data é futura
   * @param {Date|String} data - Data a ser verificada
   * @returns {Boolean} Verdadeiro se a data for futura
   */
  const ehFutura = (data) => {
    if (!data) return false;
    
    const dataObj = data instanceof Date ? data : new Date(data);
    
    if (isNaN(dataObj.getTime())) return false;
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    return dataObj > hoje;
  };
  
  /**
   * Verificar se a data é passada
   * @param {Date|String} data - Data a ser verificada
   * @returns {Boolean} Verdadeiro se a data for passada
   */
  const ehPassada = (data) => {
    if (!data) return false;
    
    const dataObj = data instanceof Date ? data : new Date(data);
    
    if (isNaN(dataObj.getTime())) return false;
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    return dataObj < hoje;
  };
  
  /**
   * Obter primeiro dia do mês
   * @param {Date|String} data - Data de referência
   * @returns {Date} Primeiro dia do mês
   */
  const primeiroDiaDoMes = (data) => {
    if (!data) {
      const hoje = new Date();
      return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }
    
    const dataObj = data instanceof Date ? data : new Date(data);
    
    if (isNaN(dataObj.getTime())) {
      const hoje = new Date();
      return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }
    
    return new Date(dataObj.getFullYear(), dataObj.getMonth(), 1);
  };
  
  /**
   * Obter último dia do mês
   * @param {Date|String} data - Data de referência
   * @returns {Date} Último dia do mês
   */
  const ultimoDiaDoMes = (data) => {
    if (!data) {
      const hoje = new Date();
      return new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    }
    
    const dataObj = data instanceof Date ? data : new Date(data);
    
    if (isNaN(dataObj.getTime())) {
      const hoje = new Date();
      return new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    }
    
    return new Date(dataObj.getFullYear(), dataObj.getMonth() + 1, 0);
  };
  
  module.exports = {
    formatarDataIso,
    formatarDataHoraIso,
    adicionarDias,
    adicionarMeses,
    adicionarAnos,
    diferencaEmDias,
    diferencaEmMeses,
    diferencaEmAnos,
    ehHoje,
    ehFutura,
    ehPassada,
    primeiroDiaDoMes,
    ultimoDiaDoMes
  };