import { apiClient } from './api';
import { AxiosResponse } from 'axios';

// Types for Contas Bancárias
export interface ContaBase {
  CodEmpresa: number;
  Banco: number;
  Agencia: string;
  AgenciaDigito: string;
  Conta: string;
  ContaDigito: string;
  NomConta: string;
  TipoConta: 'CC' | 'CP' | 'CS';
  Saldo: number;
  FlgContaPadrao: boolean;
  FlgAtivo: 'S' | 'N';
  TipoPix: string;
  ValorPix: string;
  EnableAPI: boolean;
  ConfiguracaoAPI: string;
  TokenAPI: string;
}

export interface ContaCreate extends ContaBase {}

export interface ContaUpdate {
  CodEmpresa?: number;
  Banco?: number;
  Agencia?: string;
  AgenciaDigito?: string;
  Conta?: string;
  ContaDigito?: string;
  NomConta?: string;
  TipoConta?: 'CC' | 'CP' | 'CS';
  Saldo?: number;
  FlgContaPadrao?: boolean;
  FlgAtivo?: 'S' | 'N';
  TipoPix?: string;
  ValorPix?: string;
  EnableAPI?: boolean;
  ConfiguracaoAPI?: string;
  TokenAPI?: string;
}

export interface ContaResponse extends ContaBase {
  idConta: number;
  NomUsuario: string;
  DtCreate: string;
  DtAlter?: string;
}

// API functions
export const contasApi = {
  list: (params?: { 
    skip?: number; 
    limit?: number;
    cod_empresa?: number;
    ativas_apenas?: boolean;
  }): Promise<AxiosResponse<ContaResponse[]>> =>
    apiClient.get('/contas', { params }),
  
  get: (id: number): Promise<AxiosResponse<ContaResponse>> =>
    apiClient.get(`/contas/${id}`),
  
  create: (data: ContaCreate): Promise<AxiosResponse<ContaResponse>> =>
    apiClient.post('/contas', data),
  
  update: (id: number, data: ContaUpdate): Promise<AxiosResponse<ContaResponse>> =>
    apiClient.put(`/contas/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/contas/${id}`),
};