import React, { useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Receipt,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../store';
import { 
  fetchFinancialSummary, 
  fetchCashFlow, 
  fetchCategorySummary, 
  fetchOverdueSummary, 
  fetchTopFavorecidos 
} from '../../../store/slices/dashboardSlice';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie
} from 'recharts';

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
  const dispatch = useAppDispatch();
  
  const {
    financialSummary,
    cashFlow,
    revenueCategories,
    expenseCategories,
    topReceitas,
    topDespesas,
    loading
  } = useAppSelector((state) => state.dashboard);

  // Load dashboard data on component mount
  useEffect(() => {
    dispatch(fetchFinancialSummary());
    dispatch(fetchCashFlow(12));
    dispatch(fetchCategorySummary('E'));
    dispatch(fetchCategorySummary('S'));
    dispatch(fetchOverdueSummary());
    dispatch(fetchTopFavorecidos({ tipo: 'E', limit: 5 }));
    dispatch(fetchTopFavorecidos({ tipo: 'S', limit: 5 }));
  }, [dispatch]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Format number
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  // Prepare data for charts
  const cashFlowData = cashFlow ? cashFlow.saldo_mensal.map((item, index) => ({
    name: item.mes_ano,
    saldo: item.saldo,
    entrada: cashFlow.entradas[index]?.valor || 0,
    saida: cashFlow.saidas[index]?.valor || 0
  })) : [];

  const revenueCategoryData = revenueCategories.map((item, index) => ({
    name: item.categoria,
    value: item.valor,
    fill: `hsl(${120 + index * 30}, 70%, 50%)`
  }));

  const expenseCategoryData = expenseCategories.map((item, index) => ({
    name: item.categoria,
    value: item.valor,
    fill: `hsl(${0 + index * 30}, 70%, 50%)`
  }));

  // Comparison data for revenue vs expenses
  const comparisonData = [
    {
      name: 'Receitas',
      valor: financialSummary?.total_receitas || 0,
      fill: '#10b981'
    },
    {
      name: 'Despesas',
      valor: financialSummary?.total_despesas || 0,
      fill: '#ef4444'
    }
  ];

  // Stats data
  const stats = financialSummary ? [
    {
      title: 'Total de Receitas',
      value: formatCurrency(financialSummary.total_receitas),
      icon: <TrendingUp className="h-5 w-5" />,
      color: '#10b981',
    },
    {
      title: 'Total de Despesas',
      value: formatCurrency(financialSummary.total_despesas),
      icon: <TrendingDown className="h-5 w-5" />,
      color: '#ef4444',
    },
    {
      title: 'Saldo Atual',
      value: formatCurrency(financialSummary.saldo),
      icon: <Wallet className="h-5 w-5" />,
      color: financialSummary.saldo >= 0 ? '#10b981' : '#ef4444',
    },
    {
      title: 'Contas a Pagar',
      value: formatNumber(financialSummary.contas_a_pagar),
      icon: <CreditCard className="h-5 w-5" />,
      color: '#f59e0b',
    },
    {
      title: 'Contas a Receber',
      value: formatNumber(financialSummary.contas_a_receber),
      icon: <Receipt className="h-5 w-5" />,
      color: '#3b82f6',
    },
  ] : [];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Financeiro
        </h1>
        <p className="text-gray-600">
          Visão geral das suas finanças
        </p>
      </div>

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
                  <p className="text-gray-500">
                    {loading ? '⏳ Carregando dados...' : '📊 Nenhum dado encontrado'}
                  </p>
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
                  <p className="text-gray-500">
                    {loading ? '⏳ Carregando...' : '📊 Nenhum dado encontrado'}
                  </p>
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
              {topReceitas.length > 0 ? (
                <div className="space-y-3">
                  {topReceitas.map((item, index) => (
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
              {topDespesas.length > 0 ? (
                <div className="space-y-3">
                  {topDespesas.map((item, index) => (
                     <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                       <span className="font-medium text-gray-900">
                         {index + 1}. {item.nome}
                       </span>
                       <span className="font-bold text-red-600">
                         {formatCurrency(item.valor)}
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
  );
};