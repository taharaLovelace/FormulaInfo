/**
 * @fileoverview Configuração do cliente HTTP Axios
 * @description Este módulo configura o Axios para comunicação com a API,
 * incluindo interceptadores para autenticação automática e refresh de tokens.
 * 
 * @module api
 * @requires axios
 */

import axios from 'axios';

/** URL base da API obtida das variáveis de ambiente */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Instância do Axios configurada para a API
 * 
 * Configurações de segurança:
 * - withCredentials: true para envio automático de cookies HttpOnly
 * - timeout: 10 segundos para evitar requisições travadas
 * 
 * @constant
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Essencial para cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Interceptador de requisição
 * Adiciona automaticamente o access token em todas as requisições
 */
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptador de resposta
 * Lida com erros 401 fazendo refresh automático do token
 * 
 * Fluxo:
 * 1. Recebe erro 401 (não autorizado)
 * 2. Verifica se não é rota de autenticação
 * 3. Tenta fazer refresh do token via cookie
 * 4. Se sucesso, refaz a requisição original
 * 5. Se falha, limpa tokens e rejeita
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Verifica se é rota de autenticação (não deve fazer refresh)
    const isAuthRoute = originalRequest.url?.includes('/auth/login') || 
                       originalRequest.url?.includes('/auth/register') || 
                       originalRequest.url?.includes('/auth/refresh');
    
    // Tenta refresh se for 401 e não for rota de auth
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      // Só tenta refresh se há um access token armazenado
      const hasAccessToken = localStorage.getItem('accessToken');
      if (!hasAccessToken) {
        return Promise.reject(error);
      }

      try {
        // Faz refresh - o refresh token vem automaticamente via cookie
        const refreshResponse = await api.post('/auth/refresh');
        const { accessToken } = refreshResponse.data;
        
        // Salva novo access token
        localStorage.setItem('accessToken', accessToken);
        
        // Refaz a requisição original com o novo token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Se refresh falhar, limpa o access token
        localStorage.removeItem('accessToken');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;