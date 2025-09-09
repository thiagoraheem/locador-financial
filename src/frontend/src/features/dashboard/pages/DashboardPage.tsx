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
  Pie,
  Cell
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
  const theme = useTheme();

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
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const {
    financialSummary,
    cashFlow,
    revenueCategories,
    expenseCategories,
    overdueSummary,
    topReceitas,
    topDespesas,
    loading,
    error
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
    color: theme.palette.success.light
  }));

  const expenseCategoryData = expenseCategories.map((item, index) => ({
    name: item.categoria,
    value: item.valor,
    color: theme.palette.error.light
  }));

  // Stats data
  const stats = financialSummary ? [
    {
      title: t('dashboard.total_receitas'),
      value: formatCurrency(financialSummary.total_receitas),
      icon: <TrendingUpIcon />,
      color: theme.palette.success.main,
    },
    {
      title: t('dashboard.total_despesas'),
      value: formatCurrency(financialSummary.total_despesas),
      icon: <TrendingDownIcon />,
      color: theme.palette.error.main,
    },
    {
      title: t('dashboard.saldo_atual'),
      value: formatCurrency(financialSummary.saldo),
      icon: <AccountBalanceIcon />,
      color: theme.palette.info.main,
    },
    {
      title: t('dashboard.contas_pagar'),
      value: formatNumber(financialSummary.contas_a_pagar),
      icon: <PaymentIcon />,
      color: theme.palette.warning.main,
    },
    {
      title: t('dashboard.contas_receber'),
      value: formatNumber(financialSummary.contas_a_receber),
      icon: <RequestQuoteIcon />,
      color: theme.palette.primary.main,
    },
  ] : [];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('dashboard.title')}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {t('dashboard.overview')}
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

      {/* Charts and Additional Info */}
      <Grid container spacing={3}>
        {/* Fluxo de Caixa */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.fluxo_caixa')}
            </Typography>
            {cashFlowData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="saldo" 
                    stroke={theme.palette.info.main} 
                    name={t('dashboard.saldo')} 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="entrada" 
                    stroke={theme.palette.success.main} 
                    name={t('dashboard.entradas')} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="saida" 
                    stroke={theme.palette.error.main} 
                    name={t('dashboard.saidas')} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.grey[50],
                  borderRadius: 1,
                }}
              >
                <Typography variant="body1" color="textSecondary">
                  {loading ? t('messages.loading') : t('messages.no_data')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Últimos Lançamentos */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.ultimos_lancamentos')}
            </Typography>
            {topReceitas.length > 0 || topDespesas.length > 0 ? (
              <Box sx={{ height: 300, overflowY: 'auto' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.success.main }}>
                  {t('dashboard.top_receitas')}
                </Typography>
                {topReceitas.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{item.nome}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(item.valor)}
                    </Typography>
                  </Box>
                ))}
                
                <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, color: theme.palette.error.main }}>
                  {t('dashboard.top_despesas')}
                </Typography>
                {topDespesas.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{item.nome}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(item.valor)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.grey[50],
                  borderRadius: 1,
                }}
              >
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center' }}>
                  {loading ? t('messages.loading') : t('messages.no_data')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};