'use client';

import ProtectedRoute from '../../components/auth/ProtectedRoute';
import TeamSelector from '../../components/teams/TeamSelector';
import DriverSelector from '../../components/drivers/DriverSelector';

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

          {/* Seção para pilotos favoritos */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Piloto Favorito</h2>
              <p className="mt-1 text-sm text-gray-600">
                Escolha seu piloto favorito da temporada 2025 da Fórmula 1.
              </p>
            </div>
            
            <div className="p-6">
              <DriverSelector />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}