import { apiClient } from './api';
import { AxiosResponse } from 'axios';

// Types for Categorias
export interface CategoriaBase {
  NomCategoria: string;
  Descricao: string;
  TipoCategoria: 'R' | 'D' | 'T';
  CodCategoriaPai: number | null;
  FlgAtivo: 'S' | 'N';
}

export interface CategoriaCreate extends CategoriaBase {}

export interface CategoriaUpdate {
  NomCategoria?: string;
  Descricao?: string;
  TipoCategoria?: 'R' | 'D' | 'T';
  CodCategoriaPai?: number | null;
  FlgAtivo?: 'S' | 'N';
}

export interface CategoriaResponse extends CategoriaBase {
  CodCategoria: number;
  categoria_pai_nome?: string;
  DesCategoria?: string;
  subcategorias?: CategoriaResponse[];
  NomUsuario: string;
  DtCreate: string;
  DtAlter?: string;
}

// API functions
export const categoriasApi = {
  list: (params?: { 
    skip?: number; 
    limit?: number; 
    tipo?: string; 
    ativas_apenas?: boolean; 
    hierarquica?: boolean 
  }): Promise<AxiosResponse<CategoriaResponse[]>> =>
    apiClient.get('/categorias', { params }),
  
  get: (id: number): Promise<AxiosResponse<CategoriaResponse>> =>
    apiClient.get(`/categorias/${id}`),
  
  create: (data: CategoriaCreate): Promise<AxiosResponse<CategoriaResponse>> =>
    apiClient.post('/categorias', data),
  
  update: (id: number, data: CategoriaUpdate): Promise<AxiosResponse<CategoriaResponse>> =>
    apiClient.put(`/categorias/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/categorias/${id}`),
  
  // Additional endpoints that might be needed
  activate: (id: number): Promise<AxiosResponse<CategoriaResponse>> =>
    apiClient.patch(`/categorias/${id}/ativar`),
    
  move: (id: number, nova_categoria_pai_id: number | null): Promise<AxiosResponse<CategoriaResponse>> =>
    apiClient.patch(`/categorias/${id}/mover`, { nova_categoria_pai_id }),
};