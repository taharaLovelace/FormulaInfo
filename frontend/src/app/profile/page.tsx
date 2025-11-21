'use client';

import ProtectedRoute from '../../components/auth/ProtectedRoute';
import useAuthStore from '../../stores/auth.store';

export default function ProfilePage() {
  const { user } = useAuthStore();

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
                <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Nome de usuário</dt>
                <dd className="mt-1 text-sm text-gray-900">@{user?.username}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Status da conta</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user?.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user?.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Email verificado</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user?.emailVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user?.emailVerified ? 'Verificado' : 'Pendente'}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Data de nascimento</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.birthDate 
                    ? new Date(user.birthDate).toLocaleDateString('pt-BR') 
                    : 'Não informado'
                  }
                </dd>
              </div>
              
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Membro desde</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('pt-BR', {
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
          
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Editar Perfil
            </button>
          </div>
        </div>
        
        {/* Seção de equipe e piloto favoritos */}
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Preferências de F1</h2>
            <p className="mt-1 text-sm text-gray-600">Suas equipes e pilotos favoritos</p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Equipe favorita</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.favoriteTeam?.name || 'Nenhuma selecionada'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Piloto favorito</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.favoriteDriver?.fullName || 'Nenhum selecionado'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}