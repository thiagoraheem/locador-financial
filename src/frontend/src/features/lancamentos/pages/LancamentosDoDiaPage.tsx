import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  CalendarDays,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Download,
  Plus,
  Filter,
  AlertCircle,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
  FileSpreadsheet,
  CheckCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componentes específicos (serão criados)
import { LancamentosDoDiaFiltros } from '../components/LancamentosDoDiaFiltros';
import { LancamentosDoDiaTabela } from '../components/LancamentosDoDiaTabela';
import { LancamentosDoDiaResumo } from '../components/LancamentosDoDiaResumo';
import { LancamentosDoDiaGrafico } from '../components/LancamentosDoDiaGrafico';
import { LancamentosDoDiaAcoes } from '../components/LancamentosDoDiaAcoes';
import { 
  LancamentosDoDiaBotoes, 
  LancamentosDoDiaAcoesRapidas,
  LancamentosDoDiaEstatisticas 
} from '../components/LancamentosDoDiaBotoes';

// Types e API
import {
  LancamentosDoDiaState,
  LancamentosDoDiaFilter,
  AcaoLancamentosDoDia,
  LancamentoDoDia,
  LancamentoDoDiaResponse,
  FiltrosLancamentosDoDia,
  ResumoLancamentosDoDia,
  GraficoFormasPagamento,
  StatusLancamento,
  TipoMovimento
} from '@/types/lancamentosDoDia';
import { lancamentosDoDiaApi, lancamentosDoDiaUtils } from '@/services/lancamentosDoDiaApi';

