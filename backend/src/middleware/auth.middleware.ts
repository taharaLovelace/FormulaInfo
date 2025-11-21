import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/auth.service';

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// Middleware para verificar autenticação
export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        message: 'Token de acesso não fornecido'
      });
    }

    const accessToken = authHeader.slice(7);
    const payload = await authService.verifyAccessToken(accessToken);

    // Adicionar informações do usuário ao request
    (request as AuthenticatedRequest).user = {
      id: payload.userId,
      username: payload.username,
      email: payload.email
    };

    done();
  } catch (error: any) {
    return reply.code(401).send({
      message: error.message || 'Token inválido'
    });
  }
};

// Middleware opcional para verificar autenticação (não falha se não autenticado)
export const optionalAuthenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) => {
  try {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.slice(7);
      const payload = await authService.verifyAccessToken(accessToken);

      // Adicionar informações do usuário ao request
      (request as AuthenticatedRequest).user = {
        id: payload.userId,
        username: payload.username,
        email: payload.email
      };
    }

    done();
  } catch (error) {
    // Falha silenciosa, continua sem autenticação
    done();
  }
};

// Middleware para verificar se o usuário é admin (exemplo de autorização)
export const requireAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest;
    
    if (!authenticatedRequest.user) {
      return reply.code(401).send({
        message: 'Token de acesso não fornecido'
      });
    }

    // Aqui você pode verificar se o usuário tem privilégios de admin
    // Por exemplo, consultando o banco de dados ou verificando um campo no token
    const user = await authService.getUserById(authenticatedRequest.user.id);
    
    // Exemplo: verificar se o email é de um admin (implementar conforme sua lógica)
    const adminEmails = ['admin@formulainfo.com', 'admin@example.com'];
    
    if (!adminEmails.includes(user.email)) {
      return reply.code(403).send({
        message: 'Acesso negado: privilégios de administrador requeridos'
      });
    }

    done();
  } catch (error: any) {
    return reply.code(500).send({
      message: 'Erro ao verificar privilégios do usuário'
    });
  }
};

// Plugin do Fastify para registrar os middlewares
export const authMiddlewarePlugin = async (fastify: any) => {
  // Registrar os hooks/middlewares globalmente se necessário
  fastify.decorate('authenticate', authenticate);
  fastify.decorate('optionalAuthenticate', optionalAuthenticate);
  fastify.decorate('requireAdmin', requireAdmin);
};

export default authMiddlewarePlugin;