import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { ResumoLancamentosDoDia } from '@/types/lancamentosDoDia';
import { lancamentosDoDiaUtils } from '@/services/lancamentosDoDiaApi';

interface LancamentosDoDiaResumoProps {
  resumo: ResumoLancamentosDoDia;
  loading?: boolean;
}

export const LancamentosDoDiaResumo: React.FC<LancamentosDoDiaResumoProps> = ({
  resumo,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-4 bg-gray-200 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 mb-2 bg-gray-200 animate-pulse rounded" />
              <div className="h-3 w-20 bg-gray-200 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total de Entradas',
      value: resumo.total_entradas,
      icon: ArrowUpCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Receitas do dia',
      trend: resumo.total_entradas > 0 ? 'positive' : 'neutral'
    },
    {
      title: 'Total de Saídas',
      value: resumo.total_saidas,
      icon: ArrowDownCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Despesas do dia',
      trend: resumo.total_saidas > 0 ? 'negative' : 'neutral'
    },
    {
      title: 'Saldo do Dia',
      value: resumo.saldo_dia,
      icon: DollarSign,
      color: resumo.saldo_dia >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: resumo.saldo_dia >= 0 ? 'bg-green-50' : 'bg-red-50',
      borderColor: resumo.saldo_dia >= 0 ? 'border-green-200' : 'border-red-200',
      description: resumo.saldo_dia >= 0 ? 'Saldo positivo' : 'Saldo negativo',
      trend: resumo.saldo_dia >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Valores Pendentes',
      value: resumo.valores_pendentes,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: 'Aguardando confirmação',
      trend: 'warning'
    }
  ];

  const cardsSecundarios = [
    {
      title: 'Confirmados',
      value: resumo.total_confirmados,
      icon: CheckCircle,
      color: 'text-blue-600',
      description: 'Lançamentos confirmados'
    },
    {
      title: 'Total de Lançamentos',
      value: resumo.total_lancamentos,
      icon: FileText,
      color: 'text-gray-600',
      description: 'Todos os lançamentos'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className={cn(
                "transition-all duration-200 hover:shadow-md",
                card.borderColor
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={cn("p-2 rounded-full", card.bgColor)}>
                  <Icon className={cn("h-4 w-4", card.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className={cn("text-2xl font-bold", card.color)}>
                    {lancamentosDoDiaUtils.formatarValor(card.value)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                  {card.trend !== 'neutral' && (
                    <div className="flex items-center gap-1">
                      {card.trend === 'positive' && (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      )}
                      {card.trend === 'negative' && (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      {card.trend === 'warning' && (
                        <Clock className="h-3 w-3 text-orange-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {card.trend === 'positive' && 'Receitas'}
                        {card.trend === 'negative' && 'Despesas'}
                        {card.trend === 'warning' && 'Pendente'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cards Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {cardsSecundarios.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="lg:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Icon className={cn("h-5 w-5", card.color)} />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {card.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="secondary" className="text-sm">
                      {card.value}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Indicadores Adicionais */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa de Confirmação</span>
                <Badge 
                  variant={resumo.total_confirmados === resumo.total_lancamentos ? "default" : "secondary"}
                >
                  {resumo.total_lancamentos > 0 
                    ? Math.round((resumo.total_confirmados / resumo.total_lancamentos) * 100)
                    : 0
                  }%
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    resumo.total_confirmados === resumo.total_lancamentos 
                      ? "bg-green-500" 
                      : "bg-blue-500"
                  )}
                  style={{
                    width: resumo.total_lancamentos > 0 
                      ? `${(resumo.total_confirmados / resumo.total_lancamentos) * 100}%`
                      : '0%'
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {resumo.total_confirmados} de {resumo.total_lancamentos} confirmados
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status Geral */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "p-2 rounded-full",
                resumo.saldo_dia >= 0 ? "bg-green-100" : "bg-red-100"
              )}>
                {resumo.saldo_dia >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Status do Dia
                </p>
                <p className={cn(
                  "text-xs font-medium",
                  resumo.saldo_dia >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {resumo.saldo_dia >= 0 ? 'Positivo' : 'Negativo'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {resumo.valores_pendentes > 0 
                    ? `${lancamentosDoDiaUtils.formatarValor(resumo.valores_pendentes)} pendentes`
                    : 'Todos confirmados'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};