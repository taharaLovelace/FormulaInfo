import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

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
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserPreferencesData {
  favoriteTeamId?: number | null;
  favoriteDriverId?: number | null;
}

export class TeamsService {
  constructor(private prisma: PrismaClient) {}

  // Buscar todas as equipes ativas
  async getAllTeams(): Promise<Team[]> {
    try {
      const teams = await this.prisma.team.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });

      logger.info(`Retornadas ${teams.length} equipes ativas`);
      return teams;
    } catch (error) {
      logger.error('Erro ao buscar equipes');
      throw new Error('Erro interno do servidor ao buscar equipes');
    }
  }

  // Buscar equipe por ID
  async getTeamById(id: number): Promise<Team | null> {
    try {
      const team = await this.prisma.team.findUnique({
        where: { id },
      });

      if (!team) {
        return null;
      }

      logger.info(`Equipe encontrada: ${team.name}`);
      return team;
    } catch (error) {
      logger.error(`Erro ao buscar equipe com ID ${id}`);
      throw new Error('Erro interno do servidor ao buscar equipe');
    }
  }

  // Atualizar preferências do usuário
  async updateUserPreferences(userId: string, preferencesData: UpdateUserPreferencesData): Promise<void> {
    try {
      // Verificar se o usuário existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se a equipe existe (se fornecida)
      if (preferencesData.favoriteTeamId !== null && preferencesData.favoriteTeamId !== undefined) {
        const team = await this.prisma.team.findUnique({
          where: { id: preferencesData.favoriteTeamId },
        });

        if (!team || !team.isActive) {
          throw new Error('Equipe não encontrada ou inativa');
        }
      }

      // Verificar se o piloto existe (se fornecido)
      if (preferencesData.favoriteDriverId !== null && preferencesData.favoriteDriverId !== undefined) {
        const driver = await this.prisma.driver.findUnique({
          where: { id: preferencesData.favoriteDriverId },
        });

        if (!driver || !driver.isActive) {
          throw new Error('Piloto não encontrado ou inativo');
        }
      }

      // Atualizar preferências do usuário
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          favoriteTeamId: preferencesData.favoriteTeamId,
          favoriteDriverId: preferencesData.favoriteDriverId,
        },
      });

      logger.info(`Preferências atualizadas para usuário ${userId}`);
    } catch (error) {
      logger.error(`Erro ao atualizar preferências do usuário ${userId}`);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Erro interno do servidor ao atualizar preferências');
    }
  }

  // Buscar preferências atuais do usuário
  async getUserPreferences(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          favoriteTeam: {
            select: {
              id: true,
              name: true,
              fullName: true,
              logoUrl: true,
              carImageUrl: true,
              teamColor: true,
              country: true,
            }
          },
          favoriteDriver: {
            select: {
              id: true,
              fullName: true,
              driverNumber: true,
              imageUrl: true,
            }
          }
        }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return {
        favoriteTeam: user.favoriteTeam,
        favoriteDriver: user.favoriteDriver,
        favoriteTeamId: user.favoriteTeamId,
        favoriteDriverId: user.favoriteDriverId,
      };
    } catch (error) {
      logger.error(`Erro ao buscar preferências do usuário ${userId}`);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Erro interno do servidor ao buscar preferências');
    }
  }
}

export const teamsService = new TeamsService(new PrismaClient());
export default teamsService;