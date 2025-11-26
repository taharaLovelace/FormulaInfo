'use client';

import { useState, useEffect } from 'react';
import { driversApiService, Driver } from '../../services/drivers.service';
import { teamsApiService } from '../../services/teams.service';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../stores/auth.store';

function flagFromIso2(code: string) {
  if (!code || code.length !== 2) return '🏳️';
  const base = 0x1f1e6;
  return code.toUpperCase().split('').map(c => String.fromCodePoint(base + c.charCodeAt(0) - 65)).join('');
}

const ISO2_PT_DEMONYM: Record<string, string> = {
  NL: 'Holandês',
  NZ: 'Neozelandês',
  MC: 'Monegasco',
  GB: 'Britânico',
  UK: 'Britânico',
  IT: 'Italiano',
  ES: 'Espanhol',
  CA: 'Canadense',
  AU: 'Australiano',
  JP: 'Japonês',
  FR: 'Francês',
  DE: 'Alemão',
  BR: 'Brasileiro',
  AR: 'Argentino',
  TH: 'Tailandês',
  FI: 'Finlandês',
  MX: 'Mexicano',
  DK: 'Dinamarquês',
  CN: 'Chinês',
  US: 'Americano',
};

function iso2ToPtDemonym(code: string) {
  return ISO2_PT_DEMONYM[code.toUpperCase()] || code.toUpperCase();
}

export default function DriverSelector() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const { user } = useAuthStore();

  useEffect(() => {
    loadDrivers();
    loadUserPreferences();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDrivers = async () => {
    try {
      const driversData = await driversApiService.getActiveDrivers();
      setDrivers(driversData);
    } catch (error) {
      console.error('Erro ao carregar pilotos:', error);
      toast.error('Erro ao carregar pilotos');
    }
  };

  const loadUserPreferences = async () => {
    try {
      if (user) {
        const preferences = await teamsApiService.getUserPreferences();
        setSelectedDriverId(preferences.favoriteDriverId);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDriverSelect = async (driverId: number | null) => {
    setUpdating(true);
    try {
      await teamsApiService.updateFavoriteDriver(driverId);
      setSelectedDriverId(driverId);
      
      const driverName = driverId ? drivers.find(d => d.id === driverId)?.fullName : 'Nenhum';
      toast.success(`Piloto favorito atualizado: ${driverName}`);
    } catch (error) {
      console.error('Erro ao atualizar piloto favorito:', error);
      toast.error('Erro ao atualizar piloto favorito');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gray-200" />
              <div className="flex flex-col items-center space-y-2">
                <div className="h-4 w-16 rounded bg-gray-200" />
                <div className="h-5 w-32 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-200" />
                <div className="h-3 w-20 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Escolha seu piloto favorito</h3>
          <p className="text-gray-600 text-sm">Clique em um piloto para selecioná-lo</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm">
            Temporada 2025
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {/* Opção para remover seleção */}
        <div
          className={`group flex flex-col rounded-xl border-2 bg-white p-5 shadow-sm transition cursor-pointer ${
            selectedDriverId === null
              ? 'border-gray-400 bg-gray-50 ring-2 ring-gray-400'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }`}
          onClick={() => handleDriverSelect(null)}
        >
          <div className="relative mx-auto mb-4 h-20 w-20">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-4xl ring-2 ring-gray-300">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            {selectedDriverId === null && (
              <div className="absolute -top-1 -right-1 bg-gray-500 text-white rounded-full p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">---</p>
            <h3 className="text-lg font-bold text-gray-500 leading-tight">Nenhum piloto</h3>
            <p className="text-sm text-gray-400">Não tenho favorito</p>
          </div>
        </div>

        {/* Pilotos disponíveis */}
        {drivers.map(driver => {
          const flag = flagFromIso2(driver.nationality);
          const demonym = iso2ToPtDemonym(driver.nationality);
          const isSelected = selectedDriverId === driver.id;
          
          return (
            <div
              key={driver.id}
              className={`group flex flex-col rounded-xl border-2 bg-white p-5 shadow-sm transition cursor-pointer ${
                isSelected
                  ? 'border-red-500 bg-red-50 ring-2 ring-red-500'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => handleDriverSelect(driver.id)}
            >
              <div className="relative mx-auto mb-4 h-20 w-20">
                <div className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-4xl ring-2 ${
                  isSelected ? 'ring-red-500' : 'ring-gray-200 group-hover:ring-red-300'
                }`}>
                  <span aria-label={demonym}>{flag}</span>
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-center space-y-1">
                <p className={`text-xs font-semibold uppercase tracking-wide ${
                  isSelected ? 'text-red-600' : 'text-red-600'
                }`}>#{driver.driverNumber}</p>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{driver.fullName}</h3>
                <p className="text-sm text-gray-600">{driver.teamName}</p>
                <p className="text-[11px] text-gray-400">{demonym}</p>
              </div>
              {driver.bio && (
                <p 
                  className="mt-3 flex-1 text-xs text-gray-500 overflow-hidden text-center" 
                  style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'}}
                >
                  {driver.bio}
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      {updating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-700">Atualizando preferência...</span>
          </div>
        </div>
      )}
    </div>
  );
}
