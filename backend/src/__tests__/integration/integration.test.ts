/**
 * @fileoverview Testes de Integração
 * @description Contém 4 testes de integração:
 * - 1 teste de fluxo de autenticação (registro + login)
 * - 1 teste de listagem de equipes
 * - 1 teste de listagem de pilotos
 * - 1 teste de atualização de preferências (piloto favorito)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

// ============================================================================
// Configuração
// ============================================================================

let app: any;
let prisma: PrismaClient;
let authCookies: string[] = []; // Armazena cookies de autenticação

// Dados para testes - username curto para caber no limite de 20 chars
const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos
const testUser = {
  username: `test_${timestamp}`,  // Ex: test_530123 (12 chars)
  email: `test_${timestamp}@test.com`,
  password: 'TestPassword123!',
  name: 'Test User',
};

beforeAll(async () => {
  // Conecta ao banco de dados
  prisma = new PrismaClient();
  await prisma.$connect();
  console.log('Postgres conectado');

  // Importa e configura a aplicação Fastify
  const { buildApp } = await import('../../app');
  app = await buildApp();
  await app.ready();
  console.log('Aplicação Fastify pronta');
});

afterAll(async () => {
  // Limpa usuário de teste criado durante os testes
  if (prisma) {
    await prisma.user.deleteMany({
      where: { 
        OR: [
          { email: testUser.email },
          { username: testUser.username }
        ]
      },
    });
    await prisma.$disconnect();
    console.log('Limpeza de dados de teste concluída');
  }

  // Fecha a aplicação Fastify
  if (app) {
    await app.close();
  }
});

describe('Testes de Integração', () => {
  
  // ==========================================================================
  // Teste 1: Fluxo de Autenticação (Registro + Login)
  // ==========================================================================
  describe('Fluxo de Autenticação', () => {
    it('Deve registrar um novo usuário e fazer login com sucesso', async () => {
      // Registro de novo usuário
      const registerResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: testUser,
      });

      // Deve retornar 201 Created
      expect(registerResponse.statusCode).toBe(201);
      
      const registerData = JSON.parse(registerResponse.body);
      expect(registerData).toHaveProperty('user');
      expect(registerData.user.email).toBe(testUser.email);
      expect(registerData.user.username).toBe(testUser.username);

      // Guarda cookies de autenticação para usar nos próximos testes
      authCookies = registerResponse.cookies.map(
        (c: { name: string; value: string }) => `${c.name}=${c.value}`
      );

      // Login com o usuário recém-criado
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          identifier: testUser.email,
          password: testUser.password,
        },
      });

      // Deve retornar 200 OK
      expect(loginResponse.statusCode).toBe(200);
      
      const loginData = JSON.parse(loginResponse.body);
      expect(loginData).toHaveProperty('user');
      expect(loginData.user.email).toBe(testUser.email);
    });
  });

  // ==========================================================================
  // Teste 2: Listagem de Equipes
  // ==========================================================================
  describe('Listagem de Equipes', () => {
    it('Deve retornar lista de equipes de F1', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/teams',
      });

      // Deve retornar 200 OK
      expect(response.statusCode).toBe(200);
      
      const responseBody = JSON.parse(response.body);
      
      // Resposta deve ter a estrutura correta { success, data, message }
      expect(responseBody).toHaveProperty('success', true);
      expect(responseBody).toHaveProperty('data');
      expect(Array.isArray(responseBody.data)).toBe(true);
      
      // Se há equipes cadastradas, verifica a estrutura
      if (responseBody.data.length > 0) {
        expect(responseBody.data[0]).toHaveProperty('id');
        expect(responseBody.data[0]).toHaveProperty('name');
        expect(responseBody.data[0]).toHaveProperty('isActive');
      }
    });
  });

  // ==========================================================================
  // Teste 3: Listagem de Pilotos
  // ==========================================================================
  describe('Listagem de Pilotos', () => {
    it('Deve retornar lista de pilotos de F1', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/drivers',
      });

      // Deve retornar 200 OK
      expect(response.statusCode).toBe(200);
      
      const responseBody = JSON.parse(response.body);
      
      // Resposta deve ter a estrutura correta { success, data }
      expect(responseBody).toHaveProperty('success', true);
      expect(responseBody).toHaveProperty('data');
      expect(Array.isArray(responseBody.data)).toBe(true);
      
      // Se há pilotos cadastrados, verifica a estrutura
      if (responseBody.data.length > 0) {
        expect(responseBody.data[0]).toHaveProperty('id');
        expect(responseBody.data[0]).toHaveProperty('fullName');
        expect(responseBody.data[0]).toHaveProperty('isActive');
      }
    });
  });

  // ==========================================================================
  // Teste 4: Atualização de Preferências (Piloto Favorito)
  // ==========================================================================
  describe('Setagem de piloto favorito', () => {
    it('Deve atualizar o piloto favorito do usuário autenticado', async () => {
      // Extrai token de autenticação dos cookies
      const accessTokenCookie = authCookies.find(c => c.startsWith('accessToken='));
      const accessToken = accessTokenCookie?.split('=')[1];

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/teams/preferences/me',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: { favoriteDriverId: 1 },
      });

      expect(response.statusCode).toBe(200);
      
      const responseBody = JSON.parse(response.body);
      
      expect(responseBody).toHaveProperty('success', true);
      expect(responseBody).toHaveProperty('message');
      expect(responseBody.message).toBe('Preferências atualizadas com sucesso');
    });
  });
});
