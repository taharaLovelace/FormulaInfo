import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Instância do axios configurada
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Importante para cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptador para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    // Pega o token do localStorage se existir
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador para lidar com respostas e refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se receber 401 e não for rota de auth (login, register, refresh)
    const isAuthRoute = originalRequest.url?.includes('/auth/login') || 
                       originalRequest.url?.includes('/auth/register') || 
                       originalRequest.url?.includes('/auth/refresh');
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      // Só tenta refresh se há um token armazenado
      const hasToken = localStorage.getItem('accessToken');
      if (!hasToken) {
        return Promise.reject(error);
      }

      try {
        // Tenta fazer refresh do token
        const refreshResponse = await api.post('/auth/refresh');
        const { accessToken } = refreshResponse.data;
        
        // Salva o novo token
        localStorage.setItem('accessToken', accessToken);
        
        // Refaz a requisição original com o novo token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Se o refresh falhar, remove tokens
        localStorage.removeItem('accessToken');
        // Não forçamos redirecionamento aqui para evitar reloads
        // O componente de autenticação vai lidar com isso
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;