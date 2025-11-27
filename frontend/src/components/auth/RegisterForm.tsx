/**
 * @fileoverview Componente de formulário de registro
 * @description Formulário de criação de conta com validação completa
 * usando Zod e react-hook-form.
 * 
 * @module components/auth/RegisterForm
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
 * Schema de validação do formulário de registro
 * @description Valida todos os campos necessários para criação de conta
 * incluindo verificação de correspondência de senhas
 */
const registerSchema = z.object({
  /** Nome de usuário único (3-20 caracteres, alfanumérico + underscore) */
  username: z
    .string()
    .min(3, 'Usuário deve ter pelo menos 3 caracteres')
    .max(20, 'Usuário deve ter no máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Usuário deve conter apenas letras, números e underscore'),
  /** Email válido */
  email: z.string().email('Email inválido'),
  /** Senha (mínimo 8 caracteres) */
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  /** Confirmação de senha */
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  /** Nome completo (2-100 caracteres) */
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  /** Data de nascimento opcional */
  birthDate: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

/** Tipo inferido do schema de registro */
type RegisterFormData = z.infer<typeof registerSchema>;

// ==================== COMPONENTE ====================

/**
 * Formulário de registro de novo usuário
 * 
 * @description Renderiza um formulário completo de registro com:
 * - Campos para nome, username, email, data de nascimento
 * - Campos de senha e confirmação com toggle de visibilidade
 * - Validação em tempo real com mensagens de erro
 * - Estado de loading durante submissão
 * 
 * @returns {JSX.Element} Formulário de registro estilizado
 * 
 * @example
 * // Uso em uma página de registro
 * <RegisterForm />
 */
export default function RegisterForm() {
  // Estados para controlar visibilidade das senhas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  
  // Acessa o store de autenticação
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  // Configuração do react-hook-form com validação Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  /**
   * Handler de submissão do formulário
   * @param {RegisterFormData} data - Dados validados do formulário
   */
  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    try {
      // Prepara os dados para envio à API
      const registerData = {
        username: data.username,
        email: data.email,
        password: data.password,
        name: data.name,
        birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
      };

      await registerUser(registerData);
      toast.success('Conta criada com sucesso!');
      router.push('/');
    } catch {
      toast.error('Erro ao criar conta. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crie sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              href="/auth/login"
              className="font-medium text-red-600 hover:text-red-500"
            >
              faça login na sua conta existente
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome completo
              </label>
              <input
                {...register('name')}
                type="text"
                autoComplete="name"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Digite seu nome completo"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nome de usuário
              </label>
              <input
                {...register('username')}
                type="text"
                autoComplete="username"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Digite seu nome de usuário"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Digite seu email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                Data de nascimento (opcional)
              </label>
              <input
                {...register('birthDate')}
                type="date"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
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
                  autoComplete="new-password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar senha
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Confirme sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
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
                  Criando conta...
                </div>
              ) : (
                'Criar conta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}