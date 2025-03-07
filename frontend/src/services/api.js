import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratar erros de autenticação (401)
    if (error.response && error.response.status === 401) {
      // Se não for uma rota de autenticação
      if (
        !error.config.url.includes('/login') &&
        !error.config.url.includes('/recuperar-senha') &&
        !error.config.url.includes('/redefinir-senha')
      ) {
        // Limpar token e redirecionar para login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;