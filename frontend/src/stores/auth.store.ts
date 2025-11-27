/**
 * @fileoverview Store de autenticação do frontend
 * @description Gerenciamento global do estado de autenticação usando Zustand.
 * Inclui persistência em localStorage e sincronização com API.
 * 
 * @module stores/auth.store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authService, { BasicUser, User, LoginData, RegisterData } from '../services/auth.service';

// ==================== INTERFACES ====================

/**
 * Estado de autenticação
 * @interface AuthState
 */
interface AuthState {
  /** Dados básicos do usuário logado */
  user: BasicUser | null;
  /** Indica se o usuário está autenticado */
  isAuthenticated: boolean;
  /** Indica se uma operação está em andamento */
  isLoading: boolean;
  /** Mensagem de erro, se houver */
  error: string | null;
  /** Indica se o store foi inicializado */
  hasInitialized: boolean;
}

/**
 * Ações disponíveis no store
 * @interface AuthActions
 */
interface AuthActions {
  /** Realiza login do usuário */
  login: (data: LoginData) => Promise<void>;
  /** Registra um novo usuário */
  register: (data: RegisterData) => Promise<void>;
  /** Realiza logout do usuário */
  logout: () => Promise<void>;
  /** Busca dados do usuário atual */
  getCurrentUser: () => Promise<void>;
  /** Busca perfil completo com preferências */
  getProfile: () => Promise<User>;
  /** Limpa mensagem de erro */
  clearError: () => void;
  /** Define estado de loading */
  setLoading: (loading: boolean) => void;
  /** Inicializa o store de autenticação */
  initialize: () => Promise<void>;
}

/** Tipo combinado do store */
type AuthStore = AuthState & AuthActions;

// ==================== STORE ====================

/**
 * Store de autenticação com Zustand
 * 
 * @description Gerencia o estado global de autenticação:
 * - Persistência automática em localStorage
 * - Sincronização com API de autenticação
 * - Tratamento de erros e loading states
 * - Inicialização automática ao carregar a aplicação
 * 
 * @example
 * // Uso em componente
 * const { user, isAuthenticated, login, logout } = useAuthStore();
 * 
 * // Login
 * await login({ identifier: 'email@exemplo.com', password: 'senha123' });
 * 
 * // Verificar autenticação
 * if (isAuthenticated) {
 *   console.log('Usuário logado:', user?.name);
 * }
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ========== ESTADO INICIAL ==========
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      hasInitialized: false,

      // ========== AÇÕES ==========

      /**
       * Realiza login do usuário
       * @param {LoginData} data - Credenciais de login
       */
      login: async (data: LoginData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(data);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          set({
            error: axiosError.response?.data?.message || 'Erro ao fazer login',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      /**
       * Registra um novo usuário
       * @param {RegisterData} data - Dados de registro
       */
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          set({
            error: axiosError.response?.data?.message || 'Erro ao registrar usuário',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      /**
       * Realiza logout do usuário
       * Limpa tokens e estado de autenticação
       */
      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.error('Erro ao fazer logout:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      /**
       * Busca dados do usuário atual
       * Verifica access token e atualiza estado
       */
      getCurrentUser: async () => {
        // Verifica se há access token
        if (!authService.isAuthenticated()) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
          // Se der erro 401, limpa access token
          if (axiosError.response?.status === 401) {
            localStorage.removeItem('accessToken');
          }
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: axiosError.response?.data?.message || 'Erro ao obter dados do usuário',
          });
        }
      },

      /**
       * Busca perfil completo do usuário (com preferências)
       * @returns {Promise<User>} Dados completos do usuário
       * @throws {Error} Se não autenticado
       */
      getProfile: async () => {
        if (!authService.isAuthenticated()) {
          throw new Error('Usuário não autenticado');
        }

        const profile = await authService.getProfile();
        return profile;
      },

      /**
       * Limpa mensagem de erro do estado
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Define estado de loading manualmente
       * @param {boolean} loading - Novo estado de loading
       */
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      /**
       * Inicializa o estado de autenticação
       * Verifica tokens existentes e recupera dados do usuário
       */
      initialize: async () => {
        const state = get();

        // Evita inicialização duplicada
        if (state.hasInitialized) {
          if (state.isLoading) {
            set({ isLoading: false });
          }
          return;
        }

        // Evita executar no lado do servidor (SSR)
        if (typeof window === 'undefined') {
          return;
        }

        set({ isLoading: true });

        // Se não há access token, limpa o estado
        if (!authService.isAuthenticated()) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            hasInitialized: true,
          });
          return;
        }
        
        // Se há access token mas não há usuário, busca dados
        if (authService.isAuthenticated() && !state.user) {
          try {
            await state.getCurrentUser();
            set({ hasInitialized: true, isLoading: false });
          } catch {
            set({ hasInitialized: true });
          }
        } else {
          set({ isLoading: false, hasInitialized: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Persiste apenas estado essencial (não funções)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Callback após hidratação do storage
      onRehydrateStorage: () => () => {},
    }
  )
);

export default useAuthStore;