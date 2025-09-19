import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { LancamentoDoDiaResponse, StatusLancamento, TipoMovimento, LancamentoDoDia } from '@/types/lancamentosDoDia';
import { lancamentosDoDiaUtils } from '@/services/lancamentosDoDiaApi';

interface LancamentosDoDiaTabelaProps {
  lancamentos: LancamentoDoDiaResponse[];
  loading?: boolean;
  onEdit?: (lancamento: LancamentoDoDiaResponse) => void;
  onDelete?: (lancamento: LancamentoDoDiaResponse) => void;
  onView?: (lancamento: LancamentoDoDiaResponse) => void;
  onConfirmar?: (lancamentos: LancamentoDoDiaResponse[]) => void;
  onSelectionChange?: (selectedIds: number[]) => void;
}

type OrdenacaoColuna = 'data' | 'valor' | 'favorecido' | 'categoria' | 'conta' | 'status';
type DirecaoOrdenacao = 'asc' | 'desc';

const ITENS_POR_PAGINA = 20;

export const LancamentosDoDiaTabela: React.FC<LancamentosDoDiaTabelaProps> = ({
  lancamentos,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onConfirmar,
  onSelectionChange
}) => {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensSelecionados, setItensSelecionados] = useState<number[]>([]);
  const [ordenacao, setOrdenacao] = useState<{
    coluna: OrdenacaoColuna;
    direcao: DirecaoOrdenacao;
  }>({ coluna: 'data', direcao: 'desc' });

  // Função para ordenar os dados
  const ordenarLancamentos = (lancamentos: LancamentoDoDiaResponse[]) => {
    return [...lancamentos].sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (ordenacao.coluna) {
        case 'data':
          valorA = new Date(a.Data);
          valorB = new Date(b.Data);
          break;
        case 'valor':
          valorA = a.Valor;
          valorB = b.Valor;
          break;
        case 'favorecido':
          valorA = a.favorecido_nome.toLowerCase();
          valorB = b.favorecido_nome.toLowerCase();
          break;
        case 'categoria':
          valorA = a.categoria_nome.toLowerCase();
          valorB = b.categoria_nome.toLowerCase();
          break;
        case 'conta':
          valorA = (a.conta_nome || '').toLowerCase();
          valorB = (b.conta_nome || '').toLowerCase();
          break;
        case 'status':
          valorA = a.status;
          valorB = b.status;
          break;
        default:
          return 0;
      }

      if (valorA < valorB) {
        return ordenacao.direcao === 'asc' ? -1 : 1;
      }
      if (valorA > valorB) {
        return ordenacao.direcao === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleOrdenacao = (coluna: OrdenacaoColuna) => {
    setOrdenacao(prev => ({
      coluna,
      direcao: prev.coluna === coluna && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelecaoItem = (id: number, selecionado: boolean) => {
    const novaSelecao = selecionado
      ? [...itensSelecionados, id]
      : itensSelecionados.filter(item => item !== id);
    
    setItensSelecionados(novaSelecao);
    onSelectionChange?.(novaSelecao);
  };

  const handleSelecaoTodos = (selecionado: boolean) => {
    const novaSelecao = selecionado
      ? lancamentosOrdenados.slice(indiceInicio, indiceFim).map(l => l.CodLancamento)
      : [];
    
    setItensSelecionados(novaSelecao);
    onSelectionChange?.(novaSelecao);
  };

  const handleConfirmarSelecionados = () => {
    const lancamentosSelecionados = lancamentos.filter(l => 
      itensSelecionados.includes(l.CodLancamento)
    );
    onConfirmar?.(lancamentosSelecionados);
    setItensSelecionados([]);
  };

  const getStatusBadge = (status: string) => {
    const statusNormalizado = status.toLowerCase() === 'confirmado' ? 'confirmado' : 
                             status.toLowerCase() === 'pendente' ? 'pendente' : 'cancelado';
    
    const configs = {
      confirmado: {
        variant: 'default' as const,
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      pendente: {
        variant: 'secondary' as const,
        icon: Clock,
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      cancelado: {
        variant: 'destructive' as const,
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };

    const config = configs[statusNormalizado as StatusLancamento];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={cn('flex items-center gap-1', config.className)}>
        <Icon className="h-3 w-3" />
        {lancamentosDoDiaUtils.formatarStatus(statusNormalizado as StatusLancamento)}
      </Badge>
    );
  };

  const getTipoMovimentoBadge = (tipo: string) => {
    const tipoNormalizado = tipo.toLowerCase() === 'entrada' ? 'entrada' : 'saida';
    return (
      <Badge 
        variant={tipoNormalizado === 'entrada' ? 'default' : 'secondary'}
        className={cn(
          'flex items-center gap-1',
          tipoNormalizado === 'entrada' 
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-red-100 text-red-800 border-red-200'
        )}
      >
        {lancamentosDoDiaUtils.formatarTipoMovimento(tipoNormalizado as TipoMovimento)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-5 w-5 bg-gray-200 animate-pulse rounded" />
            <div className="h-5 w-48 bg-gray-200 animate-pulse rounded" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex space-x-4">
                <div className="h-4 w-4 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-48 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const lancamentosOrdenados = ordenarLancamentos(lancamentos);
  const totalPaginas = Math.ceil(lancamentosOrdenados.length / ITENS_POR_PAGINA);
  const indiceInicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const indiceFim = indiceInicio + ITENS_POR_PAGINA;
  const lancamentosPagina = lancamentosOrdenados.slice(indiceInicio, indiceFim);

  const todosSelecionados = lancamentosPagina.length > 0 && 
    lancamentosPagina.every(l => itensSelecionados.includes(l.CodLancamento));
  const algunsSelecionados = lancamentosPagina.some(l => itensSelecionados.includes(l.CodLancamento));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Lançamentos do Dia
            <Badge variant="outline">
              {lancamentosOrdenados.length} {lancamentosOrdenados.length === 1 ? 'item' : 'itens'}
            </Badge>
          </CardTitle>
          
          {itensSelecionados.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {itensSelecionados.length} selecionado{itensSelecionados.length !== 1 ? 's' : ''}
              </Badge>
              <Button
                size="sm"
                onClick={handleConfirmarSelecionados}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Confirmar Selecionados
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={todosSelecionados}
                    onCheckedChange={handleSelecaoTodos}
                    ref={(el) => {
                      if (el) {
                        const input = el.querySelector('input') as HTMLInputElement;
                        if (input) input.indeterminate = algunsSelecionados && !todosSelecionados;
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="w-20">À Vista</TableHead>
                <TableHead className="w-32">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 font-medium"
                    onClick={() => handleOrdenacao('data')}
                  >
                    Data
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nº Doc</TableHead>
                <TableHead className="min-w-48">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 font-medium"
                    onClick={() => handleOrdenacao('favorecido')}
                  >
                    Favorecido
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Comentário</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 font-medium"
                    onClick={() => handleOrdenacao('categoria')}
                  >
                    Categoria
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 font-medium"
                    onClick={() => handleOrdenacao('conta')}
                  >
                    Conta
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 font-medium"
                    onClick={() => handleOrdenacao('valor')}
                  >
                    Valor
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Forma Pagamento</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 font-medium"
                    onClick={() => handleOrdenacao('status')}
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Tipo Lançamento</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="w-12">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lancamentosPagina.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={16} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Filter className="h-8 w-8 opacity-50" />
                      <p>Nenhum lançamento encontrado</p>
                      <p className="text-sm">Ajuste os filtros ou adicione novos lançamentos</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                lancamentosPagina.map((lancamento) => (
                  <TableRow key={lancamento.CodLancamento} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={itensSelecionados.includes(lancamento.CodLancamento)}
                        onCheckedChange={(checked) => 
                          handleSelecaoItem(lancamento.CodLancamento, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {getTipoMovimentoBadge(lancamento.tipo_movimento)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {lancamentosDoDiaUtils.formatarData(lancamento.Data)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {lancamentosDoDiaUtils.formatarTipoLancamento(lancamento.tipo_lancamento)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {lancamento.NumDocto || '-'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {lancamento.favorecido_nome}
                    </TableCell>
                    <TableCell className="max-w-32 truncate" title={lancamento.Observacao}>
                      {lancamento.Observacao || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {lancamento.categoria_nome}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {lancamento.conta_nome}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={cn(
                        lancamento.tipo_movimento.toLowerCase() === 'entrada' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      )}>
                        {lancamento.tipo_movimento.toLowerCase() === 'saída' && '-'}
                        {lancamentosDoDiaUtils.formatarValor(lancamento.Valor)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {lancamento.forma_pagamento_nome}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(lancamento.status)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {lancamentosDoDiaUtils.formatarTipoLancamento(lancamento.tipo_lancamento)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lancamento.ParcelaAtual && lancamento.QtdParcelas ? (
                        <Badge variant="outline">
                          {lancamento.ParcelaAtual}/{lancamento.QtdParcelas}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {lancamento.empresa_nome}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView?.(lancamento)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit?.(lancamento)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete?.(lancamento)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {indiceInicio + 1} a {Math.min(indiceFim, lancamentosOrdenados.length)} de {lancamentosOrdenados.length} resultados
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                disabled={paginaAtual === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  const pagina = i + 1;
                  return (
                    <Button
                      key={pagina}
                      variant={paginaAtual === pagina ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaginaAtual(pagina)}
                      className="w-8 h-8 p-0"
                    >
                      {pagina}
                    </Button>
                  );
                })}
                {totalPaginas > 5 && (
                  <>
                    <span className="px-2">...</span>
                    <Button
                      variant={paginaAtual === totalPaginas ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPaginaAtual(totalPaginas)}
                      className="w-8 h-8 p-0"
                    >
                      {totalPaginas}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                disabled={paginaAtual === totalPaginas}
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};