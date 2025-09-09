import { apiClient } from './api';
import { AxiosResponse } from 'axios';

// Types for Contas a Pagar
export interface AccountsPayableBase {
  CodEmpresa: number;
  CodFornecedor: number;
  idConta: number | null;
  CodCategoria: number | null;
  DataEmissao: string;
  DataVencimento: string;
  DataPagamento?: string;
  Valor: number;
  ValorPago?: number;
  Desconto?: number;
  Juros?: number;
  Multa?: number;
  Status: 'A' | 'P' | 'V' | 'C';
  NumeroDocumento?: string;
  NumParcela?: number;
  TotalParcelas?: number;
  Observacao?: string;
  CodigoBarras?: string;
  LinhaDigitavel?: string;
}

export interface AccountsPayableCreate extends AccountsPayableBase {}

export interface AccountsPayableUpdate {
  CodEmpresa?: number;
  CodFornecedor?: number;
  idConta?: number | null;
  CodCategoria?: number | null;
  DataEmissao?: string;
  DataVencimento?: string;
  DataPagamento?: string;
  Valor?: number;
  ValorPago?: number;
  Desconto?: number;
  Juros?: number;
  Multa?: number;
  Status?: 'A' | 'P' | 'V' | 'C';
  NumeroDocumento?: string;
  NumParcela?: number;
  TotalParcelas?: number;
  Observacao?: string;
  CodigoBarras?: string;
  LinhaDigitavel?: string;
}

export interface AccountsPayableResponse extends AccountsPayableBase {
  CodAccountsPayable: number;
  NomUsuario: string;
  DtCreate: string;
  DtAlter?: string;
}

// Payment types
export interface AccountsPayablePaymentBase {
  CodAccountsPayable: number;
  idConta: number | null;
  CodFormaPagto: number | null;
  DataPagamento: string;
  ValorPago: number;
  Desconto?: number;
  Juros?: number;
  Multa?: number;
  NumeroDocumento?: string;
  Observacao?: string;
}

export interface AccountsPayablePaymentCreate extends AccountsPayablePaymentBase {}

export interface AccountsPayablePaymentUpdate {
  idConta?: number | null;
  CodFormaPagto?: number | null;
  DataPagamento?: string;
  ValorPago?: number;
  Desconto?: number;
  Juros?: number;
  Multa?: number;
  NumeroDocumento?: string;
  Observacao?: string;
}

export interface AccountsPayablePaymentResponse extends AccountsPayablePaymentBase {
  CodPayment: number;
  NomUsuario: string;
  DtCreate: string;
  DtAlter?: string;
}

// API functions
export const contasPagarApi = {
  list: (params?: { 
    skip?: number; 
    limit?: number;
    cod_fornecedor?: number;
    cod_empresa?: number;
    status?: 'A' | 'P' | 'V' | 'C';
    data_vencimento_inicio?: string;
    data_vencimento_fim?: string;
    valor_min?: number;
    valor_max?: number;
  }): Promise<AxiosResponse<AccountsPayableResponse[]>> =>
    apiClient.get('/contas-pagar', { params }),
  
  get: (id: number): Promise<AxiosResponse<AccountsPayableResponse>> =>
    apiClient.get(`/contas-pagar/${id}`),
  
  create: (data: AccountsPayableCreate): Promise<AxiosResponse<AccountsPayableResponse>> =>
    apiClient.post('/contas-pagar', data),
  
  update: (id: number, data: AccountsPayableUpdate): Promise<AxiosResponse<AccountsPayableResponse>> =>
    apiClient.put(`/contas-pagar/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/contas-pagar/${id}`),
  
  // Payment functions
  pagar: (id: number, paymentData: AccountsPayablePaymentCreate): Promise<AxiosResponse<AccountsPayableResponse>> =>
    apiClient.post(`/contas-pagar/${id}/pagar`, paymentData),
    
  // Get payments for a specific account
  getPayments: (id: number): Promise<AxiosResponse<AccountsPayablePaymentResponse[]>> =>
    apiClient.get(`/contas-pagar/${id}/pagamentos`),
};