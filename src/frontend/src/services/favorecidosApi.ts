import { apiClient } from './api';
import { AxiosResponse } from 'axios';

// Types for Favorecidos
export interface FavorecidoBase {
  DesFavorecido: string;
  TipoFavorecido?: 'F' | 'J';
  CPF?: string;
  CNPJ?: string;
  Telefone?: string;
  Email?: string;
  Endereco?: string;
  FlgAtivo?: 'S' | 'N';
}

export interface FavorecidoCreate extends FavorecidoBase {}

export interface FavorecidoUpdate {
  DesFavorecido?: string;
  TipoFavorecido?: 'F' | 'J';
  CPF?: string;
  CNPJ?: string;
  Telefone?: string;
  Email?: string;
  Endereco?: string;
  FlgAtivo?: 'S' | 'N';
}

export interface FavorecidoResponse extends FavorecidoBase {
  CodFavorecido: number;
  NomUsuario?: string;
  DatCadastro?: string;
  DatAlteracao?: string;
  // Propriedades de compatibilidade
  NomFavorecido?: string;
  CPF_CNPJ?: string;
  DtCreate?: string;
  DtAlter?: string;
}

// API functions
export const favorecidosApi = {
  list: (params?: { 
    skip?: number; 
    limit?: number; 
    ativos_apenas?: boolean;
    search?: string;
  }): Promise<AxiosResponse<FavorecidoResponse[]>> =>
    apiClient.get('/favorecidos', { params }),
  
  get: (id: number): Promise<AxiosResponse<FavorecidoResponse>> =>
    apiClient.get(`/favorecidos/${id}`),
  
  create: (data: FavorecidoCreate): Promise<AxiosResponse<FavorecidoResponse>> =>
    apiClient.post('/favorecidos', data),
  
  update: (id: number, data: FavorecidoUpdate): Promise<AxiosResponse<FavorecidoResponse>> =>
    apiClient.put(`/favorecidos/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/favorecidos/${id}`),
  
  // Additional endpoints that might be needed
  activate: (id: number): Promise<AxiosResponse<FavorecidoResponse>> =>
    apiClient.patch(`/favorecidos/${id}/ativar`),
};