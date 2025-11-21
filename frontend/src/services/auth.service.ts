import api from './api';

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

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  // Registrar novo usuário
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    // Salva o access token no localStorage
    if (response.data.tokens.accessToken) {
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
    }
    
    return response.data;
  }

  // Fazer login
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Salva o access token no localStorage
    if (response.data.tokens.accessToken) {
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
    }
    
    return response.data;
  }

  // Fazer logout
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignora erros de logout
    } finally {
      // Remove o token do localStorage independente do resultado
      localStorage.removeItem('accessToken');
    }
  }

  // Obter dados do usuário atual
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Obter token armazenado
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Refresh token (já é feito automaticamente pelo interceptador)
  async refreshToken(): Promise<RefreshResponse> {
    const response = await api.post<RefreshResponse>('/auth/refresh');
    
    // Atualiza o token no localStorage
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    
    return response.data;
  }
}

export const authService = new AuthService();
export default authService;