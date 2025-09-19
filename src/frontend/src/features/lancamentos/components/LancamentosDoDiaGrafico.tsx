import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

import { GraficoFormaPagamento, GraficoFormasPagamento } from '@/types/lancamentosDoDia';
import { lancamentosDoDiaUtils } from '@/services/lancamentosDoDiaApi';

interface LancamentosDoDiaGraficoProps {
  dados: GraficoFormaPagamento[];
  loading?: boolean;
  className?: string;
}

// Cores para o gráfico de pizza
const CORES_GRAFICO = [
  '#0088FE', // Azul
  '#00C49F', // Verde
  '#FFBB28', // Amarelo
  '#FF8042', // Laranja
  '#8884D8', // Roxo
  '#82CA9D', // Verde claro
  '#FFC658', // Amarelo claro
  '#FF7C7C', // Vermelho claro
  '#8DD1E1', // Azul claro
  '#D084D0'  // Rosa
];

export const LancamentosDoDiaGrafico: React.FC<LancamentosDoDiaGraficoProps> = ({
  dados,
  loading = false
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Distribuição por Formas de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-80 w-full bg-gray-100 animate-pulse rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
              <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dados || dados.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Distribuição por Formas de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <PieChartIcon className="h-12 w-12 mx-auto opacity-50" />
              <p>Nenhum dado disponível</p>
              <p className="text-sm">Adicione lançamentos para visualizar o gráfico</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para o gráfico de pizza
  const dadosPizza = dados.map((item, index) => ({
    ...item,
    cor: CORES_GRAFICO[index % CORES_GRAFICO.length],
    percentual: dados.length > 0 
      ? ((item.valor / dados.reduce((acc, curr) => acc + curr.valor, 0)) * 100).toFixed(1)
      : '0'
  }));

  // Preparar dados para o gráfico de barras
  const dadosBarras = dados.map(item => ({
    forma_pagamento: item.forma_pagamento.length > 15 
      ? `${item.forma_pagamento.substring(0, 15)}...`
      : item.forma_pagamento,
    forma_pagamento_completa: item.forma_pagamento,
    valor: item.valor,
    quantidade: item.quantidade
  }));

  const totalValor = dados.reduce((acc, curr) => acc + curr.valor, 0);
  const totalQuantidade = dados.reduce((acc, curr) => acc + curr.quantidade, 0);

  // Componente customizado para tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.forma_pagamento_completa || data.forma_pagamento}</p>
          <p className="text-sm text-blue-600">
            Valor: {lancamentosDoDiaUtils.formatarValor(data.valor)}
          </p>
          <p className="text-sm text-gray-600">
            Quantidade: {data.quantidade} lançamento{data.quantidade !== 1 ? 's' : ''}
          </p>
          {data.percentual && (
            <p className="text-sm text-green-600">
              Percentual: {data.percentual}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Componente customizado para legenda
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <Badge
            key={index}
            variant="outline"
            className="flex items-center gap-2 px-3 py-1"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs">
              {entry.payload.forma_pagamento} ({entry.payload.percentual}%)
            </span>
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Distribuição por Formas de Pagamento
        </CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total: {lancamentosDoDiaUtils.formatarValor(totalValor)}</span>
          <span>•</span>
          <span>{totalQuantidade} lançamento{totalQuantidade !== 1 ? 's' : ''}</span>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pizza" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pizza" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Pizza
            </TabsTrigger>
            <TabsTrigger value="barras" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Barras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pizza" className="mt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosPizza}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ value, name }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {dadosPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="barras" className="mt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dadosBarras}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="forma_pagamento" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => lancamentosDoDiaUtils.formatarValor(value)}
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="valor" 
                    fill="#0088FE"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Resumo detalhado */}
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Detalhamento</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dados.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: CORES_GRAFICO[index % CORES_GRAFICO.length] }}
                  />
                  <div>
                    <p className="text-sm font-medium">{item.forma_pagamento}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantidade} lançamento{item.quantidade !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {lancamentosDoDiaUtils.formatarValor(item.valor)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((item.valor / totalValor) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};