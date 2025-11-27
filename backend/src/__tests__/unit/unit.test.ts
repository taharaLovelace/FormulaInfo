/**
 * @fileoverview Testes Unitários
 * @description Contém 7 testes unitários:
 * - 2 testes AuthService (register, login)
 * - 2 testes TeamsService (getAllTeams, getTeamById)
 * - 1 teste DriversService (listDrivers)
 * - 2 testes Validators (registerSchema, loginSchema)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// Mocks Globais
// ============================================================================

vi.mock('../../services/redis.service', () => ({
  redisService: {
    setRefreshToken: vi.fn().mockResolvedValue(true),
    getRefreshToken: vi.fn().mockResolvedValue(null),
    deleteRefreshToken: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn(), compare: vi.fn() },
}));

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn().mockReturnValue('mock-jwt-token'),
  verify: vi.fn(),
}));

// ============================================================================
// TESTES UNITÁRIOS
// ============================================================================

describe('Testes Unitários', () => {
  
  // ==========================================================================
  // Teste 1 & 2: AuthService
  // ==========================================================================
  describe('AuthService', () => {
    let prismaMock: any;
    let AuthService: any;
    let bcrypt: any;

    beforeEach(async () => {
      vi.clearAllMocks();
      
      prismaMock = {
        user: {
          findFirst: vi.fn(),
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
      };

      const module = await import('../../services/auth.service');
      AuthService = module.AuthService;
      bcrypt = (await import('bcryptjs')).default;
    });

    // Teste 1: Registro com sucesso
    it('Deve registrar um novo usuário com sucesso', async () => {
      const authService = new AuthService(prismaMock);
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        isActive: true,
      };
      
      prismaMock.user.findFirst.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('projeto3-de-cloud-git-hub-actions' as never);
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe('test@example.com');
      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    // Teste 2: Login com credenciais inválidas
    it('Deve rejeitar login com usuário inexistente', async () => {
      const authService = new AuthService(prismaMock);
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(authService.login({
        identifier: 'usuario_inexistente',
        password: 'senha123',
      })).rejects.toThrow('Credenciais inválidas');
    });
  });

  // ==========================================================================
  // Teste 3 & 4: TeamsService
  // ==========================================================================
  describe('TeamsService', () => {
    let prismaMock: any;
    let TeamsService: any;

    const mockTeams = [
      { id: 1, name: 'Red Bull Racing', isActive: true },
      { id: 2, name: 'Ferrari', isActive: true },
    ];

    beforeEach(async () => {
      vi.clearAllMocks();
      
      prismaMock = {
        team: {
          findMany: vi.fn(),
          findUnique: vi.fn(),
        },
        user: {
          findUnique: vi.fn(),
          update: vi.fn(),
        },
        driver: {
          findUnique: vi.fn(),
        },
      };

      const module = await import('../../services/teams.service');
      TeamsService = module.TeamsService;
    });

    // Teste 3: Listar equipes
    it('Deve retornar todas as equipes ativas', async () => {
      const teamsService = new TeamsService(prismaMock);
      prismaMock.team.findMany.mockResolvedValue(mockTeams);

      const result = await teamsService.getAllTeams();

      expect(prismaMock.team.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Red Bull Racing');
    });

    // Teste 4: Buscar equipe por ID
    it('Deve retornar null para equipe inexistente', async () => {
      const teamsService = new TeamsService(prismaMock);
      prismaMock.team.findUnique.mockResolvedValue(null);

      const result = await teamsService.getTeamById(999);

      expect(result).toBeNull();
    });
  });

  // ==========================================================================
  // Teste 5: DriversService
  // ==========================================================================
  describe('DriversService', () => {
    let prismaMock: any;
    let DriversService: any;

    const mockDrivers = [
      { id: 1, driverNumber: 1, fullName: 'Max Verstappen', teamName: 'Red Bull Racing', isActive: true },
      { id: 2, driverNumber: 16, fullName: 'Charles Leclerc', teamName: 'Ferrari', isActive: true },
    ];

    beforeEach(async () => {
      vi.clearAllMocks();
      
      prismaMock = {
        driver: {
          findMany: vi.fn(),
        },
      };

      const module = await import('../../services/drivers.service');
      DriversService = module.DriversService;
    });

    // Teste 5: Listar pilotos com filtro
    it('5. Deve listar pilotos filtrando por equipe e status ativo', async () => {
      const driversService = new DriversService(prismaMock);
      
      prismaMock.driver.findMany.mockResolvedValue(
        mockDrivers.filter(d => d.teamName === 'Ferrari' && d.isActive)
      );

      const result = await driversService.listDrivers({ active: true, team: 'Ferrari' });

      // Verifica que a query foi construída corretamente
      expect(prismaMock.driver.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          teamName: { contains: 'Ferrari', mode: 'insensitive' },
        },
        orderBy: { driverNumber: 'asc' },
      });
      
      // Verifica o resultado
      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe('Charles Leclerc');
    });
  });

  // ==========================================================================
  // Teste 6 & 7: Validators (Zod Schemas importados do módulo de schemas)
  // ==========================================================================
  describe('Validators', () => {
    // Importa os schemas do arquivo dedicado (sem dependências do Prisma)
    let registerSchema: any;
    let loginSchema: any;

    beforeEach(async () => {
      // Importa diretamente do arquivo de schemas (não tem Prisma)
      const schemas = await import('../../schemas/auth.schemas');
      registerSchema = schemas.registerSchema;
      loginSchema = schemas.loginSchema;
    });

    // Teste 6: registerSchema válido
    it('6. Deve validar dados de registro corretos', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.username).toBe('testuser');
        expect(result.data.email).toBe('test@example.com');
      }
    });

    // Teste 7: loginSchema inválido
    it('7. Deve rejeitar login com campos vazios', () => {
      const invalidData = {
        identifier: '',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
});
