import api from './api';

export interface Driver {
  id: number;
  driverNumber: number;
  fullName: string;
  firstName: string;
  lastName: string;
  nationality: string;
  teamName: string;
  birthDate?: string;
  bio?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
}

class DriversApiService {
  // Buscar todos os pilotos
  async getAllDrivers(active?: boolean): Promise<Driver[]> {
    const params = active !== undefined ? { active: active.toString() } : {};
    const response = await api.get<{
      success: boolean;
      data: Driver[];
    }>('/drivers', { params });
    
    return response.data.data;
  }

  // Buscar pilotos ativos
  async getActiveDrivers(): Promise<Driver[]> {
    return this.getAllDrivers(true);
  }

  // Buscar piloto por ID
  async getDriverById(id: number): Promise<Driver | null> {
    try {
      const drivers = await this.getAllDrivers();
      return drivers.find(d => d.id === id) || null;
    } catch {
      return null;
    }
  }
}

export const driversApiService = new DriversApiService();
export default driversApiService;
