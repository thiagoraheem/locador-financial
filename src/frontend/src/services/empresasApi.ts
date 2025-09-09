import { apiClient } from './api';
import { AxiosResponse } from 'axios';

// Types for Empresas
export interface EmpresaBase {
  NomEmpresa: string;
  RazaoSocial: string;
  CNPJ: string;
  Endereco: string;
  Bairro: string;
  CEP: string;
  Municipio: string;
  Estado: string;
  Telefone: string;
  Email: string;
  FlgPadrao: boolean;
  FlgAtivo: 'S' | 'N';
}

export interface EmpresaCreate extends EmpresaBase {}

export interface EmpresaUpdate {
  NomEmpresa?: string;
  RazaoSocial?: string;
  CNPJ?: string;
  Endereco?: string;
  Bairro?: string;
  CEP?: string;
  Municipio?: string;
  Estado?: string;
  Telefone?: string;
  Email?: string;
  FlgPadrao?: boolean;
  FlgAtivo?: 'S' | 'N';
}

export interface EmpresaResponse extends EmpresaBase {
  CodEmpresa: number;
  NomUsuario: string;
  DtCreate: string;
  DtAlter?: string;
}

// API functions
export const empresasApi = {
  list: (params?: { 
    skip?: number; 
    limit?: number;
    ativas_apenas?: boolean;
  }): Promise<AxiosResponse<EmpresaResponse[]>> =>
    apiClient.get('/empresas', { params }),
  
  get: (id: number): Promise<AxiosResponse<EmpresaResponse>> =>
    apiClient.get(`/empresas/${id}`),
  
  create: (data: EmpresaCreate): Promise<AxiosResponse<EmpresaResponse>> =>
    apiClient.post('/empresas', data),
  
  update: (id: number, data: EmpresaUpdate): Promise<AxiosResponse<EmpresaResponse>> =>
    apiClient.put(`/empresas/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/empresas/${id}`),
};