import { apiClient } from './api';
import { AxiosResponse } from 'axios';

// Types for Dashboard data
export interface FinancialSummary {
  total_receitas: number;
  total_despesas: number;
  saldo: number;
  contas_a_pagar: number;
  contas_a_receber: number;
}

export interface CashFlowData {
  periodo: string;
  entradas: Array<{ mes_ano: string; valor: number }>;
  saidas: Array<{ mes_ano: string; valor: number }>;
  saldo_mensal: Array<{ mes_ano: string; saldo: number }>;
}

export interface CategorySummary {
  categoria: string;
  valor: number;
}

export interface OverdueSummary {
  contas_pagar_vencidas: number;
  contas_receber_vencidas: number;
  contas_receber_inadimplentes: number;
}

export interface TopFavorecido {
  nome: string;
  valor: number;
}

// API functions
export const dashboardApi = {
  getResumo: (): Promise<AxiosResponse<FinancialSummary>> =>
    apiClient.get('/dashboard/resumo'),
  
  getFluxoCaixa: (months?: number): Promise<AxiosResponse<CashFlowData>> =>
    apiClient.get('/dashboard/fluxo-caixa', { params: { months } }),
  
  getCategorias: (tipo: 'E' | 'S'): Promise<AxiosResponse<CategorySummary[]>> =>
    apiClient.get('/dashboard/categorias', { params: { tipo } }),
  
  getVencimentos: (): Promise<AxiosResponse<OverdueSummary>> =>
    apiClient.get('/dashboard/vencimentos'),
  
  getFavorecidos: (tipo: 'E' | 'S', limit?: number): Promise<AxiosResponse<TopFavorecido[]>> =>
    apiClient.get('/dashboard/favorecidos', { params: { tipo, limit } }),
};