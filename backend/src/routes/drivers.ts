/**
 * @fileoverview Rotas de pilotos
 * @description Endpoints para listagem e consulta de pilotos de F1.
 * 
 * @module routes/drivers
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { listDrivers } from '../services/drivers.service';

// ==================== SCHEMAS DE VALIDAÇÃO ====================

/**
 * Schema de validação para query string
 * @description Permite filtrar pilotos por status ativo e equipe
 */
const querySchema = z.object({
  /** Filtrar por pilotos ativos (true) ou inativos (false) */
  active: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((v) => (typeof v === 'string' ? v === 'true' : v)),
  /** Filtrar por nome da equipe */
  team: z.string().optional(),
});

/**
 * Schema de resposta do piloto
 * @description Define a estrutura de dados de um piloto
 */
const driverSchema = z.object({
  id: z.number(),
  driverNumber: z.number(),
  fullName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  /** Código ISO 2 da nacionalidade */
  nationality: z.string(),
  teamName: z.string(),
  birthDate: z.date().or(z.string()),
  bio: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean(),
});

/**
 * Schema de resposta da listagem
 * @description Envelope de resposta com array de pilotos
 */
const responseSchema = z.object({
  success: z.literal(true),
  data: z.array(driverSchema),
});

// ==================== ROTAS ====================

/**
 * Plugin de rotas de pilotos
 * @param {FastifyPluginAsync} app - Instância do Fastify
 * 
 * @description Endpoints disponíveis:
 * - GET / - Listar todos os pilotos com filtros opcionais
 * 
 * @example
 * // Todos os pilotos
 * GET /drivers
 * 
 * // Apenas pilotos ativos
 * GET /drivers?active=true
 * 
 * // Pilotos de uma equipe específica
 * GET /drivers?team=Ferrari
 */
const driversRoutes: FastifyPluginAsync = async (app) => {
  /**
   * GET / - Listar pilotos
   * @description Retorna lista de pilotos com filtros opcionais
   */
  app.get('/', {
    schema: {
      tags: ['Drivers'],
      description: 'Lista todos os pilotos',
      querystring: querySchema,
      response: {
        200: responseSchema,
      },
    },
  }, async (request, reply) => {
    const { active, team } = querySchema.parse(request.query);
    const drivers = await listDrivers({ active, team });
    return reply.send({ success: true, data: drivers });
  });
};

export default driversRoutes;