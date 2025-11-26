/**
 * @fileoverview Componente de formulário de login
 * @description Formulário de autenticação com validação Zod e react-hook-form.
 * Permite login via email ou username.
 * 
 * @module components/auth/LoginForm
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../stores/auth.store';

// ==================== VALIDAÇÃO ====================

/**
 * Schema de validação do formulário de login
 * @description Valida campos de identificação (email ou username) e senha
 */
const loginSchema = z.object({
  /** Email ou nome de usuário */
  identifier: z.string().min(1, 'Email ou usuário é obrigatório'),
  /** Senha do usuário */
  password: z.string().min(1, 'Senha é obrigatória'),
});

/** Tipo inferido do schema de login */
type LoginFormData = z.infer<typeof loginSchema>;

// ==================== COMPONENTE ====================

/**
 * Formulário de login do usuário
 * 
 * @description Renderiza um formulário de login com:
 * - Campo de identificação (email ou username)
 * - Campo de senha com toggle de visibilidade
 * - Validação em tempo real
 * - Feedback visual de erros
 * - Estado de loading durante submissão
 * 
 * @returns {JSX.Element} Formulário de login estilizado
 * 
 * @example
 * // Uso em uma página de login
 * <LoginForm />
 */
export default function LoginForm() {
  // Estado para controlar visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  // Acessa o store de autenticação
  const { login, isLoading, error, clearError } = useAuthStore();

  // Configuração do react-hook-form com validação Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  /**
   * Handler de submissão do formulário
   * @param {LoginFormData} data - Dados validados do formulário
   */
  const onSubmit = async (data: LoginFormData) => {
    clearError();
    try {
      await login(data);
      toast.success('Login realizado com sucesso!');
      router.push('/');
    } catch {
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Faça login na sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              href="/auth/register"
              className="font-medium text-red-600 hover:text-red-500"
            >
              crie uma nova conta
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Email ou usuário
              </label>
              <input
                {...register('identifier')}
                type="text"
                autoComplete="username"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Digite seu email ou usuário"
              />
              {errors.identifier && (
                <p className="mt-1 text-sm text-red-600">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-red-600 hover:text-red-500"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}