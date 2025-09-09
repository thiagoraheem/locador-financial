import { apiClient } from './api';
import { AxiosResponse } from 'axios';

// Types for Bancos
export interface BancoBase {
  Codigo: number;
  Digito: string;
  Nome: string;
  NomeAbreviado: string;
  FlgAtivo: 'S' | 'N';
}

export interface BancoCreate extends BancoBase {}

export interface BancoUpdate {
  Codigo?: number;
  Digito?: string;
  Nome?: string;
  NomeAbreviado?: string;
  FlgAtivo?: 'S' | 'N';
}

export interface BancoResponse extends BancoBase {
  NomUsuario: string;
  DtCreate: string;
  DtAlter?: string;
}

// API functions
export const bancosApi = {
  list: (params?: { 
    skip?: number; 
    limit?: number;
    ativos_apenas?: boolean;
  }): Promise<AxiosResponse<BancoResponse[]>> =>
    apiClient.get('/bancos', { params }),
  
  get: (codigo: number): Promise<AxiosResponse<BancoResponse>> =>
    apiClient.get(`/bancos/${codigo}`),
  
  create: (data: BancoCreate): Promise<AxiosResponse<BancoResponse>> =>
    apiClient.post('/bancos', data),
  
  update: (codigo: number, data: BancoUpdate): Promise<AxiosResponse<BancoResponse>> =>
    apiClient.put(`/bancos/${codigo}`, data),
  
  delete: (codigo: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/bancos/${codigo}`),
};