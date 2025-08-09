import { FastifyPluginAsync } from 'fastify';

const teamsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    return { success: true, message: 'Get teams endpoint - to be implemented' };
  });

  fastify.get('/:id', async (request, reply) => {
    return { success: true, message: 'Get team by ID endpoint - to be implemented' };
  });
};

export default teamsRoutes;
