/**
 * @fileoverview Serviço de gerenciamento de pilotos
 * @description Este módulo contém as operações relacionadas aos pilotos
 * de Fórmula 1, incluindo listagem com filtros opcionais.
 * 
 * @module drivers.service
 * @requires @prisma/client
 */

import { PrismaClient } from '@prisma/client';

/**
 * Parâmetros para listagem de pilotos
 * @interface ListDriversParams
 */
export type ListDriversParams = {
  /** Filtrar por status ativo/inativo */
  active?: boolean;
  /** Filtrar por nome da equipe (busca parcial, case-insensitive) */
  team?: string;
};

/**
 * Serviço de gerenciamento de pilotos
 * @class DriversService
 */
export class DriversService {
  /**
   * Cria uma instância do DriversService
   * @param {PrismaClient} prisma - Cliente Prisma para operações de banco
   */
  constructor(private prisma: PrismaClient) {}

  /**
   * Lista pilotos com filtros opcionais
   * 
   * @async
   * @param {ListDriversParams} params - Parâmetros de filtro
   * @param {boolean} [params.active] - Se definido, filtra por status ativo
   * @param {string} [params.team] - Se definido, filtra por nome da equipe
   * @returns {Promise<Driver[]>} Lista de pilotos ordenada por número
   * 
   * @example
   * // Listar todos os pilotos ativos
   * const drivers = await driversService.listDrivers({ active: true });
   * 
   * @example
   * // Listar pilotos da Ferrari
   * const ferrariDrivers = await driversService.listDrivers({ team: 'Ferrari' });
   */
  async listDrivers(params: ListDriversParams) {
    const { active, team } = params;
    
    return this.prisma.driver.findMany({
      where: {
        // Aplica filtro de status se fornecido
        ...(active !== undefined ? { isActive: active } : {}),
        // Aplica filtro de equipe se fornecido (busca parcial)
        ...(team ? { teamName: { contains: team, mode: 'insensitive' } } : {}),
      },
      orderBy: { driverNumber: 'asc' },
    });
  }
}

// Instância padrão para uso nas rotas
const prisma = new PrismaClient();
const driversService = new DriversService(prisma);

/** Função exportada para compatibilidade com as rotas existentes */
export const listDrivers = driversService.listDrivers.bind(driversService);
