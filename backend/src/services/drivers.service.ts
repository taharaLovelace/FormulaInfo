/**
 * @fileoverview Serviço de gerenciamento de pilotos
 * @description Este módulo contém as operações relacionadas aos pilotos
 * de Fórmula 1, incluindo listagem com filtros opcionais.
 * 
 * @module drivers.service
 * @requires @prisma/client
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
 * Lista pilotos com filtros opcionais
 * 
 * @async
 * @function listDrivers
 * @param {ListDriversParams} params - Parâmetros de filtro
 * @param {boolean} [params.active] - Se definido, filtra por status ativo
 * @param {string} [params.team] - Se definido, filtra por nome da equipe
 * @returns {Promise<Driver[]>} Lista de pilotos ordenada por número
 * 
 * @example
 * // Listar todos os pilotos ativos
 * const drivers = await listDrivers({ active: true });
 * 
 * @example
 * // Listar pilotos da Ferrari
 * const ferrariDrivers = await listDrivers({ team: 'Ferrari' });
 */
export async function listDrivers(params: ListDriversParams) {
  const { active, team } = params;
  
  return prisma.driver.findMany({
    where: {
      // Aplica filtro de status se fornecido
      ...(active !== undefined ? { isActive: active } : {}),
      // Aplica filtro de equipe se fornecido (busca parcial)
      ...(team ? { teamName: { contains: team, mode: 'insensitive' } } : {}),
    },
    orderBy: { driverNumber: 'asc' },
  });
}
