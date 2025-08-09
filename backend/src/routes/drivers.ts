import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

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
                  fullName: { type: 'string' },
                  teamName: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const query = driversQuerySchema.parse(request.query);
    
    return {
      success: true,
      message: 'Get drivers endpoint - to be implemented',
      query
    };
  });

  // GET /drivers/:id
  fastify.get('/:id', {
    schema: {
      description: 'Get driver by ID',
      tags: ['Drivers'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                fullName: { type: 'string' },
                teamName: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    
    return {
      success: true,
      message: 'Get driver by ID endpoint - to be implemented',
      id
    };
  });
};

export default driversRoutes;
