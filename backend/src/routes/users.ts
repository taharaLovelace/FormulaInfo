import { FastifyPluginAsync } from 'fastify';

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/profile', async (request, reply) => {
    return { success: true, message: 'Get user profile endpoint - to be implemented' };
  });

  fastify.put('/profile', async (request, reply) => {
    return { success: true, message: 'Update user profile endpoint - to be implemented' };
  });
};

export default usersRoutes;
