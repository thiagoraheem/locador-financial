import { apiClient } from './api';
import { LancamentoResponse } from './lancamentosApi';

type Lancamento = LancamentoResponse;

export interface CreateLancamentoRequest {
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria_id: number;
  cliente_id?: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  observacoes?: string;
  recorrente?: boolean;
  tipo_recorrencia?: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  parcelas?: number;
  parcela_atual?: number;
}

export interface UpdateLancamentoRequest extends Partial<CreateLancamentoRequest> {
  id: number;
}

export interface LancamentoListResponse {
  lancamentos: Lancamento[];
  total: number;
  page: number;
  per_page: number;
  resumo?: {
    total_receitas: number;
    total_despesas: number;
    saldo: number;
  };
}

export interface LancamentoFilters {
  page?: number;
  per_page?: number;
  data_inicio?: string;
  data_fim?: string;
  tipo?: 'receita' | 'despesa';
  status?: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  categoria_id?: number;
  cliente_id?: number;
  search?: string;
}

export const lancamentoService = {
  // Listar lançamentos com filtros
  async list(filters?: LancamentoFilters): Promise<LancamentoListResponse> {
    const response = await apiClient.get('/lancamentos', { params: filters });
    return response.data;
  },

  // Buscar lançamento por ID
  async getById(id: number): Promise<Lancamento> {
    const response = await apiClient.get(`/lancamentos/${id}`);
    return response.data;
  },

  // Criar novo lançamento
  async create(data: CreateLancamentoRequest): Promise<Lancamento> {
    const response = await apiClient.post('/lancamentos', data);
    return response.data;
  },

  // Atualizar lançamento
  async update(id: number, data: Partial<CreateLancamentoRequest>): Promise<Lancamento> {
    const response = await apiClient.put(`/lancamentos/${id}`, data);
    return response.data;
  },

  // Deletar lançamento
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/lancamentos/${id}`);
  },

  // Marcar como pago
  async marcarComoPago(id: number, dataPagamento?: string): Promise<Lancamento> {
    const response = await apiClient.patch(`/lancamentos/${id}/pagar`, {
      data_pagamento: dataPagamento || new Date().toISOString().split('T')[0]
    });
    return response.data;
  },

  // Cancelar lançamento
  async cancelar(id: number, motivo?: string): Promise<Lancamento> {
    const response = await apiClient.patch(`/lancamentos/${id}/cancelar`, {
      motivo
    });
    return response.data;
  },

  // Duplicar lançamento
  async duplicar(id: number, novaData?: string): Promise<Lancamento> {
    const response = await apiClient.post(`/lancamentos/${id}/duplicar`, {
      nova_data: novaData
    });
    return response.data;
  },

  // Obter lançamentos por período
  async getPorPeriodo(dataInicio: string, dataFim: string): Promise<LancamentoListResponse> {
    const response = await apiClient.get('/lancamentos/periodo', {
      params: {
        data_inicio: dataInicio,
        data_fim: dataFim
      }
    });
    return response.data;
  },

  // Obter lançamentos vencidos
  async getVencidos(): Promise<Lancamento[]> {
    const response = await apiClient.get('/lancamentos/vencidos');
    return response.data;
  },

  // Obter lançamentos a vencer
  async getAVencer(dias?: number): Promise<Lancamento[]> {
    const response = await apiClient.get('/lancamentos/a-vencer', {
      params: { dias: dias || 30 }
    });
    return response.data;
  },

  // Obter resumo financeiro
  async getResumo(dataInicio?: string, dataFim?: string): Promise<{
    total_receitas: number;
    total_despesas: number;
    saldo: number;
    receitas_pagas: number;
    despesas_pagas: number;
    receitas_pendentes: number;
    despesas_pendentes: number;
  }> {
    const response = await apiClient.get('/lancamentos/resumo', {
      params: {
        data_inicio: dataInicio,
        data_fim: dataFim
      }
    });
    return response.data;
  }
};

export default lancamentoService;