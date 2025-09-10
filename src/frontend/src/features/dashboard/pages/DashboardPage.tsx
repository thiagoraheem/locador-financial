import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  RequestQuote as RequestQuoteIcon,
} from '@mui/icons-material';
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
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: color,
              color: 'white',
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {trend.isPositive ? (
                <TrendingUpIcon color="success" fontSize="small" />
              ) : (
                <TrendingDownIcon color="error" fontSize="small" />
              )}
              <Typography
                variant="body2"
                color={trend.isPositive ? 'success.main' : 'error.main'}
                sx={{ ml: 0.5 }}
              >
                {trend.value}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
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
      fill: theme.palette.success.main
    },
    {
      name: 'Despesas',
      valor: financialSummary?.total_despesas || 0,
      fill: theme.palette.error.main
    }
  ];

  // Stats data
  const stats = financialSummary ? [
    {
      title: 'Total de Receitas',
      value: formatCurrency(financialSummary.total_receitas),
      icon: <TrendingUpIcon />,
      color: theme.palette.success.main,
    },
    {
      title: 'Total de Despesas',
      value: formatCurrency(financialSummary.total_despesas),
      icon: <TrendingDownIcon />,
      color: theme.palette.error.main,
    },
    {
      title: 'Saldo Atual',
      value: formatCurrency(financialSummary.saldo),
      icon: <AccountBalanceIcon />,
      color: financialSummary.saldo >= 0 ? theme.palette.success.main : theme.palette.error.main,
    },
    {
      title: 'Contas a Pagar',
      value: formatNumber(financialSummary.contas_a_pagar),
      icon: <PaymentIcon />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Contas a Receber',
      value: formatNumber(financialSummary.contas_a_receber),
      icon: <RequestQuoteIcon />,
      color: theme.palette.primary.main,
    },
  ] : [];

  return (
    <Box sx={{ p: 2 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
          Dashboard Financeiro
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Visão Geral do Sistema Financeiro
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Fluxo de Caixa */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 3, height: 450, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              📈 Fluxo de Caixa (12 meses)
            </Typography>
            {cashFlowData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.grey[300]} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    stroke={theme.palette.text.secondary}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke={theme.palette.text.secondary}
                    tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$').slice(0, -3) + 'k'}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="saldo" 
                    stroke={theme.palette.info.main} 
                    name="Saldo" 
                    strokeWidth={3}
                    dot={{ fill: theme.palette.info.main, strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="entrada" 
                    stroke={theme.palette.success.main} 
                    name="Entradas" 
                    strokeWidth={2}
                    dot={{ fill: theme.palette.success.main, strokeWidth: 2, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="saida" 
                    stroke={theme.palette.error.main} 
                    name="Saídas" 
                    strokeWidth={2}
                    dot={{ fill: theme.palette.error.main, strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  height: 350,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.grey[50],
                  borderRadius: 2,
                  border: `2px dashed ${theme.palette.grey[300]}`
                }}
              >
                <Typography variant="h6" color="textSecondary">
                  {loading ? '⏳ Carregando dados...' : '📊 Nenhum dado encontrado'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Receitas vs Despesas */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 3, height: 450, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              💰 Receitas vs Despesas
            </Typography>
            {comparisonData.length > 0 && comparisonData[0].valor > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.grey[300]} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    stroke={theme.palette.text.secondary}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke={theme.palette.text.secondary}
                    tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$').slice(0, -3) + 'k'}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8
                    }}
                  />
                  <Bar dataKey="valor" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  height: 350,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.grey[50],
                  borderRadius: 2,
                  border: `2px dashed ${theme.palette.grey[300]}`
                }}
              >
                <Typography variant="h6" color="textSecondary">
                  {loading ? '⏳ Carregando dados...' : '📊 Nenhum dado encontrado'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3}>
        {/* Categorias de Receitas */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: 400, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              📊 Receitas por Categoria
            </Typography>
            {revenueCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
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
              <Box
                sx={{
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.grey[50],
                  borderRadius: 2,
                  border: `2px dashed ${theme.palette.grey[300]}`
                }}
              >
                <Typography variant="body1" color="textSecondary">
                  {loading ? '⏳ Carregando...' : '📊 Nenhum dado encontrado'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Categorias de Despesas */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: 400, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              📊 Despesas por Categoria
            </Typography>
            {expenseCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
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
              <Box
                sx={{
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.grey[50],
                  borderRadius: 2,
                  border: `2px dashed ${theme.palette.grey[300]}`
                }}
              >
                <Typography variant="body1" color="textSecondary">
                  {loading ? '⏳ Carregando...' : '📊 Nenhum dado encontrado'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Top Favorecidos Row */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              🏆 Top Favorecidos
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, backgroundColor: theme.palette.success.light + '20', borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: theme.palette.success.main, fontWeight: 'bold' }}>
                    💚 Maiores Receitas
                  </Typography>
                  {topReceitas.length > 0 ? (
                    topReceitas.map((item, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        mb: 1.5,
                        p: 1,
                        backgroundColor: 'white',
                        borderRadius: 1,
                        boxShadow: 1
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {index + 1}. {item.nome}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                          {formatCurrency(item.valor)}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                      Nenhuma receita encontrada
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, backgroundColor: theme.palette.error.light + '20', borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: theme.palette.error.main, fontWeight: 'bold' }}>
                    💸 Maiores Despesas
                  </Typography>
                  {topDespesas.length > 0 ? (
                    topDespesas.map((item, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        mb: 1.5,
                        p: 1,
                        backgroundColor: 'white',
                        borderRadius: 1,
                        boxShadow: 1
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {index + 1}. {item.nome}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>
                          {formatCurrency(item.valor)}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                      Nenhuma despesa encontrada
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};