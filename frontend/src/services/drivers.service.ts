/**
 * @fileoverview Serviço de pilotos do frontend
 * @description Este módulo encapsula as operações relacionadas aos pilotos
 * de Fórmula 1, incluindo listagem e busca.
 * 
 * @module drivers.service
 * @requires ./api
 */

import api from './api';

// ==================== INTERFACES ====================

/**
 * Representa um piloto de Fórmula 1
 * @interface Driver
 */
export interface Driver {
  id: number;
  driverNumber: number;
  fullName: string;
  firstName: string;
  lastName: string;
  /** Código ISO 2 do país (ex: "BR", "GB") */
  nationality: string;
  teamName: string;
  birthDate?: string;
  bio?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
}

/**
 * Serviço de gerenciamento de pilotos
 * @class DriversApiService
 */
class DriversApiService {
  /**
   * Busca todos os pilotos com filtro opcional
   * @param {boolean} [active] - Filtrar por status ativo/inativo
   * @returns {Promise<Driver[]>} Lista de pilotos
   */
  async getAllDrivers(active?: boolean): Promise<Driver[]> {
    const params = active !== undefined ? { active: active.toString() } : {};
    const response = await api.get<{
      success: boolean;
      data: Driver[];
    }>('/drivers', { params });
    
    return response.data.data;
  }

  /**
   * Busca apenas pilotos ativos
   * Atalho para getAllDrivers(true)
   * @returns {Promise<Driver[]>} Lista de pilotos ativos
   */
  async getActiveDrivers(): Promise<Driver[]> {
    return this.getAllDrivers(true);
  }

  /**
   * Busca um piloto específico por ID
   * @param {number} id - ID do piloto
   * @returns {Promise<Driver | null>} Piloto ou null se não encontrado
   */
  async getDriverById(id: number): Promise<Driver | null> {
    try {
      const drivers = await this.getAllDrivers();
      return drivers.find(d => d.id === id) || null;
    } catch {
      return null;
    }
  }
}

/** Instância singleton do serviço de pilotos */
export const driversApiService = new DriversApiService();
export default driversApiService;
