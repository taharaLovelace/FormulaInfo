import { FastifyInstance, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthService, AuthTokens } from '../services/auth.service';

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

// 🛡️ Funções para cookies seguros
const setSecureCookies = (reply: FastifyReply, tokens: AuthTokens) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Access Token - Cookie seguro (15 min)
  reply.setCookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60, // 15 minutos em segundos
    path: '/',
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
  });

  // Refresh Token - Cookie seguro (7 dias)
  reply.setCookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
    path: '/',
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
  });
};

// 🛡️ Função para limpar cookies
const clearAuthCookies = (reply: FastifyReply) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  reply.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
  });

  reply.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
  });
};

export default async function authRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // 🛡️ Registrar usuário
  server.post('/register', {
    schema: {
      body: registerSchema
    }
  }, async (request, reply) => {
    try {
      const userData = request.body;
      const result = await authService.register(userData);
      
      // 🛡️ Definir cookies seguros
      setSecureCookies(reply, result.tokens);
      
      // 🛡️ Retornar apenas dados do usuário (SEM tokens no JSON)
      reply.code(201).send({
        user: result.user,
        message: 'Usuário registrado com sucesso'
      });
    } catch (error: any) {
      reply.code(400).send({
        message: error.message || 'Erro ao registrar usuário'
      });
    }
  });

  // 🛡️ Login
  server.post('/login', {
    schema: {
      body: loginSchema
    }
  }, async (request, reply) => {
    try {
      const loginData = request.body;
      const result = await authService.login(loginData);

      // 🛡️ Definir cookies seguros
      setSecureCookies(reply, result.tokens);

      // 🛡️ Retornar apenas dados do usuário (SEM tokens no JSON)
      reply.send({
        user: result.user,
        message: 'Login realizado com sucesso'
      });
    } catch (error: any) {
      reply.code(401).send({
        message: error.message || 'Credenciais inválidas'
      });
    }
  });

  // 🛡️ Refresh Token
  server.post('/refresh', async (request, reply) => {
    try {
      // 🛡️ Obter refresh token apenas do cookie (mais seguro)
      const refreshToken = request.cookies?.refreshToken;

      if (!refreshToken) {
        return reply.code(401).send({
          message: 'Refresh token não encontrado'
        });
      }

      const newTokens = await authService.refreshToken(refreshToken);

      // 🛡️ Definir novos cookies seguros
      setSecureCookies(reply, newTokens);

      // 🛡️ Retornar apenas access token (SEM refresh token no JSON)
      reply.send({
        accessToken: newTokens.accessToken,
        message: 'Tokens atualizados com sucesso'
      });
    } catch (error: any) {
      // 🛡️ Limpar cookies em caso de erro
      clearAuthCookies(reply);
      reply.code(401).send({
        message: error.message || 'Token de refresh inválido'
      });
    }
  });

  // 🛡️ Logout
  server.post('/logout', async (request, reply) => {
    try {
      // 🛡️ Obter access token do cabeçalho Authorization
      const authHeader = request.headers.authorization;
      let accessTokenJti: string | undefined;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const accessToken = authHeader.slice(7);
        try {
          const payload = await authService.verifyAccessToken(accessToken);
          accessTokenJti = payload.jti;
        } catch {
          // Token inválido, mas ainda queremos limpar o refresh token
        }
      }

      // 🛡️ Obter user ID do access token ou refresh token
      const refreshToken = request.cookies?.refreshToken;
      let userId: string | undefined;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const accessToken = authHeader.slice(7);
        try {
          const payload = await authService.verifyAccessToken(accessToken);
          userId = payload.userId;
        } catch {
          // Token inválido, tentar obter do refresh token
        }
      }

      if (!userId && refreshToken) {
        try {
          const payload = await authService.verifyRefreshToken(refreshToken);
          userId = payload.userId;
        } catch {
          // Token inválido
        }
      }

      if (userId) {
        await authService.logout(userId, accessTokenJti);
      }

      // 🛡️ Limpar todos os cookies de autenticação
      clearAuthCookies(reply);

      reply.send({
        message: 'Logout realizado com sucesso'
      });
    } catch (error: any) {
      // 🛡️ Sempre limpar cookies mesmo em caso de erro
      clearAuthCookies(reply);
      reply.code(500).send({
        message: 'Erro ao realizar logout'
      });
    }
  });

  // 🛡️ Get current user (protected route)
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

      // 🛡️ Retornar apenas dados seguros do usuário
      reply.send(authService.toSafeUser(user));
    } catch (error: any) {
      reply.code(401).send({
        message: error.message || 'Token inválido'
      });
    }
  });
}