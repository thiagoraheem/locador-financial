import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  ChevronDown,
  FileText,
  CreditCard,
  Banknote,
  ArrowLeftRight,
  CheckCircle,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LancamentosDoDiaBotoesProps {
  onNovoLancamento?: () => void;
  onNovaContaPagar?: () => void;
  onNovaContaReceber?: () => void;
  onNovaTransferencia?: () => void;
  onConfirmarPagamentos?: () => void;
  onExportarExcel?: () => void;
  totalSelecionados?: number;
  valorTotalSelecionados?: number;
  loading?: boolean;
}

export const LancamentosDoDiaBotoes: React.FC<LancamentosDoDiaBotoesProps> = ({
  onNovoLancamento,
  onNovaContaPagar,
  onNovaContaReceber,
  onNovaTransferencia,
  onConfirmarPagamentos,
  onExportarExcel,
  totalSelecionados = 0,
  valorTotalSelecionados = 0,
  loading = false
}) => {
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      {/* Botões de Ação Principais */}
      <div className="flex flex-wrap gap-2">
        {/* Dropdown para Novos Lançamentos */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2" disabled={loading}>
              <Plus className="h-4 w-4" />
              Novo
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem 
              onClick={onNovoLancamento}
              className="flex items-center gap-2 cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <div className="flex flex-col">
                <span>Novo Lançamento</span>
                <span className="text-xs text-muted-foreground">
                  Lançamento geral
                </span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={onNovaContaPagar}
              className="flex items-center gap-2 cursor-pointer"
            >
              <TrendingDown className="h-4 w-4 text-red-500" />
              <div className="flex flex-col">
                <span>Nova Conta a Pagar</span>
                <span className="text-xs text-muted-foreground">
                  Despesa/Saída
                </span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={onNovaContaReceber}
              className="flex items-center gap-2 cursor-pointer"
            >
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div className="flex flex-col">
                <span>Nova Conta a Receber</span>
                <span className="text-xs text-muted-foreground">
                  Receita/Entrada
                </span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={onNovaTransferencia}
              className="flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeftRight className="h-4 w-4 text-blue-500" />
              <div className="flex flex-col">
                <span>Nova Transferência</span>
                <span className="text-xs text-muted-foreground">
                  Entre contas
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Botão de Confirmar Pagamentos */}
        <Button
          variant="outline"
          onClick={onConfirmarPagamentos}
          disabled={loading || totalSelecionados === 0}
          className={cn(
            "flex items-center gap-2",
            totalSelecionados > 0 && "border-green-500 text-green-700 hover:bg-green-50"
          )}
        >
          <CheckCircle className="h-4 w-4" />
          Confirmar Pagamentos
          {totalSelecionados > 0 && (
            <Badge variant="secondary" className="ml-1">
              {totalSelecionados}
            </Badge>
          )}
        </Button>

        {/* Botão de Exportar Excel */}
        <Button
          variant="outline"
          onClick={onExportarExcel}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Informações de Seleção */}
      {totalSelecionados > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {totalSelecionados} item{totalSelecionados !== 1 ? 'ns' : ''} selecionado{totalSelecionados !== 1 ? 's' : ''}
            </span>
          </div>
          
          {valorTotalSelecionados !== 0 && (
            <>
              <div className="w-px h-4 bg-blue-300" />
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Total: {formatarValor(valorTotalSelecionados)}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Componente adicional para ações rápidas
export const LancamentosDoDiaAcoesRapidas: React.FC<{
  onNovoLancamento?: () => void;
  onNovaContaPagar?: () => void;
  onNovaContaReceber?: () => void;
  onNovaTransferencia?: () => void;
  loading?: boolean;
}> = ({
  onNovoLancamento,
  onNovaContaPagar,
  onNovaContaReceber,
  onNovaTransferencia,
  loading = false
}) => {
  const acoes = [
    {
      titulo: 'Lançamento Geral',
      descricao: 'Criar novo lançamento',
      icon: FileText,
      onClick: onNovoLancamento,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 hover:bg-gray-100'
    },
    {
      titulo: 'Conta a Pagar',
      descricao: 'Nova despesa',
      icon: TrendingDown,
      onClick: onNovaContaPagar,
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100'
    },
    {
      titulo: 'Conta a Receber',
      descricao: 'Nova receita',
      icon: TrendingUp,
      onClick: onNovaContaReceber,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      titulo: 'Transferência',
      descricao: 'Entre contas',
      icon: ArrowLeftRight,
      onClick: onNovaTransferencia,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {acoes.map((acao, index) => {
        const Icon = acao.icon;
        return (
          <Button
            key={index}
            variant="outline"
            onClick={acao.onClick}
            disabled={loading}
            className={cn(
              "h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200",
              acao.bgColor
            )}
          >
            <Icon className={cn("h-6 w-6", acao.color)} />
            <div className="text-center">
              <div className="font-medium text-sm">{acao.titulo}</div>
              <div className="text-xs text-muted-foreground">{acao.descricao}</div>
            </div>
          </Button>
        );
      })}
    </div>
  );
};

// Componente para estatísticas rápidas
export const LancamentosDoDiaEstatisticas: React.FC<{
  totalLancamentos: number;
  totalConfirmados: number;
  totalPendentes: number;
  valorTotal: number;
}> = ({
  totalLancamentos,
  totalConfirmados,
  totalPendentes,
  valorTotal
}) => {
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const estatisticas = [
    {
      label: 'Total de Lançamentos',
      valor: totalLancamentos,
      icon: FileText,
      color: 'text-gray-600'
    },
    {
      label: 'Confirmados',
      valor: totalConfirmados,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'Pendentes',
      valor: totalPendentes,
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground">
      {estatisticas.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4", stat.color)} />
            <span>{stat.label}:</span>
            <Badge variant="outline">{stat.valor}</Badge>
          </div>
        );
      })}
      
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-blue-600" />
        <span>Valor Total:</span>
        <Badge variant="secondary" className="font-medium">
          {formatarValor(valorTotal)}
        </Badge>
      </div>
    </div>
  );
};