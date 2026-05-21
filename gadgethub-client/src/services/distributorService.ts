// Distributor Service - Handles distributor operations
// EXACTLY matching the backend DistributorsController endpoints
import { ApiService } from './api';
import { Distributor } from '../types';

export class DistributorService {
  private static readonly baseEndpoint = '/distributors';

  // GET /api/distributors - Get all distributors
  static async getDistributors() {
    return ApiService.get<Distributor[]>(this.baseEndpoint);
  }

  // GET /api/distributors/{id} - Get distributor by ID
  static async getDistributorById(id: string) {
    return ApiService.get<Distributor>(`${this.baseEndpoint}/${id}`);
  }

  // GET /api/distributors/type/{type} - Get distributor by type
  static async getDistributorByType(type: string) {
    return ApiService.get<Distributor>(`${this.baseEndpoint}/type/${type}`);
  }

  // GET /api/distributors/active - Get active distributors
  static async getActiveDistributors() {
    return ApiService.get<Distributor[]>(`${this.baseEndpoint}/active`);
  }

  // POST /api/distributors - Create distributor
  static async createDistributor(distributor: Omit<Distributor, 'id' | 'createdAt'>) {
    return ApiService.post<Distributor>(this.baseEndpoint, distributor);
  }

  // PUT /api/distributors/{id} - Update distributor
  static async updateDistributor(id: string, distributor: Omit<Distributor, 'id' | 'createdAt'>) {
    return ApiService.put<Distributor>(`${this.baseEndpoint}/${id}`, distributor);
  }

  // DELETE /api/distributors/{id} - Delete distributor
  static async deleteDistributor(id: string) {
    return ApiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }
} 