export const LancamentosDoDiaPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Estado principal da página
  const [state, setState] = useState<LancamentosDoDiaState>({
    lancamentos: [],
    resumo: null,
    grafico_formas_pagamento: [],
    filtros: {
      data: format(new Date(), 'yyyy-MM-dd')
    },
    filtro_opcoes: {
      favorecidos: [],
      categorias: [],
      contas: [],
      formas_pagamento: [],
      empresas: []
    },
    loading: false,
    error: null,
    data_selecionada: format(new Date(), 'yyyy-MM-dd'),
    lancamentos_selecionados: []
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [confirmandoPagamentos, setConfirmandoPagamentos] = useState(false);
  const [loadingAcoes, setLoadingAcoes] = useState(false);

  // Carrega dados iniciais
  useEffect(() => {
    carregarDados();
    carregarFiltroOpcoes();
  }, []);

  // Recarrega dados quando a data muda
  useEffect(() => {
    if (state.data_selecionada) {
      carregarDados();
    }
  }, [state.data_selecionada]);

  /**
   * Carrega os lançamentos do dia
   */
  const carregarDados = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await lancamentosDoDiaApi.buscarLancamentosDoDia(
        state.data_selecionada,
        state.filtros
      );
      
      const { lancamentos, resumo, grafico_formas_pagamento } = response.data;
      
      setState(prev => ({
        ...prev,
        lancamentos,
        resumo,
        grafico_formas_pagamento,
        loading: false
      }));
      
      toast.success('Dados carregados com sucesso');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao carregar lançamentos';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(errorMessage);
    }
  }, [state.data_selecionada, state.filtros]);

  /**
   * Carrega opções para os filtros
   */
  const carregarFiltroOpcoes = async () => {
    try {
      const response = await lancamentosDoDiaApi.buscarFiltroOpcoes();
      setState(prev => ({
        ...prev,
        filtro_opcoes: response.data
      }));
    } catch (error) {
      console.error('Erro ao carregar opções de filtro:', error);
    }
  };

  /**
   * Aplica filtros
   */
  const aplicarFiltros = (novosFiltros: LancamentosDoDiaFilter) => {
    setState(prev => ({
      ...prev,
      filtros: { ...prev.filtros, ...novosFiltros }
    }));
    // Os dados serão recarregados automaticamente pelo useEffect
  };

  /**
   * Altera a data selecionada
   */
  const alterarData = (novaData: string) => {
    if (lancamentosDoDiaUtils.validarData(novaData)) {
      setState(prev => ({
        ...prev,
        data_selecionada: novaData,
        filtros: { ...prev.filtros, data: novaData },
        lancamentos_selecionados: [] // Limpa seleção ao mudar data
      }));
    }
  };

  /**
   * Gerencia seleção de lançamentos
   */
  const alterarSelecaoLancamento = (lancamentoId: number, selecionado: boolean) => {
    setState(prev => ({
      ...prev,
      lancamentos_selecionados: selecionado
        ? [...prev.lancamentos_selecionados, lancamentoId]
        : prev.lancamentos_selecionados.filter(id => id !== lancamentoId)
    }));
  };

  /**
   * Seleciona/deseleciona todos os lançamentos
   */
  const alterarSelecaoTodos = (selecionarTodos: boolean) => {
    setState(prev => ({
      ...prev,
      lancamentos_selecionados: selecionarTodos
        ? prev.lancamentos.map(l => l.CodLancamento)
        : []
    }));
  };

  /**
   * Confirma pagamentos selecionados
   */
  const confirmarPagamentos = async () => {
    if (state.lancamentos_selecionados.length === 0) {
      toast.warning('Selecione pelo menos um lançamento para confirmar');
      return;
    }

    setConfirmandoPagamentos(true);
    
    try {
      const response = await lancamentosDoDiaApi.confirmarPagamentosMultiplos({
        lancamentos_ids: state.lancamentos_selecionados,
        data_confirmacao: new Date().toISOString().split('T')[0]
      });
      
      const { confirmados, erros, total_confirmados } = response.data;
      
      if (total_confirmados > 0) {
        toast.success(`${total_confirmados} pagamento(s) confirmado(s) com sucesso!`);
      }
      
      if (erros.length > 0) {
        erros.forEach(erro => {
          toast.error(`Erro no lançamento ${erro.lancamento_id}: ${erro.erro}`);
        });
      }
      
      // Recarrega dados e limpa seleção
      await carregarDados();
      setState(prev => ({ ...prev, lancamentos_selecionados: [] }));
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao confirmar pagamentos';
      toast.error(errorMessage);
    } finally {
      setConfirmandoPagamentos(false);
    }
  };

  /**
   * Executa ações da página
   */
  const executarAcao = async (acao: AcaoLancamentosDoDia) => {
    switch (acao) {
      case 'confirmar_pagamentos':
        await confirmarPagamentos();
        break;
      case 'exportar_excel':
        await exportarExcel();
        break;
      case 'novo_lancamento':
      case 'nova_conta_pagar':
      case 'nova_conta_receber':
      case 'nova_transferencia':
        // Implementar navegação ou modal
        toast.info(`Funcionalidade ${acao} será implementada`);
        break;
    }
  };

  /**
   * Exporta dados para Excel
   */
  const exportarExcel = async () => {
    try {
      setLoadingAcoes(true);
      const response = await lancamentosDoDiaApi.exportarExcel({
        data: state.data_selecionada,
        filtros: state.filtros,
        incluir_resumo: true,
        incluir_grafico: true
      });
      
      // Cria download do arquivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lancamentos-${state.data_selecionada}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Arquivo Excel exportado com sucesso!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao exportar Excel';
      toast.error(errorMessage);
    } finally {
      setLoadingAcoes(false);
    }
  };

  /**
   * Handlers para ações da página
   */
  const handleEditarLancamento = (lancamento: any) => {
    toast.info(`Editar lançamento: ${lancamento.favorecido}`);
  };

  const handleExcluirLancamento = (lancamento: any) => {
    toast.info(`Excluir lançamento: ${lancamento.favorecido}`);
  };

  const handleVisualizarLancamento = (lancamento: any) => {
    toast.info(`Visualizar lançamento: ${lancamento.favorecido}`);
  };

  const handleNovoLancamento = () => {
    toast.info('Novo lançamento');
  };

  const handleNovaContaPagar = () => {
    toast.info('Nova conta a pagar');
  };

  const handleNovaContaReceber = () => {
    toast.info('Nova conta a receber');
  };

  const handleNovaTransferencia = () => {
    toast.info('Nova transferência');
  };

  const handleSelectionChange = (selectedIds: number[]) => {
    setState(prev => ({ ...prev, lancamentos_selecionados: selectedIds }));
  };

  // Calcular valor total dos selecionados
  const valorTotalSelecionados = state.lancamentos_selecionados.reduce((total, id) => {
    const lancamento = state.lancamentos.find(l => l.CodLancamento === id);
    if (lancamento) {
      return total + (lancamento.tipo_movimento.toLowerCase() === 'entrada' ? lancamento.Valor : -lancamento.Valor);
    }
    return total;
  }, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-primary" />
            Lançamentos do Dia
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os lançamentos financeiros do dia selecionado
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {format(new Date(state.data_selecionada), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={carregarDados}
            disabled={state.loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros de Pesquisa</CardTitle>
          </CardHeader>
          <CardContent>
            <LancamentosDoDiaFiltros
              filtros={state.filtros}
              opcoes={state.filtro_opcoes}
              onAplicarFiltros={aplicarFiltros}
              onAlterarData={alterarData}
              dataSelecionada={state.data_selecionada}
            />
          </CardContent>
        </Card>
      )}

      {/* Resumo Consolidado */}
      {state.resumo && (
        <LancamentosDoDiaResumo
          resumo={state.resumo}
          loading={state.loading}
        />
      )}

      {/* Botões de Ação */}
      <LancamentosDoDiaBotoes
        onNovoLancamento={handleNovoLancamento}
        onNovaContaPagar={handleNovaContaPagar}
        onNovaContaReceber={handleNovaContaReceber}
        onNovaTransferencia={handleNovaTransferencia}
        onConfirmarPagamentos={confirmarPagamentos}
        onExportarExcel={exportarExcel}
        totalSelecionados={state.lancamentos_selecionados.length}
        valorTotalSelecionados={valorTotalSelecionados}
        loading={loadingAcoes}
      />

      {/* Gráfico e Ações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Formas de Pagamento */}
        <div className="lg:col-span-2">
          <LancamentosDoDiaGrafico
            dados={state.grafico_formas_pagamento}
            loading={state.loading}
          />
        </div>
        
        {/* Ações Rápidas */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LancamentosDoDiaAcoesRapidas
                onNovoLancamento={handleNovoLancamento}
                onNovaContaPagar={handleNovaContaPagar}
                onNovaContaReceber={handleNovaContaReceber}
                onNovaTransferencia={handleNovaTransferencia}
                loading={loadingAcoes}
              />
            </CardContent>
          </Card>

          {/* Estatísticas */}
          {state.resumo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LancamentosDoDiaEstatisticas
                  totalLancamentos={state.resumo.total_lancamentos || state.lancamentos.length}
                  totalConfirmados={state.resumo.total_confirmados || 0}
                  totalPendentes={(state.resumo.total_lancamentos || state.lancamentos.length) - (state.resumo.total_confirmados || 0)}
                  valorTotal={(state.resumo.total_entradas || 0) + (state.resumo.total_saidas || 0)}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Separator />

      {/* Tabela de Lançamentos */}
      <LancamentosDoDiaTabela
        lancamentos={state.lancamentos}
        loading={state.loading}


        onEdit={handleEditarLancamento}
        onDelete={handleExcluirLancamento}
        onView={handleVisualizarLancamento}
        onConfirmar={(lancamentos) => {
          const ids = lancamentos.map(l => l.CodLancamento);
          setState(prev => ({ ...prev, lancamentos_selecionados: ids }));
          confirmarPagamentos();
        }}
        onSelectionChange={handleSelectionChange}
      />

      {/* Rodapé com informações */}
      {state.lancamentos.length > 0 && (
        <div className="flex justify-between items-center text-sm text-muted-foreground pt-4 border-t">
          <span>
            Total de {state.lancamentos.length} lançamento(s) encontrado(s)
          </span>
          {state.lancamentos_selecionados.length > 0 && (
            <span>
              {state.lancamentos_selecionados.length} lançamento(s) selecionado(s)
            </span>
          )}
        </div>
      )}
    </div>
  );
};