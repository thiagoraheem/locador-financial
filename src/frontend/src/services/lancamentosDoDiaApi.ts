import { apiClient } from './api';
import { AxiosResponse } from 'axios';
import {
  LancamentosDoDiaFilter,
  LancamentosDoDiaApiResponse,
  ConfirmarPagamentosMultiplos,
  ConfirmarPagamentosResponse,
  ExportarExcelParams,
  FiltroOpcoes
} from '@/types/lancamentosDoDia';

// API específica para lançamentos do dia
export const lancamentosDoDiaApi = {
  /**
   * Busca os lançamentos do dia com filtros
   * GET /api/lancamentos/dia
   */
  buscarLancamentosDoDia: (
    data: string,
    filtros?: LancamentosDoDiaFilter
  ): Promise<AxiosResponse<LancamentosDoDiaApiResponse>> => {
    const params = {
      data,
      ...filtros
    };
    return apiClient.get('/lancamentos/dia', { params });
  },

  /**
   * Confirma múltiplos pagamentos
   * POST /api/lancamentos/confirmar-multiplos
   */
  confirmarPagamentosMultiplos: (
    payload: ConfirmarPagamentosMultiplos
  ): Promise<AxiosResponse<ConfirmarPagamentosResponse>> => {
    return apiClient.post('/lancamentos/confirmar-multiplos', payload);
  },

  /**
   * Exporta lançamentos do dia para Excel
   * GET /api/lancamentos/exportar-excel
   */
  exportarExcel: (
    params: ExportarExcelParams
  ): Promise<AxiosResponse<Blob>> => {
    return apiClient.get('/lancamentos/exportar-excel', {
      params,
      responseType: 'blob'
    });
  },

  /**
   * Busca opções para os filtros (favorecidos, categorias, etc.)
   * GET /api/lancamentos/filtro-opcoes
   */
  buscarFiltroOpcoes: (): Promise<AxiosResponse<FiltroOpcoes>> => {
    return apiClient.get('/lancamentos/filtro-opcoes');
  },

  /**
   * Busca resumo rápido do dia sem os lançamentos detalhados
   * GET /api/lancamentos/resumo-dia
   */
  buscarResumoDia: (
    data: string
  ): Promise<AxiosResponse<{ resumo: any; grafico_formas_pagamento: any[] }>> => {
    return apiClient.get('/lancamentos/resumo-dia', {
      params: { data }
    });
  }
};

// Utilitários para formatação e manipulação dos dados
export const lancamentosDoDiaUtils = {
  /**
   * Formata valor monetário
   */
  formatarValor: (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  },

  /**
   * Formata data para exibição
   */
  formatarData: (data: string): string => {
    return new Date(data).toLocaleDateString('pt-BR');
  },

  /**
   * Formata informação da parcela
   */
  formatarParcela: (parcelaAtual?: number, qtdParcelas?: number): string => {
    if (!parcelaAtual || !qtdParcelas || qtdParcelas === 1) {
      return 'À vista';
    }
    return `${parcelaAtual}/${qtdParcelas}`;
  },

  /**
   * Determina se é pagamento à vista
   */
  isAVista: (qtdParcelas?: number): boolean => {
    return !qtdParcelas || qtdParcelas === 1;
  },

  /**
   * Mapeia tipo de movimento para texto
   */
  mapearTipoMovimento: (indMov: 'E' | 'S'): 'Entrada' | 'Saída' => {
    return indMov === 'E' ? 'Entrada' : 'Saída';
  },

  /**
   * Mapeia status de confirmação
   */
  mapearStatus: (flgConfirmacao: boolean): 'Confirmado' | 'Pendente' => {
    return flgConfirmacao ? 'Confirmado' : 'Pendente';
  },

  /**
   * Determina tipo de lançamento baseado nos dados
   */
  determinarTipoLancamento: (
    flgFrequencia: 'U' | 'R',
    indMov: 'E' | 'S',
    qtdParcelas?: number
  ): 'Conta a Pagar' | 'Conta a Receber' | 'Transferência' | 'Lançamento Direto' => {
    // Lógica simplificada - pode ser refinada conforme regras de negócio
    if (indMov === 'S') {
      return qtdParcelas && qtdParcelas > 1 ? 'Conta a Pagar' : 'Lançamento Direto';
    } else {
      return qtdParcelas && qtdParcelas > 1 ? 'Conta a Receber' : 'Lançamento Direto';
    }
  },

  /**
   * Calcula percentual para gráfico
   */
  calcularPercentual: (valor: number, total: number): number => {
    return total > 0 ? Math.round((valor / total) * 100 * 100) / 100 : 0;
  },

  /**
   * Gera cores para o gráfico de pizza
   */
  gerarCoresGrafico: (quantidade: number): string[] => {
    const cores = [
      '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
      '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'
    ];
    return cores.slice(0, quantidade);
  },

  /**
   * Valida se uma data está no formato correto
   */
  validarData: (data: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(data) && !isNaN(Date.parse(data));
  },

  /**
   * Converte data do formato brasileiro para ISO
   */
  converterDataParaISO: (dataBR: string): string => {
    const [dia, mes, ano] = dataBR.split('/');
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  },

  /**
   * Converte data ISO para formato brasileiro
   */
  converterDataParaBR: (dataISO: string): string => {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  },

  /**
   * Formata status para exibição
   */
  formatarStatus: (status: string): string => {
    if (!status) return '';
    const statusMap: Record<string, string> = {
      'confirmado': 'Confirmado',
      'pendente': 'Pendente',
      'cancelado': 'Cancelado'
    };
    return statusMap[status.toLowerCase()] || status;
  },

  /**
   * Formata tipo de movimento para exibição
   */
  formatarTipoMovimento: (tipo: string): string => {
    const tipoMap: Record<string, string> = {
      'entrada': 'Entrada',
      'saida': 'Saída',
      'E': 'Entrada',
      'S': 'Saída'
    };
    return tipoMap[tipo] || tipo;
  },

  /**
   * Formata tipo de lançamento para exibição
   */
  formatarTipoLancamento: (tipo: string): string => {
    const tipoMap: Record<string, string> = {
      'conta_pagar': 'Conta a Pagar',
      'conta_receber': 'Conta a Receber',
      'transferencia': 'Transferência',
      'lancamento_direto': 'Lançamento Direto'
    };
    return tipoMap[tipo] || tipo;
  }
};