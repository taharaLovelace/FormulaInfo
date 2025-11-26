'use client';

import ProtectedRoute from '../../components/auth/ProtectedRoute';
import TeamSelector from '../../components/teams/TeamSelector';

export default function PreferencesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Minhas Preferências</h1>
            <p className="mt-2 text-gray-600">
              Configure suas preferências de equipes e pilotos favoritos da Fórmula 1.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Equipe Favorita</h2>
              <p className="mt-1 text-sm text-gray-600">
                Escolha sua equipe favorita da temporada 2025 da Fórmula 1.
              </p>
            </div>
            
            <div className="p-6">
              <TeamSelector />
            </div>
          </div>

          {/* Seção para pilotos favoritos - para implementar futuramente */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Piloto Favorito</h2>
              <p className="mt-1 text-sm text-gray-600">
                Em breve: escolha seu piloto favorito da Fórmula 1.
              </p>
            </div>
            
            <div className="p-6">
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Em desenvolvimento</h3>
                <p className="text-gray-500">
                  A seleção de pilotos favoritos será implementada em breve.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}