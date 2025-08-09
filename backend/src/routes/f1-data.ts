import { FastifyPluginAsync } from 'fastify';

const f1DataRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/current-season', async (request, reply) => {
    return { success: true, message: 'Get current season data from OpenF1 API - to be implemented' };
  });

  fastify.get('/drivers/:id/sessions', async (request, reply) => {
    return { success: true, message: 'Get driver sessions from OpenF1 API - to be implemented' };
  });
};

export default f1DataRoutes;
