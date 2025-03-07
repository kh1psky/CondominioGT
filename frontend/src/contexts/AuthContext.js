import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { setAuthToken, removeAuthToken, getAuthToken } from '../services/auth';

// Criar o contexto
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se o usuário está autenticado ao iniciar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      
      if (token) {
        try {
          // Definir o token no cabeçalho das requisições
          setAuthToken(token);
          
          // Buscar os dados do usuário
          const response = await api.get('/usuarios/perfil');
          setUser(response.data.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          // Se ocorrer um erro, limpar o token
          logout();
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Função de login
  const login = async (email, senha) => {
    try {
      const response = await api.post('/usuarios/login', { email, senha });
      
      const { token, usuario } = response.data.data;
      
      // Armazenar o token
      setAuthToken(token);
      
      // Definir o usuário e estado de autenticação
      setUser(usuario);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login. Tente novamente.'
      };
    }
  };

  // Função de logout
  const logout = () => {
    // Remover o token
    removeAuthToken();
    
    // Resetar o estado
    setUser(null);
    setIsAuthenticated(false);
  };

  // Função para atualizar o perfil do usuário
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/usuarios/atualizar', userData);
      setUser(response.data.data);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar perfil. Tente novamente.'
      };
    }
  };

  // Função para registro de novo usuário
  const register = async (userData) => {
    try {
      const response = await api.post('/usuarios/registrar', userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao registrar usuário. Tente novamente.'
      };
    }
  };

  // Função para solicitar recuperação de senha
  const recoverPassword = async (email) => {
    try {
      const response = await api.post('/usuarios/recuperar-senha', { email });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao solicitar recuperação de senha. Tente novamente.'
      };
    }
  };

  // Função para redefinir senha
  const resetPassword = async (token, novaSenha) => {
    try {
      const response = await api.post('/usuarios/redefinir-senha', { token, novaSenha });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao redefinir senha. Tente novamente.'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateProfile,
        register,
        recoverPassword,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};