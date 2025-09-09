import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { listDrivers } from '../services/drivers.service';

const querySchema = z.object({
  active: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((v) => (typeof v === 'string' ? v === 'true' : v)),
  team: z.string().optional(),
});

const driverSchema = z.object({
  id: z.number(),
  driverNumber: z.number(),
  fullName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  nationality: z.string(),
  teamName: z.string(),
  birthDate: z.date().or(z.string()),
  bio: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean(),
});

const responseSchema = z.object({
  success: z.literal(true),
  data: z.array(driverSchema),
});

const driversRoutes: FastifyPluginAsync = async (app) => {
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
