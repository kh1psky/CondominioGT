import { api } from './api';

/**
 * Serviço para operações relacionadas a condomínios
 */
const condominioService = {
  /**
   * Listar todos os condomínios
   * @param {Object} params - Parâmetros de paginação e filtro
   * @returns {Promise} Resultado da requisição
   */
  listarCondominios: async (params = {}) => {
    try {
      const response = await api.get('/condominios', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao listar condomínios:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar condomínios'
      };
    }
  },

  /**
   * Obter detalhes de um condomínio específico
   * @param {number} id - ID do condomínio
   * @returns {Promise} Resultado da requisição
   */
  obterCondominio: async (id) => {
    try {
      const response = await api.get(`/condominios/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Erro ao obter condomínio ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar detalhes do condomínio'
      };
    }
  },

  /**
   * Criar novo condomínio
   * @param {Object} condominio - Dados do condomínio
   * @returns {Promise} Resultado da requisição
   */
  criarCondominio: async (condominio) => {
    try {
      const response = await api.post('/condominios', condominio);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao criar condomínio:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar condomínio',
        errors: error.response?.data?.errors
      };
    }
  },

  /**
   * Atualizar condomínio existente
   * @param {number} id - ID do condomínio
   * @param {Object} condominio - Dados atualizados
   * @returns {Promise} Resultado da requisição
   */
  atualizarCondominio: async (id, condominio) => {
    try {
      const response = await api.put(`/condominios/${id}`, condominio);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Erro ao atualizar condomínio ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar condomínio',
        errors: error.response?.data?.errors
      };
    }
  },

  /**
   * Excluir condomínio
   * @param {number} id - ID do condomínio
   * @returns {Promise} Resultado da requisição
   */
  excluirCondominio: async (id) => {
    try {
      const response = await api.delete(`/condominios/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Erro ao excluir condomínio ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir condomínio'
      };
    }
  },

  /**
   * Obter estatísticas do condomínio
   * @param {number} id - ID do condomínio
   * @returns {Promise} Resultado da requisição
   */
  obterEstatisticas: async (id) => {
    try {
      const response = await api.get(`/condominios/${id}/estatisticas`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Erro ao obter estatísticas do condomínio ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar estatísticas do condomínio'
      };
    }
  },

  /**
   * Listar condomínios por síndico
   * @param {number} sindicoId - ID do síndico
   * @returns {Promise} Resultado da requisição
   */
  listarCondominiosPorSindico: async (sindicoId) => {
    try {
      const response = await api.get(`/condominios/sindico/${sindicoId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Erro ao listar condomínios do síndico ${sindicoId}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar condomínios do síndico'
      };
    }
  }
};

export default condominioService;