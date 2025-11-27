/**
 * @fileoverview Página de Perfil do Usuário
 * @description Página que exibe as informações completas do perfil do usuário autenticado,
 * incluindo dados pessoais, status da conta e preferências de F1.
 * Apenas acessível para usuários autenticados através do ProtectedRoute.
 */

'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import useAuthStore from '../../stores/auth.store';
import { User } from '../../services/auth.service';
import Link from 'next/link';

/**
 * Página de perfil do usuário autenticado.
 * 
 * @description Exibe informações detalhadas do perfil incluindo:
 * - Dados pessoais (nome, username, email, data de nascimento)
 * - Status da conta (ativa/inativa, email verificado)
 * - Data de criação da conta
 * - Preferências de F1 (equipe e piloto favoritos)
 * 
 * Gerencia estados de loading e error com feedback visual apropriado.
 * 
 * @returns {JSX.Element} Página de perfil com informações do usuário
 */
export default function ProfilePage() {
  // Obtém função de carregamento do perfil do store de autenticação
  const { getProfile } = useAuthStore();
  
  // Estado local para armazenar dados do perfil
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega o perfil ao montar o componente
  useEffect(() => {
    loadProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Carrega os dados do perfil do usuário da API.
   * 
   * @description Busca informações completas do perfil incluindo
   * preferências de F1 (equipe e piloto favoritos).
   * Atualiza estados de loading e error conforme resultado.
   */
  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await getProfile();
      setProfile(userProfile);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  // Renderiza estado de loading com spinner
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-2 text-gray-600">Carregando perfil...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Renderiza estado de erro com opção de retry
  if (error) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={loadProfile}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-red-600 text-white">
            <h1 className="text-2xl font-bold">Meu Perfil</h1>
            <p className="mt-1 text-red-100">Gerencie suas informações pessoais</p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nome</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile?.name}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Nome de usuário</dt>
                <dd className="mt-1 text-sm text-gray-900">@{profile?.username}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile?.email}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Status da conta</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    profile?.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile?.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Email verificado</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    profile?.emailVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profile?.emailVerified ? 'Verificado' : 'Pendente'}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Data de nascimento</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {profile?.birthDate 
                    ? new Date(profile.birthDate).toLocaleDateString('pt-BR') 
                    : 'Não informado'
                  }
                </dd>
              </div>
              
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Membro desde</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {profile?.createdAt 
                    ? new Date(profile.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'Data não disponível'
                  }
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Seção de equipe e piloto favoritos */}
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Preferências de F1</h2>
              <p className="mt-1 text-sm text-gray-600">Suas equipes e pilotos favoritos</p>
            </div>
            <Link
              type="button"
              href="/preferences"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Editar Preferências de F1
            </Link>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Equipe favorita</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {profile?.favoriteTeam?.name || 'Nenhuma selecionada'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Piloto favorito</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {profile?.favoriteDriver?.fullName || 'Nenhum selecionado'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}