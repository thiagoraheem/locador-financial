import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/Loading';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  LineChart,
  Line,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, CreditCard, Receipt } from 'lucide-react';
import { dashboardService, DashboardResumo, FluxoCaixaItem, CategoriaResumo, VencimentoItem, FavorecidoItem } from '@/services/dashboardService';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg text-white"
              style={{ backgroundColor: color }}
            >
              {icon}
            </div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          {trend && (
            <div className="flex items-center space-x-1">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  );
};

export const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<{
    resumo: DashboardResumo | null;
    fluxoCaixa: FluxoCaixaItem[];
    categorias: CategoriaResumo[];
    vencimentos: VencimentoItem[];
    favorecidos: FavorecidoItem[];
  }>({ resumo: null, fluxoCaixa: [], categorias: [], vencimentos: [], favorecidos: [] });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };



  // Prepare data for charts with safe array handling
  const cashFlowData = Array.isArray(dashboardData.fluxoCaixa) 
    ? dashboardData.fluxoCaixa.map((item, index) => ({
        name: item.mes,
        saldo: item.saldo,
        entrada: item.receitas,
        saida: item.despesas
      }))
    : [];

  const revenueCategoryData = Array.isArray(dashboardData.categorias)
    ? dashboardData.categorias
        .filter(item => item.percentual > 0)
        .map((item, index) => ({
          name: item.nome,
          value: item.valor,
          fill: `hsl(${120 + index * 30}, 70%, 50%)`
        }))
    : [];

  const expenseCategoryData = Array.isArray(dashboardData.categorias)
    ? dashboardData.categorias
        .filter(item => item.percentual > 0)
        .map((item, index) => ({
          name: item.nome,
          value: item.valor,
          fill: `hsl(${0 + index * 30}, 70%, 50%)`
        }))
    : [];

  // Comparison data for revenue vs expenses
  const comparisonData = dashboardData.resumo ? [
    {
      name: 'Receitas',
      valor: dashboardData.resumo.receitas,
      fill: '#10b981'
    },
    {
      name: 'Despesas',
      valor: dashboardData.resumo.despesas,
      fill: '#ef4444'
    }
  ] : [];

  // Stats data
  const stats = dashboardData.resumo ? [
    {
      title: 'Total de Receitas',
      value: formatCurrency(dashboardData.resumo.receitas),
      icon: <TrendingUp className="h-5 w-5" />,
      color: '#10b981',
    },
    {
      title: 'Total de Despesas',
      value: formatCurrency(dashboardData.resumo.despesas),
      icon: <TrendingDown className="h-5 w-5" />,
      color: '#ef4444',
    },
    {
      title: 'Saldo Atual',
      value: formatCurrency(dashboardData.resumo.saldo),
      icon: <Wallet className="h-5 w-5" />,
      color: dashboardData.resumo.saldo >= 0 ? '#10b981' : '#ef4444',
    },
    {
      title: 'Receitas Pendentes',
      value: formatCurrency(dashboardData.resumo.receitasPendentes),
      icon: <CreditCard className="h-5 w-5" />,
      color: '#f59e0b',
    },
    {
      title: 'Despesas Pendentes',
      value: formatCurrency(dashboardData.resumo.despesasPendentes),
      icon: <Receipt className="h-5 w-5" />,
      color: '#3b82f6',
    },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando dados...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {!loading && !error && (
      <div className="p-6">

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Cash Flow Chart */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-96">
            <CardHeader>
              <CardTitle>📈 Fluxo de Caixa (12 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              {cashFlowData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="saldo" 
                      stroke="#3b82f6" 
                      name="Saldo" 
                      strokeWidth={3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="entrada" 
                      stroke="#10b981" 
                      name="Entradas" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="saida" 
                      stroke="#ef4444" 
                      name="Saídas" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  {loading ? (
                    <Loading size="sm" text="Carregando dados..." />
                  ) : (
                    <p className="text-gray-500">📊 Nenhum dado encontrado</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue vs Expenses */}
        <div>
          <Card className="p-6 h-96">
            <CardHeader>
              <CardTitle>💰 Receitas vs Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              {comparisonData.length > 0 && comparisonData[0].valor > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="valor" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">
                    {loading ? '⏳ Carregando dados...' : '📊 Nenhum dado encontrado'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Categories */}
        <div>
          <Card className="p-6 h-96">
            <CardHeader>
              <CardTitle>📊 Receitas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={revenueCategoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name }) => name}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  {loading ? (
                    <Loading size="sm" text="Carregando..." />
                  ) : (
                    <p className="text-gray-500">📊 Nenhum dado encontrado</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expense Categories */}
        <div>
          <Card className="p-6 h-96">
            <CardHeader>
              <CardTitle>📊 Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {expenseCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name }) => name}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">
                    {loading ? '⏳ Carregando...' : '📊 Nenhum dado encontrado'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Favorecidos Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card className="p-6">
            <CardHeader>
              <CardTitle>🏆 Top Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(dashboardData.favorecidos) && dashboardData.favorecidos.filter(f => f.valor > 0).length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.favorecidos.filter(f => f.valor > 0).slice(0, 5).map((item, index) => (
                     <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                       <span className="font-medium text-gray-900">
                         {index + 1}. {item.nome}
                       </span>
                       <span className="font-bold text-green-600">
                         {formatCurrency(item.valor)}
                       </span>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma receita encontrada
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="p-6">
            <CardHeader>
              <CardTitle>💸 Top Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(dashboardData.favorecidos) && dashboardData.favorecidos.filter(f => f.valor < 0).length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.favorecidos.filter(f => f.valor < 0).slice(0, 5).map((item, index) => (
                     <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                       <span className="font-medium text-gray-900">
                         {index + 1}. {item.nome}
                       </span>
                       <span className="font-bold text-red-600">
                         {formatCurrency(Math.abs(item.valor))}
                       </span>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma despesa encontrada
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
       )}
    </div>
  );
};