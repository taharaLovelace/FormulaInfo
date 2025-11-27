/**
 * @fileoverview Rotas de autenticação
 * @description Endpoints para registro, login, logout, refresh token e perfil.
 * Implementa autenticação JWT com cookies HttpOnly para maior segurança.
 * 
 * @module routes/auth
 */

import { FastifyInstance, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthService, AuthTokens } from '../services/auth.service';
import { registerSchema, loginSchema } from '../schemas/auth.schemas';

// ==================== CONFIGURAÇÃO ====================

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

// ==================== FUNÇÕES DE COOKIES ====================

/**
 * Define cookies seguros de autenticação
 * @param {FastifyReply} reply - Objeto de resposta do Fastify
 * @param {AuthTokens} tokens - Tokens de acesso e refresh
 * @description Configura cookies HttpOnly com configurações de segurança
 * baseadas no ambiente (produção vs desenvolvimento)
 */
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

/**
 * Limpa cookies de autenticação
 * @param {FastifyReply} reply - Objeto de resposta do Fastify
 * @description Remove os cookies de access e refresh token
 */
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

// ==================== ROTAS ====================

/**
 * Registra as rotas de autenticação
 * @param {FastifyInstance} fastify - Instância do Fastify
 * 
 * @description Endpoints disponíveis:
 * - POST /register - Registrar novo usuário
 * - POST /login - Autenticar usuário
 * - POST /refresh - Renovar tokens
 * - POST /logout - Encerrar sessão
 * - GET /me - Obter dados básicos do usuário
 * - GET /profile - Obter perfil completo com preferências
 */
export default async function authRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * POST /register - Registrar novo usuário
   * @description Cria uma nova conta e retorna tokens via cookies
   */
  server.post('/register', {
    schema: {
      body: registerSchema
    }
  }, async (request, reply) => {
    try {
      const userData = request.body;
      const result = await authService.register(userData);
      
      // Define cookies seguros
      setSecureCookies(reply, result.tokens);
      
      // Retorna apenas dados do usuário (SEM tokens no JSON)
      reply.code(201).send({
        user: result.user,
        message: 'Usuário registrado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar usuário';
      reply.code(400).send({ message });
    }
  });

  /**
   * POST /login - Autenticar usuário
   * @description Valida credenciais e retorna tokens via cookies
   */
  server.post('/login', {
    schema: {
      body: loginSchema
    }
  }, async (request, reply) => {
    try {
      const loginData = request.body;
      const result = await authService.login(loginData);

      // Define cookies seguros
      setSecureCookies(reply, result.tokens);

      // Retorna apenas dados do usuário (SEM tokens no JSON)
      reply.send({
        user: result.user,
        message: 'Login realizado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Credenciais inválidas';
      reply.code(401).send({ message });
    }
  });

  /**
   * POST /refresh - Renovar tokens de autenticação
   * @description Usa refresh token do cookie para gerar novos tokens
   */
  server.post('/refresh', async (request, reply) => {
    try {
      // Obter refresh token apenas do cookie (mais seguro)
      const refreshToken = request.cookies?.refreshToken;

      if (!refreshToken) {
        return reply.code(401).send({
          message: 'Refresh token não encontrado'
        });
      }

      const newTokens = await authService.refreshToken(refreshToken);

      // Define novos cookies seguros
      setSecureCookies(reply, newTokens);

      // Retorna apenas access token (SEM refresh token no JSON)
      reply.send({
        accessToken: newTokens.accessToken,
        message: 'Tokens atualizados com sucesso'
      });
    } catch (error: unknown) {
      // Limpa cookies em caso de erro
      clearAuthCookies(reply);
      const message = error instanceof Error ? error.message : 'Token de refresh inválido';
      reply.code(401).send({ message });
    }
  });

  /**
   * POST /logout - Encerrar sessão do usuário
   * @description Invalida tokens e limpa cookies de autenticação
   */
  server.post('/logout', async (request, reply) => {
    try {
      // Obter access token do cabeçalho Authorization
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

      // Obter user ID do access token ou refresh token
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

      // Limpar todos os cookies de autenticação
      clearAuthCookies(reply);

      reply.send({
        message: 'Logout realizado com sucesso'
      });
    } catch {
      // Sempre limpar cookies mesmo em caso de erro
      clearAuthCookies(reply);
      reply.code(500).send({
        message: 'Erro ao realizar logout'
      });
    }
  });

  /**
   * GET /me - Obter dados básicos do usuário autenticado
   * @description Retorna informações básicas do usuário logado
   */
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

      // Retornar apenas dados básicos do usuário
      reply.send(authService.toBasicUser(user));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Token inválido';
      reply.code(401).send({ message });
    }
  });

  /**
   * GET /profile - Obter perfil completo do usuário
   * @description Retorna todos os dados do usuário incluindo preferências
   */
  server.get('/profile', async (request, reply) => {
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

      // Retornar todos os dados do usuário (com favoritos)
      reply.send(authService.toSafeUser(user));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Token inválido';
      reply.code(401).send({ message });
    }
  });
}