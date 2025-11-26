/**
 * @fileoverview Serviço de equipes e preferências do frontend
 * @description Este módulo encapsula as operações relacionadas às equipes
 * de F1 e gerenciamento de preferências do usuário (equipe/piloto favoritos).
 * 
 * @module teams.service
 * @requires ./api
 */

import api from './api';

// ==================== INTERFACES ====================

/**
 * Representa uma equipe de Fórmula 1
 * @interface Team
 */
export interface Team {
  id: number;
  name: string;
  fullName: string | null;
  country: string | null;
  logoUrl: string | null;
  carImageUrl: string | null;
  teamColor: string | null;
  description: string | null;
  headquarters: string | null;
  founded: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Preferências do usuário com dados expandidos
 * @interface UserPreferences
 */
export interface UserPreferences {
  favoriteTeam: Team | null;
  favoriteDriver: {
    id: number;
    fullName: string;
    driverNumber: number | null;
    imageUrl: string | null;
  } | null;
  favoriteTeamId: number | null;
  favoriteDriverId: number | null;
}

/**
 * Dados para atualização de preferências
 * @interface UpdatePreferencesData
 */
export interface UpdatePreferencesData {
  favoriteTeamId?: number | null;
  favoriteDriverId?: number | null;
}

/**
 * Serviço de gerenciamento de equipes e preferências
 * @class TeamsApiService
 */
class TeamsApiService {
  /**
   * Busca todas as equipes ativas
   * @returns {Promise<Team[]>} Lista de equipes
   */
  async getAllTeams(): Promise<Team[]> {
    const response = await api.get<{
      success: boolean;
      data: Team[];
      message: string;
    }>('/teams');
    
    return response.data.data;
  }

  /**
   * Busca uma equipe específica por ID
   * @param {number} id - ID da equipe
   * @returns {Promise<Team>} Dados da equipe
   */
  async getTeamById(id: number): Promise<Team> {
    const response = await api.get<{
      success: boolean;
      data: Team;
      message: string;
    }>(`/teams/${id}`);
    
    return response.data.data;
  }

  /**
   * Busca as preferências do usuário atual
   * @returns {Promise<UserPreferences>} Preferências com dados expandidos
   */
  async getUserPreferences(): Promise<UserPreferences> {
    const response = await api.get<{
      success: boolean;
      data: UserPreferences;
      message: string;
    }>('/teams/preferences/me');
    
    return response.data.data;
  }

  /**
   * Atualiza as preferências do usuário
   * @param {UpdatePreferencesData} preferences - Novas preferências
   * @returns {Promise<void>}
   */
  async updateUserPreferences(preferences: UpdatePreferencesData): Promise<void> {
    await api.put('/teams/preferences/me', preferences);
  }

  /**
   * Atalho para atualizar apenas a equipe favorita
   * @param {number | null} teamId - ID da equipe ou null para remover
   * @returns {Promise<void>}
   */
  async updateFavoriteTeam(teamId: number | null): Promise<void> {
    await this.updateUserPreferences({ favoriteTeamId: teamId });
  }

  /**
   * Atalho para atualizar apenas o piloto favorito
   * @param {number | null} driverId - ID do piloto ou null para remover
   * @returns {Promise<void>}
   */
  async updateFavoriteDriver(driverId: number | null): Promise<void> {
    await this.updateUserPreferences({ favoriteDriverId: driverId });
  }
}

/** Instância singleton do serviço de equipes */
export const teamsApiService = new TeamsApiService();
export default teamsApiService;