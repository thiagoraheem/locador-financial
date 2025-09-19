import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Download,
  Plus,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { lancamentosDoDiaUtils } from '@/services/lancamentosDoDiaApi';

interface LancamentosDoDiaAcoesProps {
  totalSelecionados: number;
  valorTotalSelecionados: number;
  onConfirmarPagamentos: () => void;
  onExportarExcel: () => void;
  onNovoLancamento: () => void;
  onNovaContaPagar: () => void;
  onNovaContaReceber: () => void;
  onNovaTransferencia: () => void;
  loading?: boolean;
}

export const LancamentosDoDiaAcoes: React.FC<LancamentosDoDiaAcoesProps> = ({
  totalSelecionados,
  valorTotalSelecionados,
  onConfirmarPagamentos,
  onExportarExcel,
  onNovoLancamento,
  onNovaContaPagar,
  onNovaContaReceber,
  onNovaTransferencia,
  loading = false
}) => {
  return (
    <div className="space-y-4">
      {/* Ações de Seleção */}
      {totalSelecionados > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Ações em Lote
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {totalSelecionados} lançamento(s) selecionado(s)
                </p>
                <p className="text-sm text-muted-foreground">
                  Valor total: {lancamentosDoDiaUtils.formatarValor(Math.abs(valorTotalSelecionados))}
                </p>
              </div>
              <Badge 
                variant={valorTotalSelecionados >= 0 ? 'default' : 'destructive'}
                className={cn(
                  valorTotalSelecionados >= 0 
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                )}
              >
                {valorTotalSelecionados >= 0 ? 'Entrada' : 'Saída'}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={onConfirmarPagamentos}
                disabled={loading}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar Pagamentos
              </Button>
              <Button
                variant="outline"
                onClick={onExportarExcel}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Novo Lançamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={onNovoLancamento}
              disabled={loading}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Lançamento</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={onNovaContaPagar}
              disabled={loading}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <ArrowDownCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">Conta a Pagar</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={onNovaContaReceber}
              disabled={loading}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <ArrowUpCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Conta a Receber</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={onNovaTransferencia}
              disabled={loading}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <CreditCard className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Transferência</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LancamentosDoDiaAcoes;