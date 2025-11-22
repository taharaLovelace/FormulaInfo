import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authService, { User, LoginData, RegisterData } from '../services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Ações
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
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Erro ao fazer login',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

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
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Erro ao registrar usuário',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

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

      getCurrentUser: async () => {
        // 🛡️ Verifica se há access token
        if (!authService.isAuthenticated()) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        const currentState = get();
        if (currentState.isLoading) {
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
        } catch (error: any) {
          // 🛡️ Se der erro 401, limpa apenas access token (cookies são limpos pelo servidor)
          if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
          }
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.response?.data?.message || 'Erro ao obter dados do usuário',
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // 🛡️ Inicializar o estado da autenticação
      initialize: async () => {
        const state = get();
        
        // 🛡️ Se não há access token no localStorage, limpa o estado
        if (!authService.isAuthenticated()) {
          if (state.isAuthenticated || state.user) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
          return;
        }
        
        // 🛡️ Se há access token mas não há usuário no estado, busca o usuário
        if (authService.isAuthenticated() && !state.user) {
          await state.getCurrentUser();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Apenas persiste o estado básico, não as funções
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Callback após hidratação
      onRehydrateStorage: () => () => {},
    }
  )
);

export default useAuthStore;