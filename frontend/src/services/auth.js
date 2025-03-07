import { api } from './api';

// Token key no localStorage
const TOKEN_KEY = '@condos-app:token';

/**
 * Armazenar token de autenticação no localStorage
 * @param {string} token - Token JWT
 */
export const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

/**
 * Remover token de autenticação do localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  delete api.defaults.headers.common['Authorization'];
};

/**
 * Obter token de autenticação do localStorage
 * @returns {string|null} Token JWT ou null se não existir
 */
export const getAuthToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  return token;
};

/**
 * Verificar se o usuário está autenticado
 * @returns {boolean} true se autenticado, false caso contrário
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};