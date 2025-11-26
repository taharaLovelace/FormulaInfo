import api from './api';

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

export interface UpdatePreferencesData {
  favoriteTeamId?: number | null;
  favoriteDriverId?: number | null;
}

class TeamsApiService {
  // Buscar todas as equipes
  async getAllTeams(): Promise<Team[]> {
    const response = await api.get<{
      success: boolean;
      data: Team[];
      message: string;
    }>('/teams');
    
    return response.data.data;
  }

  // Buscar equipe por ID
  async getTeamById(id: number): Promise<Team> {
    const response = await api.get<{
      success: boolean;
      data: Team;
      message: string;
    }>(`/teams/${id}`);
    
    return response.data.data;
  }

  // Buscar preferências do usuário atual
  async getUserPreferences(): Promise<UserPreferences> {
    const response = await api.get<{
      success: boolean;
      data: UserPreferences;
      message: string;
    }>('/teams/preferences/me');
    
    return response.data.data;
  }

  // Atualizar preferências do usuário
  async updateUserPreferences(preferences: UpdatePreferencesData): Promise<void> {
    await api.put('/teams/preferences/me', preferences);
  }

  // Atualizar apenas equipe favorita
  async updateFavoriteTeam(teamId: number | null): Promise<void> {
    await this.updateUserPreferences({ favoriteTeamId: teamId });
  }

  // Atualizar apenas piloto favorito
  async updateFavoriteDriver(driverId: number | null): Promise<void> {
    await this.updateUserPreferences({ favoriteDriverId: driverId });
  }
}

export const teamsApiService = new TeamsApiService();
export default teamsApiService;