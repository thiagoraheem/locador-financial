import { apiClient } from './api';
import { AxiosResponse } from 'axios';

// Types for Contas a Receber
export interface AccountsReceivableBase {
  CodEmpresa: number;
  CodCliente: number;
  idConta: number | null;
  CodCategoria: number | null;
  DataEmissao: string;
  DataVencimento: string;
  DataRecebimento?: string;
  Valor: number;
  ValorRecebido?: number;
  Desconto?: number;
  Juros?: number;
  Multa?: number;
  Status: 'A' | 'R' | 'V' | 'C';
  NumeroDocumento?: string;
  NumParcela?: number;
  TotalParcelas?: number;
  DiasAtraso?: number;
  FlgProtestado?: boolean;
  DataProtesto?: string;
  Observacao?: string;
  NotaFiscal?: string;
  SerieNF?: string;
}

export interface AccountsReceivableCreate extends AccountsReceivableBase {}

export interface AccountsReceivableUpdate {
  CodEmpresa?: number;
  CodCliente?: number;
  idConta?: number | null;
  CodCategoria?: number | null;
  DataEmissao?: string;
  DataVencimento?: string;
  DataRecebimento?: string;
  Valor?: number;
  ValorRecebido?: number;
  Desconto?: number;
  Juros?: number;
  Multa?: number;
  Status?: 'A' | 'R' | 'V' | 'C';
  NumeroDocumento?: string;
  NumParcela?: number;
  TotalParcelas?: number;
  DiasAtraso?: number;
  FlgProtestado?: boolean;
  DataProtesto?: string;
  Observacao?: string;
  NotaFiscal?: string;
  SerieNF?: string;
}

export interface AccountsReceivableResponse extends AccountsReceivableBase {
  CodAccountsReceivable: number;
  NomUsuario: string;
  DtCreate: string;
  DtAlter?: string;
}

// Payment types
export interface AccountsReceivablePaymentBase {
  CodAccountsReceivable: number;
  idConta: number | null;
  CodFormaPagto: number | null;
  DataRecebimento: string;
  ValorRecebido: number;
  Desconto?: number;
  Juros?: number;
  Multa?: number;
  NumeroDocumento?: string;
  Observacao?: string;
}

export interface AccountsReceivablePaymentCreate extends AccountsReceivablePaymentBase {}

export interface AccountsReceivablePaymentUpdate {
  idConta?: number | null;
  CodFormaPagto?: number | null;
  DataRecebimento?: string;
  ValorRecebido?: number;
  Desconto?: number;
  Juros?: number;
  Multa?: number;
  NumeroDocumento?: string;
  Observacao?: string;
}

export interface AccountsReceivablePaymentResponse extends AccountsReceivablePaymentBase {
  CodPayment: number;
  NomUsuario: string;
  DtCreate: string;
  DtAlter?: string;
}

// API functions
export const contasReceberApi = {
  list: (params?: { 
    skip?: number; 
    limit?: number;
    cod_cliente?: number;
    cod_empresa?: number;
    status?: 'A' | 'R' | 'V' | 'C';
    data_vencimento_inicio?: string;
    data_vencimento_fim?: string;
    valor_min?: number;
    valor_max?: number;
  }): Promise<AxiosResponse<AccountsReceivableResponse[]>> =>
    apiClient.get('/contas-receber', { params }),
  
  get: (id: number): Promise<AxiosResponse<AccountsReceivableResponse>> =>
    apiClient.get(`/contas-receber/${id}`),
  
  create: (data: AccountsReceivableCreate): Promise<AxiosResponse<AccountsReceivableResponse>> =>
    apiClient.post('/contas-receber', data),
  
  update: (id: number, data: AccountsReceivableUpdate): Promise<AxiosResponse<AccountsReceivableResponse>> =>
    apiClient.put(`/contas-receber/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/contas-receber/${id}`),
  
  // Payment functions
  receber: (id: number, paymentData: AccountsReceivablePaymentCreate): Promise<AxiosResponse<AccountsReceivableResponse>> =>
    apiClient.post(`/contas-receber/${id}/receber`, paymentData),
    
  // Get payments for a specific account
  getPayments: (id: number): Promise<AxiosResponse<AccountsReceivablePaymentResponse[]>> =>
    apiClient.get(`/contas-receber/${id}/recebimentos`),
};