import { FastifyPluginAsync } from 'fastify';

const racesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    return { success: true, message: 'Get races endpoint - to be implemented' };
  });

  fastify.get('/:id', async (request, reply) => {
    return { success: true, message: 'Get race by ID endpoint - to be implemented' };
  });
};

export default racesRoutes;
