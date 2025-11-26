/**
 * @fileoverview Rotas de equipes e preferências
 * @description Endpoints para listagem de equipes e gerenciamento
 * de preferências do usuário (equipe e piloto favoritos).
 * 
 * @module routes/teams
 */

import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import teamsService from '../services/teams.service';
import * as jwt from 'jsonwebtoken';

// ==================== CONFIGURAÇÃO ====================

const prisma = new PrismaClient();

// ==================== SCHEMAS DE VALIDAÇÃO ====================

/**
 * Schema para atualização de preferências
 * @description Requer pelo menos um dos campos
 */
const updatePreferencesSchema = z.object({
  /** ID da equipe favorita (null para remover) */
  favoriteTeamId: z.number().int().positive().nullable().optional(),
  /** ID do piloto favorito (null para remover) */
  favoriteDriverId: z.number().int().positive().nullable().optional(),
}).refine(data => {
  return data.favoriteTeamId !== undefined || data.favoriteDriverId !== undefined;
}, {
  message: "Pelo menos um campo (favoriteTeamId ou favoriteDriverId) deve ser fornecido"
});

/**
 * Schema para parâmetro de ID da equipe
 */
const teamIdSchema = z.object({
  id: z.string().transform(val => parseInt(val))
});

// ==================== FUNÇÕES AUXILIARES ====================

/**
 * Verifica autenticação do usuário via token JWT
 * @param {string | undefined} authHeader - Header Authorization
 * @returns {Promise<{userId: string, username: string, email: string}>} Dados do usuário
 * @throws {Error} Se token não fornecido ou inválido
 */
const verifyAuth = async (authHeader: string | undefined): Promise<{ userId: string; username: string; email: string }> => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de acesso não fornecido');
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new Error('Token de acesso inválido');
  }
  
  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const payload = jwt.verify(token, jwtSecret) as { userId: string; username: string; email: string };
    return {
      userId: payload.userId,
      username: payload.username,
      email: payload.email
    };
  } catch {
    throw new Error('Token de acesso inválido ou expirado');
  }
};

// ==================== ROTAS ====================

/**
 * Registra as rotas de equipes e preferências
 * @param {FastifyInstance} fastify - Instância do Fastify
 * 
 * @description Endpoints disponíveis:
 * - GET /teams - Listar todas as equipes
 * - GET /teams/:id - Buscar equipe por ID
 * - GET /teams/preferences/me - Obter preferências do usuário
 * - PUT /teams/preferences/me - Atualizar preferências do usuário
 */
export default async function teamsRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * GET /teams - Buscar todas as equipes
   * @description Retorna lista de todas as equipes cadastradas
   */
  server.get('/teams', {
    schema: {
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(z.object({
            id: z.number(),
            name: z.string(),
            fullName: z.string().nullable(),
            country: z.string().nullable(),
            logoUrl: z.string().nullable(),
            carImageUrl: z.string().nullable(),
            teamColor: z.string().nullable(),
            description: z.string().nullable(),
            headquarters: z.string().nullable(),
            founded: z.number().nullable(),
            isActive: z.boolean(),
            createdAt: z.date(),
            updatedAt: z.date(),
          })),
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const teams = await teamsService.getAllTeams();
      
      return reply.code(200).send({
        success: true,
        data: teams,
        message: 'Equipes recuperadas com sucesso'
      });
    } catch {
      fastify.log.error('Erro ao buscar equipes');
      
      return reply.code(500).send({
        success: false,
        data: [],
        message: 'Erro interno do servidor ao buscar equipes'
      });
    }
  });

  /**
   * GET /teams/:id - Buscar equipe por ID
   * @description Retorna dados de uma equipe específica
   */
  server.get('/teams/:id', {
    schema: {
      params: teamIdSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            id: z.number(),
            name: z.string(),
            fullName: z.string().nullable(),
            country: z.string().nullable(),
            logoUrl: z.string().nullable(),
            carImageUrl: z.string().nullable(),
            teamColor: z.string().nullable(),
            description: z.string().nullable(),
            headquarters: z.string().nullable(),
            founded: z.number().nullable(),
            isActive: z.boolean(),
            createdAt: z.date(),
            updatedAt: z.date(),
          }),
          message: z.string()
        }),
        404: z.object({
          success: z.boolean(),
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      const team = await teamsService.getTeamById(id);
      
      if (!team) {
        return reply.code(404).send({
          success: false,
          message: 'Equipe não encontrada'
        });
      }
      
      return reply.code(200).send({
        success: true,
        data: team,
        message: 'Equipe encontrada com sucesso'
      });
    } catch {
      fastify.log.error('Erro ao buscar equipe');
      
      return reply.code(500).send({
        success: false,
        message: 'Erro interno do servidor ao buscar equipe'
      });
    }
  });

  /**
   * GET /teams/preferences/me - Buscar preferências do usuário
   * @description Retorna equipe e piloto favoritos do usuário autenticado
   * @requires Autenticação via Bearer token
   */
  server.get('/teams/preferences/me', async (request, reply) => {
    try {
      const user = await verifyAuth(request.headers.authorization);
      
      const preferences = await teamsService.getUserPreferences(user.userId);
      
      return reply.code(200).send({
        success: true,
        data: preferences,
        message: 'Preferências recuperadas com sucesso'
      });
    } catch (error) {
      // Tratamento de erros de autenticação
      if (error instanceof Error) {
        if (error.message.includes('Token') || error.message.includes('acesso')) {
          return reply.code(401).send({
            success: false,
            message: error.message
          });
        }
        
        if (error.message === 'Usuário não encontrado') {
          return reply.code(404).send({
            success: false,
            message: 'Usuário não encontrado'
          });
        }
      }
      
      fastify.log.error('Erro ao buscar preferências');
      return reply.code(500).send({
        success: false,
        message: 'Erro interno do servidor ao buscar preferências'
      });
    }
  });

  /**
   * PUT /teams/preferences/me - Atualizar preferências do usuário
   * @description Atualiza equipe e/ou piloto favorito do usuário
   * @requires Autenticação via Bearer token
   */
  server.put('/teams/preferences/me', {
    schema: {
      body: updatePreferencesSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const user = await verifyAuth(request.headers.authorization);
      
      await teamsService.updateUserPreferences(user.userId, request.body);
      
      return reply.code(200).send({
        success: true,
        message: 'Preferências atualizadas com sucesso'
      });
    } catch (error) {
      // Tratamento de erros específicos
      if (error instanceof Error) {
        // Erro de autenticação
        if (error.message.includes('Token') || error.message.includes('acesso')) {
          return reply.code(401).send({
            success: false,
            message: error.message
          });
        }
        
        // Usuário não encontrado
        if (error.message === 'Usuário não encontrado') {
          return reply.code(404).send({
            success: false,
            message: 'Usuário não encontrado'
          });
        }
        
        // Equipe ou piloto inválido
        if (error.message === 'Equipe não encontrada ou inativa' || 
            error.message === 'Piloto não encontrado ou inativo') {
          return reply.code(400).send({
            success: false,
            message: error.message
          });
        }
      }
      
      fastify.log.error('Erro ao atualizar preferências');
      return reply.code(500).send({
        success: false,
        message: 'Erro interno do servidor ao atualizar preferências'
      });
    }
  });
}