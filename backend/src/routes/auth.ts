import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/auth.service';

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

// Schemas de validação
const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
  birthDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  favoriteTeamId: z.number().int().positive().optional(),
  favoriteDriverId: z.number().int().positive().optional()
});

const loginSchema = z.object({
  identifier: z.string().min(1), // email ou username
  password: z.string().min(1)
});

// Apenas schemas realmente utilizados são mantidos

export default async function authRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // Registrar usuário
  server.post('/register', {
    schema: {
      body: registerSchema
    }
  }, async (request, reply) => {
    try {
      const userData = request.body;
      const result = await authService.register(userData);
      
      // Set refresh token as HTTP-only cookie
      reply.setCookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });

      reply.code(201).send({
        user: result.user,
        tokens: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken
        }
      });
    } catch (error: any) {
      reply.code(400).send({
        message: error.message || 'Erro ao registrar usuário'
      });
    }
  });

  // Login
  server.post('/login', {
    schema: {
      body: loginSchema
    }
  }, async (request, reply) => {
    try {
      const loginData = request.body;
      const result = await authService.login(loginData);

      // Set refresh token as HTTP-only cookie
      reply.setCookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });

      reply.send({
        user: result.user,
        tokens: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken
        }
      });
    } catch (error: any) {
      reply.code(401).send({
        message: error.message || 'Credenciais inválidas'
      });
    }
  });

  // Refresh token
  server.post('/refresh', async (request, reply) => {
    try {
      // Try to get refresh token from cookie first, then from body
      const refreshTokenFromCookie = request.cookies.refreshToken;
      const refreshTokenFromBody = (request.body as any)?.refreshToken;
      const refreshToken = refreshTokenFromCookie || refreshTokenFromBody;

      if (!refreshToken) {
        return reply.code(401).send({
          message: 'Refresh token não fornecido'
        });
      }

      const newTokens = await authService.refreshToken(refreshToken);

      // Set new refresh token as HTTP-only cookie
      reply.setCookie('refreshToken', newTokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });

      reply.send(newTokens);
    } catch (error: any) {
      reply.code(401).send({
        message: error.message || 'Token de refresh inválido'
      });
    }
  });

  // Logout
  server.post('/logout', async (request, reply) => {
    try {
      // Get access token from Authorization header
      const authHeader = request.headers.authorization;
      let accessTokenJti: string | undefined;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const accessToken = authHeader.slice(7);
        try {
          const payload = await authService.verifyAccessToken(accessToken);
          accessTokenJti = payload.jti;
        } catch {
          // Token invalid, but we still want to clear the refresh token
        }
      }

      // Get user ID from access token or refresh token
      const refreshToken = request.cookies.refreshToken;
      let userId: string | undefined;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const accessToken = authHeader.slice(7);
        try {
          const payload = await authService.verifyAccessToken(accessToken);
          userId = payload.userId;
        } catch {
          // Token invalid, try to get from refresh token
        }
      }

      if (!userId && refreshToken) {
        try {
          const payload = await authService.verifyRefreshToken(refreshToken);
          userId = payload.userId;
        } catch {
          // Token invalid
        }
      }

      if (userId) {
        await authService.logout(userId, accessTokenJti);
      }

      // Clear refresh token cookie
      reply.clearCookie('refreshToken', { path: '/' });

      reply.send({
        message: 'Logout realizado com sucesso'
      });
    } catch (error: any) {
      reply.code(500).send({
        message: 'Erro ao realizar logout'
      });
    }
  });

  // Get current user (protected route example)
  server.get('/me', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          message: 'Token de acesso não fornecido'
        });
      }

      const accessToken = authHeader.slice(7);
      const payload = await authService.verifyAccessToken(accessToken);
      const user = await authService.getUserById(payload.userId);

      reply.send(user);
    } catch (error: any) {
      reply.code(401).send({
        message: error.message || 'Token inválido'
      });
    }
  });
}