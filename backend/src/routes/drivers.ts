import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const driversQuerySchema = z.object({
  active: z.string().optional(),
  team: z.string().optional()
});

const driversRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /drivers
  fastify.get('/', {
    schema: {
      description: 'Get all drivers',
      tags: ['Drivers'],
      querystring: {
        type: 'object',
        properties: {
          active: { type: 'boolean' },
          team: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  driverNumber: { type: 'number' },
                  fullName: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  nationality: { type: 'string' },
                  teamName: { type: 'string' },
                  birthDate: { type: 'string' },
                  bio: { type: 'string' },
                  imageUrl: { type: 'string' },
                  isActive: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const query = driversQuerySchema.parse(request.query);
    
    try {
      const drivers = await prisma.driver.findMany({
        where: {
          ...(query.active !== undefined && { isActive: query.active === 'true' }),
          ...(query.team && { teamName: { contains: query.team, mode: 'insensitive' } })
        },
        orderBy: { driverNumber: 'asc' }
      });
      
      return {
        success: true,
        data: drivers
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Erro ao buscar pilotos'
      });
    }
  });
};

export default driversRoutes;
