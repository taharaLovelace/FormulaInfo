/**
 * @fileoverview Serviço de autenticação do frontend
 * @description Este módulo encapsula todas as operações de autenticação,
 * incluindo login, registro, logout e gerenciamento de tokens.
 * Os refresh tokens são gerenciados via cookies HttpOnly pelo backend.
 * 
 * @module auth.service
 * @requires ./api
 */

import api from './api';

// ==================== INTERFACES ====================

/**
 * Dados básicos do usuário (retornado no login/register)
 * @interface BasicUser
 */
export interface BasicUser {
  id: string;
  username: string;
  email: string;
  name: string;
}

/**
 * Dados completos do usuário (retornado na rota /profile)
 * Inclui preferências de equipe e piloto favoritos
 * @interface User
 */
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

/**
 * Dados para login
 * @interface LoginData
 */
export interface LoginData {
  /** Email ou username */
  identifier: string;
  password: string;
}

/**
 * Dados para registro de novo usuário
 * @interface RegisterData
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
  birthDate?: string;
  favoriteTeamId?: number;
  favoriteDriverId?: number;
}

/**
 * Resposta de autenticação do backend
 * Nota: refresh tokens são enviados via cookies HttpOnly
 * @interface AuthResponse
 */
export interface AuthResponse {
  user: BasicUser;
  message: string;
}

/**
 * Resposta do endpoint de refresh
 * @interface RefreshResponse
 */
export interface RefreshResponse {
  accessToken: string;
  message: string;
}

/**
 * Serviço de autenticação
 * Gerencia todas as operações de auth com a API
 * @class AuthService
 */
class AuthService {
  /**
   * Registra um novo usuário
   * @param {RegisterData} data - Dados do novo usuário
   * @returns {Promise<AuthResponse>} Dados do usuário criado
   * 
   * @description
   * 1. Faz o registro - servidor define cookies HttpOnly
   * 2. Faz refresh para obter o access token
   * 3. Salva access token no localStorage
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    // Obtém access token via refresh (já temos o refresh cookie)
    const refreshResponse = await api.post<RefreshResponse>('/auth/refresh');
    
    if (refreshResponse.data.accessToken) {
      localStorage.setItem('accessToken', refreshResponse.data.accessToken);
    }
    
    return response.data;
  }

  /**
   * Realiza login do usuário
   * @param {LoginData} data - Credenciais de login
   * @returns {Promise<AuthResponse>} Dados do usuário logado
   * 
   * @description
   * 1. Faz o login - servidor define cookies HttpOnly
   * 2. Faz refresh para obter o access token
   * 3. Salva access token no localStorage
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Obtém access token via refresh (já temos o refresh cookie)
    const refreshResponse = await api.post<RefreshResponse>('/auth/refresh');
    
    if (refreshResponse.data.accessToken) {
      localStorage.setItem('accessToken', refreshResponse.data.accessToken);
    }
    
    return response.data;
  }

  /**
   * Realiza logout do usuário
   * Remove tokens locais e invalida sessão no servidor
   * @returns {Promise<void>}
   */
  async logout(): Promise<void> {
    try {
      // Servidor limpa os cookies HttpOnly
      await api.post('/auth/logout');
    } catch (error) {
      // Ignora erros de logout
    } finally {
      // Remove access token do localStorage
      localStorage.removeItem('accessToken');
    }
  }

  /**
   * Obtém dados básicos do usuário atual
   * @returns {Promise<BasicUser>} Dados básicos do usuário
   */
  async getCurrentUser(): Promise<BasicUser> {
    const response = await api.get<BasicUser>('/auth/me');
    return response.data;
  }

  /**
   * Obtém dados completos do perfil do usuário
   * Inclui preferências de equipe e piloto favoritos
   * @returns {Promise<User>} Perfil completo do usuário
   */
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  }

  /**
   * Verifica se o usuário está autenticado
   * Baseado na presença do access token no localStorage
   * @returns {boolean} True se autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Obtém o access token armazenado
   * @returns {string | null} Token ou null
   */
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Renova os tokens de autenticação
   * Normalmente chamado automaticamente pelo interceptador
   * @returns {Promise<RefreshResponse>} Novos tokens
   */
  async refreshToken(): Promise<RefreshResponse> {
    const response = await api.post<RefreshResponse>('/auth/refresh');
    
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    
    return response.data;
  }
}

/** Instância singleton do serviço de autenticação */
export const authService = new AuthService();
export default authService;