import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import {
  Filter,
  X,
  Search,
  RotateCcw
} from 'lucide-react';


import {
  LancamentosDoDiaFilter,
  FiltroOpcoes
} from '@/types/lancamentosDoDia';

interface LancamentosDoDiaFiltrosProps {
  filtros: LancamentosDoDiaFilter;
  opcoes: FiltroOpcoes;
  onAplicarFiltros: (filtros: LancamentosDoDiaFilter) => void;
  onAlterarData: (data: string) => void;
  dataSelecionada: string;
}

export const LancamentosDoDiaFiltros: React.FC<LancamentosDoDiaFiltrosProps> = ({
  filtros,
  opcoes,
  onAplicarFiltros,
  onAlterarData,
  dataSelecionada
}) => {
  const [filtrosLocais, setFiltrosLocais] = useState<LancamentosDoDiaFilter>(filtros);


  /**
   * Atualiza filtro local
   */
  const atualizarFiltro = (campo: keyof LancamentosDoDiaFilter, valor: any) => {
    setFiltrosLocais(prev => ({
      ...prev,
      [campo]: valor || undefined
    }));
  };

  /**
   * Aplica os filtros
   */
  const aplicarFiltros = () => {
    onAplicarFiltros(filtrosLocais);
  };

  /**
   * Limpa todos os filtros
   */
  const limparFiltros = () => {
    const filtrosLimpos: LancamentosDoDiaFilter = {
      data: dataSelecionada
    };
    setFiltrosLocais(filtrosLimpos);
    onAplicarFiltros(filtrosLimpos);
  };



  /**
   * Remove um filtro específico
   */
  const removerFiltro = (campo: keyof LancamentosDoDiaFilter) => {
    const novosFiltros = { ...filtrosLocais };
    delete novosFiltros[campo];
    setFiltrosLocais(novosFiltros);
    onAplicarFiltros(novosFiltros);
  };

  /**
   * Conta quantos filtros estão ativos
   */
  const contarFiltrosAtivos = (): number => {
    return Object.keys(filtrosLocais).filter(key => {
      const valor = filtrosLocais[key as keyof LancamentosDoDiaFilter];
      return valor !== undefined && valor !== null && valor !== '';
    }).length - 1; // -1 para não contar a data
  };

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <div className="space-y-6">
      {/* Cabeçalho dos Filtros */}
      {filtrosAtivos > 0 && (
        <div className="flex justify-end">
          <Badge variant="secondary">
            {filtrosAtivos} filtro(s) ativo(s)
          </Badge>
        </div>
      )}

      {/* Filtros Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Valor Mínimo */}
        <div className="space-y-2">
          <Label htmlFor="valor_min">Valor Mínimo</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              R$
            </span>
            <Input
              id="valor_min"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              className="pl-10"
              value={filtrosLocais.valor_min || ''}
              onChange={(e) => atualizarFiltro('valor_min', parseFloat(e.target.value) || undefined)}
            />
          </div>
        </div>

        {/* Valor Máximo */}
        <div className="space-y-2">
          <Label htmlFor="valor_max">Valor Máximo</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              R$
            </span>
            <Input
              id="valor_max"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              className="pl-10"
              value={filtrosLocais.valor_max || ''}
              onChange={(e) => atualizarFiltro('valor_max', parseFloat(e.target.value) || undefined)}
            />
          </div>
        </div>

        {/* Favorecido */}
        <div className="space-y-2">
          <Label htmlFor="favorecido">Favorecido</Label>
          <Select
            value={filtrosLocais.cod_favorecido?.toString() || 'todos'}
            onValueChange={(value) => atualizarFiltro('cod_favorecido', value === 'todos' ? undefined : parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os favorecidos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os favorecidos</SelectItem>
              {opcoes.favorecidos.map((favorecido) => (
                <SelectItem key={favorecido.value} value={favorecido.value.toString()}>
                  {favorecido.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select
            value={filtrosLocais.cod_categoria?.toString() || 'todos'}
            onValueChange={(value) => atualizarFiltro('cod_categoria', value === 'todos' ? undefined : parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as categorias</SelectItem>
              {opcoes.categorias.map((categoria) => (
                <SelectItem key={categoria.value} value={categoria.value.toString()}>
                  {categoria.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtros Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Conta */}
        <div className="space-y-2">
          <Label htmlFor="conta">Conta</Label>
          <Select
            value={filtrosLocais.id_conta?.toString() || 'todos'}
            onValueChange={(value) => atualizarFiltro('id_conta', value === 'todos' ? undefined : parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as contas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as contas</SelectItem>
              {opcoes.contas.map((conta) => (
                <SelectItem key={conta.value} value={conta.value.toString()}>
                  {conta.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Lançamento */}
        <div className="space-y-2">
          <Label htmlFor="tipo_lancamento">Tipo de Lançamento</Label>
          <Select
            value={filtrosLocais.tipo_lancamento || 'todos'}
            onValueChange={(value) => atualizarFiltro('tipo_lancamento', value === 'todos' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="conta_pagar">Conta a Pagar</SelectItem>
              <SelectItem value="conta_receber">Conta a Receber</SelectItem>
              <SelectItem value="transferencia">Transferência</SelectItem>
              <SelectItem value="lancamento_direto">Lançamento Direto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Número do Documento */}
        <div className="space-y-2">
          <Label htmlFor="num_docto">Número do Documento</Label>
          <Input
            id="num_docto"
            placeholder="Ex: 001, NF-123..."
            value={filtrosLocais.num_docto || ''}
            onChange={(e) => atualizarFiltro('num_docto', e.target.value || undefined)}
          />
        </div>

        {/* Forma de Pagamento */}
        <div className="space-y-2">
          <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
          <Select
            value={filtrosLocais.cod_forma_pagto?.toString() || 'todos'}
            onValueChange={(value) => atualizarFiltro('cod_forma_pagto', value === 'todos' ? undefined : parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as formas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as formas</SelectItem>
              {opcoes.formas_pagamento.map((forma) => (
                <SelectItem key={forma.value} value={forma.value.toString()}>
                  {forma.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status de Confirmação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="confirmado">Status</Label>
          <Select
            value={filtrosLocais.confirmado !== undefined ? filtrosLocais.confirmado.toString() : 'todos'}
            onValueChange={(value) => {
              if (value === 'todos') {
                atualizarFiltro('confirmado', undefined);
              } else {
                atualizarFiltro('confirmado', value === 'true');
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="true">Confirmados</SelectItem>
              <SelectItem value="false">Pendentes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtros Ativos */}
      {filtrosAtivos > 0 && (
        <div className="space-y-2">
          <Label>Filtros Ativos:</Label>
          <div className="flex flex-wrap gap-2">
            {filtrosLocais.valor_min && (
              <Badge variant="secondary" className="gap-1">
                Valor mín: R$ {filtrosLocais.valor_min.toFixed(2)}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removerFiltro('valor_min')}
                />
              </Badge>
            )}
            {filtrosLocais.valor_max && (
              <Badge variant="secondary" className="gap-1">
                Valor máx: R$ {filtrosLocais.valor_max.toFixed(2)}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removerFiltro('valor_max')}
                />
              </Badge>
            )}
            {filtrosLocais.cod_favorecido && (
              <Badge variant="secondary" className="gap-1">
                Favorecido selecionado
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removerFiltro('cod_favorecido')}
                />
              </Badge>
            )}
            {filtrosLocais.cod_categoria && (
              <Badge variant="secondary" className="gap-1">
                Categoria selecionada
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removerFiltro('cod_categoria')}
                />
              </Badge>
            )}
            {filtrosLocais.num_docto && (
              <Badge variant="secondary" className="gap-1">
                Doc: {filtrosLocais.num_docto}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removerFiltro('num_docto')}
                />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
        <Button onClick={aplicarFiltros} className="flex-1 sm:flex-none">
          <Search className="mr-2 h-4 w-4" />
          Aplicar Filtros
        </Button>
        <Button
          variant="outline"
          onClick={limparFiltros}
          className="flex-1 sm:flex-none"
          disabled={filtrosAtivos === 0}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
};