/**
 * @fileoverview Serviço de gerenciamento de equipes e preferências
 * @description Este módulo contém as operações relacionadas às equipes
 * de Fórmula 1 e gerenciamento de preferências dos usuários (equipe e piloto favoritos).
 * 
 * @module teams.service
 * @requires @prisma/client
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Interface que representa uma equipe de F1
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
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Dados para atualização de preferências do usuário
 * @interface UpdateUserPreferencesData
 */
export interface UpdateUserPreferencesData {
  /** ID da equipe favorita (null para remover) */
  favoriteTeamId?: number | null;
  /** ID do piloto favorito (null para remover) */
  favoriteDriverId?: number | null;
}

/**
 * Serviço de gerenciamento de equipes e preferências
 * @class TeamsService
 */
export class TeamsService {
  /**
   * Cria uma instância do TeamsService
   * @param {PrismaClient} prisma - Cliente Prisma para operações de banco
   */
  constructor(private prisma: PrismaClient) {}

  // ==================== OPERAÇÕES DE EQUIPES ====================

  /**
   * Busca todas as equipes ativas
   * @returns {Promise<Team[]>} Lista de equipes ativas ordenadas por nome
   * @throws {Error} Se ocorrer erro na consulta
   */
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

  /**
   * Busca uma equipe específica por ID
   * @param {number} id - ID da equipe
   * @returns {Promise<Team | null>} Equipe encontrada ou null
   * @throws {Error} Se ocorrer erro na consulta
   */
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

  // ==================== OPERAÇÕES DE PREFERÊNCIAS ====================

  /**
   * Atualiza as preferências de equipe/piloto favorito do usuário
   * @param {string} userId - ID do usuário
   * @param {UpdateUserPreferencesData} preferencesData - Dados de preferência
   * @returns {Promise<void>}
   * @throws {Error} Se usuário/equipe/piloto não existir ou estiver inativo
   */
  async updateUserPreferences(userId: string, preferencesData: UpdateUserPreferencesData): Promise<void> {
    try {
      // Verifica se o usuário existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }

      // Valida equipe se fornecida
      if (preferencesData.favoriteTeamId !== null && preferencesData.favoriteTeamId !== undefined) {
        const team = await this.prisma.team.findUnique({
          where: { id: preferencesData.favoriteTeamId },
        });

        if (!team || !team.isActive) {
          throw new Error('Equipe não encontrada ou inativa');
        }
      }

      // Valida piloto se fornecido
      if (preferencesData.favoriteDriverId !== null && preferencesData.favoriteDriverId !== undefined) {
        const driver = await this.prisma.driver.findUnique({
          where: { id: preferencesData.favoriteDriverId },
        });

        if (!driver || !driver.isActive) {
          throw new Error('Piloto não encontrado ou inativo');
        }
      }

      // Atualiza preferências no banco
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

  /**
   * Busca as preferências atuais do usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Preferências com dados da equipe e piloto
   * @throws {Error} Se o usuário não for encontrado
   */
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

/** Instância singleton do serviço de equipes */
export const teamsService = new TeamsService(new PrismaClient());
export default teamsService;