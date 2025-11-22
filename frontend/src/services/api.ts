import axios from 'axios';

// 🛡️ Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// 🛡️ Instância do axios configurada para segurança
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 🛡️ ESSENCIAL para cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// 🛡️ Interceptador para adicionar access token automaticamente
api.interceptors.request.use(
  (config) => {
    // 🛡️ Pega apenas o access token do localStorage
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

// 🛡️ Interceptador para lidar com respostas e refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🛡️ Se receber 401 e não for rota de auth (login, register, refresh)
    const isAuthRoute = originalRequest.url?.includes('/auth/login') || 
                       originalRequest.url?.includes('/auth/register') || 
                       originalRequest.url?.includes('/auth/refresh');
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      // 🛡️ Só tenta refresh se há um access token armazenado
      const hasAccessToken = localStorage.getItem('accessToken');
      if (!hasAccessToken) {
        return Promise.reject(error);
      }

      try {
        // 🛡️ Tenta fazer refresh - o refresh token vem automaticamente via cookie
        const refreshResponse = await api.post('/auth/refresh');
        const { accessToken } = refreshResponse.data;
        
        // 🛡️ Salva apenas o novo access token
        localStorage.setItem('accessToken', accessToken);
        
        // 🛡️ Refaz a requisição original com o novo token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // 🛡️ Se o refresh falhar, remove access token (cookies são limpos pelo servidor)
        localStorage.removeItem('accessToken');
        // 🛡️ Não forçamos redirecionamento aqui para evitar reloads
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;