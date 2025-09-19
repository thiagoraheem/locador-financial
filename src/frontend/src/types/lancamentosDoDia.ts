// Tipos específicos para a tela de Lançamentos do Dia

// Enum para status de lançamento
export type StatusLancamento = 'confirmado' | 'pendente' | 'cancelado';

// Enum para tipo de movimento
export type TipoMovimento = 'entrada' | 'saida';

// Alias para compatibilidade
export type LancamentoDoDia = LancamentoDoDiaResponse;
export type FiltrosLancamentosDoDia = LancamentosDoDiaFilter;
export type GraficoFormasPagamento = GraficoFormaPagamento[];

// Filtros para lançamentos do dia
export interface LancamentosDoDiaFilter {
  data?: string; // Data específica para consulta
  valor_min?: number;
  valor_max?: number;
  cod_favorecido?: number;
  cod_categoria?: number;
  id_conta?: number;
  tipo_lancamento?: 'conta_pagar' | 'conta_receber' | 'transferencia' | 'lancamento_direto';
  num_docto?: string;
  cod_forma_pagto?: number;
  confirmado?: boolean;
}

// Resposta da API para lançamentos do dia
export interface LancamentoDoDiaResponse {
  CodLancamento: number;
  Data: string;
  DataEmissao: string;
  CodEmpresa: number | null;
  idConta: number | null;
  CodFavorecido: number;
  CodCategoria: number;
  Valor: number;
  IndMov: 'E' | 'S'; // E = Entrada, S = Saída
  NumDocto: string;
  CodFormaPagto: number;
  FlgFrequencia: 'U' | 'R'; // U = Único, R = Recorrente
  Observacao: string;
  FlgConfirmacao: boolean;
  DatConfirmacao?: string;
  ParcelaAtual?: number;
  QtdParcelas?: number;
  
  // Dados relacionados (joins)
  favorecido_nome: string;
  categoria_nome: string;
  forma_pagamento_nome: string;
  empresa_nome?: string;
  conta_nome?: string;
  
  // Metadados
  NomUsuario: string;
  DtCreate: string;
  DtAlter?: string;
  
  // Campos calculados para a tela
  tipo_movimento: 'Entrada' | 'Saída';
  status: 'Confirmado' | 'Pendente';
  tipo_lancamento: 'Conta a Pagar' | 'Conta a Receber' | 'Transferência' | 'Lançamento Direto';
  parcela_info?: string; // Ex: "1/3", "2/5"
  a_vista: boolean; // Se é pagamento à vista ou parcelado
}

// Resumo consolidado dos lançamentos do dia
export interface ResumoLancamentosDoDia {
  total_entradas: number;
  total_saidas: number;
  saldo_dia: number;
  valores_pendentes: number;
  total_confirmados: number;
  total_lancamentos: number;
}

// Dados para o gráfico de pizza de formas de pagamento
export interface GraficoFormaPagamento {
  forma_pagamento: string;
  valor: number;
  quantidade: number;
}

// Resposta da API para lançamentos do dia com resumo
export interface LancamentosDoDiaApiResponse {
  lancamentos: LancamentoDoDiaResponse[];
  resumo: ResumoLancamentosDoDia;
  grafico_formas_pagamento: GraficoFormaPagamento[];
  total: number;
  data_consulta: string;
}

// Payload para confirmação múltipla de pagamentos
export interface ConfirmarPagamentosMultiplos {
  lancamentos_ids: number[];
  data_confirmacao?: string;
}

// Resposta da confirmação múltipla
export interface ConfirmarPagamentosResponse {
  confirmados: number[];
  erros: {
    lancamento_id: number;
    erro: string;
  }[];
  total_confirmados: number;
}

// Parâmetros para exportação Excel
export interface ExportarExcelParams {
  data: string;
  filtros?: LancamentosDoDiaFilter;
  incluir_resumo?: boolean;
  incluir_grafico?: boolean;
}

// Opções de filtro para dropdowns
export interface FiltroOpcoes {
  favorecidos: { value: number; label: string }[];
  categorias: { value: number; label: string }[];
  contas: { value: number; label: string }[];
  formas_pagamento: { value: number; label: string }[];
  empresas: { value: number; label: string }[];
}

// Estado do componente de lançamentos do dia
export interface LancamentosDoDiaState {
  lancamentos: LancamentoDoDiaResponse[];
  resumo: ResumoLancamentosDoDia | null;
  grafico_formas_pagamento: GraficoFormaPagamento[];
  filtros: LancamentosDoDiaFilter;
  filtro_opcoes: FiltroOpcoes;
  loading: boolean;
  error: string | null;
  data_selecionada: string;
  lancamentos_selecionados: number[];
}

// Ações disponíveis na tela
export type AcaoLancamentosDoDia = 
  | 'novo_lancamento'
  | 'nova_conta_pagar'
  | 'nova_conta_receber'
  | 'nova_transferencia'
  | 'confirmar_pagamentos'
  | 'exportar_excel';

// Configuração das colunas da tabela
export interface ColunaTabela {
  key: keyof LancamentoDoDiaResponse | 'acoes';
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: 'currency' | 'date' | 'text' | 'status';
}