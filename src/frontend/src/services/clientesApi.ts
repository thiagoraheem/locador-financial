import { apiClient } from './api';
import { AxiosResponse } from 'axios';

// Types for Clientes
export interface ClienteBase {
  DesCliente: string;
  RazaoSocial: string;
  FlgTipoPessoa: 'F' | 'J';
  CPF: string;
  RG: string;
  CNPJ: string;
  IE: string;
  IM: string;
  Endereco: string;
  Bairro: string;
  CEP: string;
  Municipio: string;
  Estado: string;
  Telefone1: string;
  Telefone2: string;
  Email1: string;
  Email2: string;
  FlgLiberado: boolean;
  FlgVIP: boolean;
  FlgAtivo: 'S' | 'N';
  Observacoes: string;
}

export interface ClienteCreate extends ClienteBase {}

export interface ClienteUpdate {
  DesCliente?: string;
  RazaoSocial?: string;
  FlgTipoPessoa?: 'F' | 'J';
  CPF?: string;
  RG?: string;
  CNPJ?: string;
  IE?: string;
  IM?: string;
  Endereco?: string;
  Bairro?: string;
  CEP?: string;
  Municipio?: string;
  Estado?: string;
  Telefone1?: string;
  Telefone2?: string;
  Email1?: string;
  Email2?: string;
  FlgLiberado?: boolean;
  FlgVIP?: boolean;
  FlgAtivo?: 'S' | 'N';
  Observacoes?: string;
}

export interface ClienteResponse extends ClienteBase {
  CodCliente: number;
  NomUsuario: string;
  DtCreate: string;
  DtAlter?: string;
}

// API functions
export const clientesApi = {
  list: (params?: { 
    skip?: number; 
    limit?: number;
    ativos_apenas?: boolean;
    search?: string;
  }): Promise<AxiosResponse<ClienteResponse[]>> =>
    apiClient.get('/clientes', { params }),
  
  get: (id: number): Promise<AxiosResponse<ClienteResponse>> =>
    apiClient.get(`/clientes/${id}`),
  
  create: (data: ClienteCreate): Promise<AxiosResponse<ClienteResponse>> =>
    apiClient.post('/clientes', data),
  
  update: (id: number, data: ClienteUpdate): Promise<AxiosResponse<ClienteResponse>> =>
    apiClient.put(`/clientes/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/clientes/${id}`),
};