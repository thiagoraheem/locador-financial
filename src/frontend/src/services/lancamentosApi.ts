import { apiClient, UserInfo } from './api';
import { AxiosResponse } from 'axios';

// Types for Lancamentos
export interface LancamentoBase {
  Data: string;
  DataEmissao: string;
  CodEmpresa: number | null;
  idConta: number | null;
  CodFavorecido: number;
  CodCategoria: number;
  Valor: number;
  IndMov: 'E' | 'S';
  NumDocto: string;
  CodFormaPagto: number;
  FlgFrequencia: 'U' | 'R';
  Observacao: string;
}

export interface LancamentoCreate extends LancamentoBase {}

export interface LancamentoUpdate {
  Data?: string;
  DataEmissao?: string;
  CodEmpresa?: number | null;
  idConta?: number | null;
  CodFavorecido?: number;
  CodCategoria?: number;
  Valor?: number;
  IndMov?: 'E' | 'S';
  NumDocto?: string;
  CodFormaPagto?: number;
  FlgFrequencia?: 'U' | 'R';
  Observacao?: string;
}

export interface LancamentoResponse extends LancamentoBase {
  CodLancamento: number;
  FlgConfirmacao: boolean;
  favorecido_nome?: string;
  categoria_nome?: string;
  forma_pagamento_nome?: string;
  empresa_nome?: string;
  conta_nome?: string;
  NomUsuario: string;
  DtCreate: string;
  DtAlter?: string;
}

export interface LancamentoFilter {
  data_inicio?: string;
  data_fim?: string;
  cod_categoria?: number;
  cod_favorecido?: number;
  cod_empresa?: number;
  id_conta?: number;
  ind_mov?: 'E' | 'S';
  confirmado?: boolean;
  valor_min?: number;
  valor_max?: number;
  num_docto?: string;
  order_by?: 'data_desc' | 'data_asc' | 'valor_desc' | 'valor_asc';
}

export interface LancamentoConfirm {
  confirmar: boolean;
}

// API functions
export const lancamentosApi = {
  list: (params?: LancamentoFilter & { skip?: number; limit?: number }): Promise<AxiosResponse<LancamentoResponse[]>> =>
    apiClient.get('/lancamentos', { params }),
  
  get: (id: number): Promise<AxiosResponse<LancamentoResponse>> =>
    apiClient.get(`/lancamentos/${id}`),
  
  create: (data: LancamentoCreate): Promise<AxiosResponse<LancamentoResponse>> =>
    apiClient.post('/lancamentos', data),
  
  update: (id: number, data: LancamentoUpdate): Promise<AxiosResponse<LancamentoResponse>> =>
    apiClient.put(`/lancamentos/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/lancamentos/${id}`),
  
  confirm: (id: number, confirmar: boolean): Promise<AxiosResponse<LancamentoResponse>> =>
    apiClient.patch(`/lancamentos/${id}/confirmar`, { confirmar }),
};