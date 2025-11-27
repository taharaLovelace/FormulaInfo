/**
 * @fileoverview Componente seletor de equipe favorita
 * @description Grid de cards para seleção de equipe favorita do usuário.
 * Permite visualizar todas as equipes e selecionar uma como favorita.
 * 
 * @module components/teams/TeamSelector
 */

'use client';

import { useState, useEffect } from 'react';
import { teamsApiService, Team } from '../../services/teams.service';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../stores/auth.store';

// ==================== CONSTANTES ====================

/**
 * Equipes cujos logos possuem cores escuras
 * Estas NÃO recebem o filtro brightness-0 para manter visibilidade
 * @constant
 */
const darkLogoTeams = ['Ferrari', 'Kick Sauber'];

// ==================== COMPONENTE ====================

/**
 * Componente seletor de equipe favorita
 * 
 * @description Renderiza um grid de cards com todas as equipes:
 * - Carrega equipes e preferências do usuário
 * - Permite selecionar ou remover equipe favorita
 * - Exibe logo, nome, país e imagem do carro
 * - Feedback visual de seleção e loading
 * 
 * @returns {JSX.Element} Grid de cards de equipes selecionáveis
 * 
 * @example
 * // Na página de preferências
 * <TeamSelector />
 */
export default function TeamSelector() {
  /** Lista de equipes carregadas */
  const [teams, setTeams] = useState<Team[]>([]);
  /** ID da equipe atualmente selecionada */
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  /** Estado de carregamento inicial */
  const [loading, setLoading] = useState(true);
  /** Estado de atualização em andamento */
  const [updating, setUpdating] = useState(false);
  
  const { user } = useAuthStore();

  // Carrega dados iniciais
  useEffect(() => {
    loadTeams();
    loadUserPreferences();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Carrega lista de equipes da API
   * @async
   */
  const loadTeams = async () => {
    try {
      const teamsData = await teamsApiService.getAllTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      toast.error('Erro ao carregar equipes');
    }
  };

  /**
   * Carrega preferências do usuário logado
   * @async
   */
  const loadUserPreferences = async () => {
    try {
      if (user) {
        const preferences = await teamsApiService.getUserPreferences();
        setSelectedTeamId(preferences.favoriteTeamId);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handler de seleção de equipe
   * Atualiza a preferência no backend e estado local
   * @param {number | null} teamId - ID da equipe ou null para remover
   * @async
   */
  const handleTeamSelect = async (teamId: number | null) => {
    setUpdating(true);
    try {
      await teamsApiService.updateFavoriteTeam(teamId);
      setSelectedTeamId(teamId);
      
      const teamName = teamId ? teams.find(t => t.id === teamId)?.name : 'Nenhuma';
      toast.success(`Equipe favorita atualizada: ${teamName}`);
    } catch (error) {
      console.error('Erro ao atualizar equipe favorita:', error);
      toast.error('Erro ao atualizar equipe favorita');
    } finally {
      setUpdating(false);
    }
  };

  // Exibe loading durante carregamento inicial
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2 text-gray-600">Carregando equipes...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Escolha sua equipe favorita</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Opção para remover seleção */}
        <div
          className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
            selectedTeamId === null
              ? 'border-gray-400 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleTeamSelect(null)}
        >
          <div className="text-center">
            <div className="text-lg font-medium text-gray-500 mb-2">Nenhuma equipe</div>
            <p className="text-sm text-gray-400">Não tenho equipe favorita</p>
          </div>
          {selectedTeamId === null && (
            <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Equipes disponíveis */}
        {teams.map((team) => (
          <div
            key={team.id}
            className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
              selectedTeamId === team.id
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => handleTeamSelect(team.id)}
            style={{
              borderColor: selectedTeamId === team.id ? team.teamColor || '#ef4444' : undefined
            }}
          >
            <div className="text-center">
              {/* Logo da equipe */}
              {team.logoUrl && (
                <div className="mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={team.logoUrl}
                    alt={`${team.name} logo`}
                    className={`h-12 w-auto mx-auto object-contain ${
                      darkLogoTeams.includes(team.name) ? '' : 'brightness-0'
                    }`}
                  />
                </div>
              )}
              
              {/* Nome da equipe */}
              <div className="text-lg font-medium text-gray-900 mb-1">
                {team.name}
              </div>
              
              {/* Nome completo */}
              {team.fullName && (
                <p className="text-sm text-gray-600 mb-2">{team.fullName}</p>
              )}
              
              {/* País */}
              {team.country && (
                <p className="text-xs text-gray-500">{team.country}</p>
              )}
              
              {/* Imagem do carro (pequena) */}
              {team.carImageUrl && (
                <div className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={team.carImageUrl}
                    alt={`${team.name} car`}
                    className="h-8 w-auto mx-auto object-contain opacity-75"
                  />
                </div>
              )}
            </div>
            
            {/* Indicador de seleção */}
            {selectedTeamId === team.id && (
              <div 
                className="absolute -top-2 -right-2 text-white rounded-full p-1"
                style={{ backgroundColor: team.teamColor || '#ef4444' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
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