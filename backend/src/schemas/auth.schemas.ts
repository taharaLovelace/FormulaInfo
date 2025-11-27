/**
 * @fileoverview Schemas de validação para autenticação
 * @description Schemas Zod reutilizáveis para validação de dados de autenticação.
 * Exportados para serem usados nas rotas e nos testes.
 * 
 * @module schemas/auth.schemas
 */

import { z } from 'zod';

/**
 * Schema de validação para registro de usuário
 * @description Valida todos os campos necessários para criar uma conta
 */
export const registerSchema = z.object({
  /** Nome de usuário único (3-20 caracteres, alfanumérico + underscore) */
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  /** Email válido */
  email: z.string().email(),
  /** Senha (mínimo 8 caracteres) */
  password: z.string().min(8),
  /** Nome completo (2-100 caracteres) */
  name: z.string().min(2).max(100),
  /** Data de nascimento opcional (ISO datetime) */
  birthDate: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  /** ID da equipe favorita opcional */
  favoriteTeamId: z.number().int().positive().optional(),
  /** ID do piloto favorito opcional */
  favoriteDriverId: z.number().int().positive().optional()
});

/**
 * Schema de validação para login
 * @description Aceita email ou username como identificador
 */
export const loginSchema = z.object({
  /** Email ou nome de usuário */
  identifier: z.string().min(1),
  /** Senha do usuário */
  password: z.string().min(1)
});

/**
 * Tipo inferido do schema de registro
 */
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Tipo inferido do schema de login
 */
export type LoginInput = z.infer<typeof loginSchema>;
