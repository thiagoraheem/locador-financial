import React from 'react';
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

  // Dados mockados - em uma implementação real, viriam da API
  const stats = [
    {
      title: t('dashboard.total_receitas'),
      value: 'R$ 45.230,00',
      icon: <TrendingUpIcon />,
      color: theme.palette.success.main,
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: t('dashboard.total_despesas'),
      value: 'R$ 32.150,00',
      icon: <TrendingDownIcon />,
      color: theme.palette.error.main,
      trend: { value: 5.2, isPositive: false },
    },
    {
      title: t('dashboard.saldo_atual'),
      value: 'R$ 13.080,00',
      icon: <AccountBalanceIcon />,
      color: theme.palette.info.main,
      trend: { value: 8.3, isPositive: true },
    },
    {
      title: t('dashboard.contas_pagar'),
      value: 'R$ 8.450,00',
      icon: <PaymentIcon />,
      color: theme.palette.warning.main,
    },
    {
      title: t('dashboard.contas_receber'),
      value: 'R$ 15.200,00',
      icon: <RequestQuoteIcon />,
      color: theme.palette.primary.main,
    },
  ];

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
                Gráfico de Fluxo de Caixa
                <br />
                (A ser implementado)
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Últimos Lançamentos */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.ultimos_lancamentos')}
            </Typography>
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
                Lista dos Últimos
                <br />
                Lançamentos
                <br />
                (A ser implementado)
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};