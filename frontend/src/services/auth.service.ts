import api from './api';

// 🛡️ Interface para usuário básico (retornado no login/register)
export interface BasicUser {
  id: string;
  username: string;
  email: string;
  name: string;
}

// 🛡️ Interface para usuário completo (retornado na rota /profile)
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  birthDate: string | null;
  favoriteTeamId: number | null;
  favoriteDriverId: number | null;
  favoriteTeam: {
    id: number;
    name: string;
    fullName: string | null;
    logoUrl: string | null;
    carImageUrl: string | null;
    teamColor: string | null;
    country: string | null;
  } | null;
  favoriteDriver: {
    id: number;
    fullName: string;
    driverNumber: number | null;
    imageUrl: string | null;
  } | null;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  identifier: string; // email ou username
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
  birthDate?: string;
  favoriteTeamId?: number;
  favoriteDriverId?: number;
}

// 🛡️ Resposta segura do backend (sem refresh token no JSON)
export interface AuthResponse {
  user: BasicUser;
  message: string;
  // 🛡️ Nota: refresh tokens vêm apenas via cookies HttpOnly
}

// 🛡️ Resposta segura do refresh (apenas access token no JSON)
export interface RefreshResponse {
  accessToken: string;
  message: string;
  // 🛡️ Nota: refresh token atualizado vem apenas via cookie HttpOnly
}

class AuthService {
  // 🛡️ Registrar novo usuário (versão segura)
  async register(data: RegisterData): Promise<AuthResponse> {
    // 🛡️ Primeiro faz o registro - o servidor define cookies HttpOnly automaticamente
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    // 🛡️ Agora precisa obter o access token via refresh (já que temos o refresh cookie)
    const refreshResponse = await api.post<RefreshResponse>('/auth/refresh');
    
    // 🛡️ Salva apenas o access token no localStorage
    if (refreshResponse.data.accessToken) {
      localStorage.setItem('accessToken', refreshResponse.data.accessToken);
    }
    
    return response.data;
  }

  // 🛡️ Fazer login (versão segura)
  async login(data: LoginData): Promise<AuthResponse> {
    // 🛡️ Primeiro faz o login - o servidor define cookies HttpOnly automaticamente
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // 🛡️ Agora precisa obter o access token via refresh (já que temos o refresh cookie)
    const refreshResponse = await api.post<RefreshResponse>('/auth/refresh');
    
    // 🛡️ Salva apenas o access token no localStorage
    if (refreshResponse.data.accessToken) {
      localStorage.setItem('accessToken', refreshResponse.data.accessToken);
    }
    
    return response.data;
  }

  // 🛡️ Fazer logout (versão segura)
  async logout(): Promise<void> {
    try {
      // 🛡️ O servidor limpa os cookies HttpOnly automaticamente
      await api.post('/auth/logout');
    } catch (error) {
      // Ignora erros de logout
    } finally {
      // 🛡️ Remove apenas o access token do localStorage
      localStorage.removeItem('accessToken');
    }
  }

  // Obter dados do usuário atual (básico)
  async getCurrentUser(): Promise<BasicUser> {
    const response = await api.get<BasicUser>('/auth/me');
    return response.data;
  }

  // 🛡️ Obter dados completos do perfil do usuário
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  }

  // 🛡️ Verificar se está autenticado (verifica apenas access token)
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // 🛡️ Obter access token armazenado
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // 🛡️ Refresh token (já é feito automaticamente pelo interceptador)
  async refreshToken(): Promise<RefreshResponse> {
    // 🛡️ O refresh token vem automaticamente via cookie HttpOnly
    const response = await api.post<RefreshResponse>('/auth/refresh');
    
    // 🛡️ Atualiza apenas o access token no localStorage
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    
    return response.data;
  }
}

export const authService = new AuthService();
export default authService;