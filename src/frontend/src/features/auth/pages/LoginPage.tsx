import React, { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  useTheme,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { loginStart, loginSuccess, loginFailure, clearError } from '../../../store/slices/authSlice';
import { authApi } from '../../../services/api';

interface LoginFormData {
  login: string;
  senha: string;
}

const schema = yup.object({
  login: yup.string().required('Campo obrigatório'),
  senha: yup.string().required('Campo obrigatório'),
});

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    // Limpar erros quando o componente for montado
    dispatch(clearError());
  }, [dispatch]);

  // Redirecionar se já estiver autenticado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    dispatch(loginStart());
    
    try {
      const response = await authApi.login({
        login: data.login,
        senha: data.senha,
      });

      dispatch(loginSuccess({
        user: response.data.user_info,
        token: response.data.access_token,
      }));

      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || t('auth.invalid_credentials');
      dispatch(loginFailure(errorMessage));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Left Side - Branding */}
          <Box
            sx={{
              flex: 1,
              textAlign: { xs: 'center', md: 'left' },
              mb: { xs: 4, md: 0 },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 3 }}>
              <AccountBalanceIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Locador Financial
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 300 }}>
                  Sistema de Gestão Financeira
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
              Bem-vindo de volta
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.6 }}>
              Faça login para acessar sua conta
            </Typography>
            
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Acesse sua plataforma de gestão financeira com segurança.
            </Typography>

            {/* Features */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon sx={{ color: 'success.main' }} />
                <Typography variant="body2">Análises</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SecurityIcon sx={{ color: 'info.main' }} />
                <Typography variant="body2">Segurança</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountBalanceIcon sx={{ color: 'primary.main' }} />
                <Typography variant="body2">Gestão Completa</Typography>
              </Box>
            </Box>
          </Box>

          {/* Right Side - Login Form */}
          <Box sx={{ flex: 1, maxWidth: 400, width: '100%' }}>
            <Card
              elevation={8}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Login
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Entre com suas credenciais
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Error Alert */}
                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                {/* Login Form */}
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <TextField
                    {...register('login')}
                    fullWidth
                    label="Usuário"
                    variant="outlined"
                    margin="normal"
                    autoComplete="username"
                    autoFocus
                    error={!!errors.login}
                    helperText={errors.login?.message}
                    disabled={loading}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <TextField
                    {...register('senha')}
                    fullWidth
                    label="Senha"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    autoComplete="current-password"
                    error={!!errors.senha}
                    helperText={errors.senha?.message}
                    disabled={loading}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      },
                    }}
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', fontSize: '0.875rem' }}
                >
                  © 2024 Sistema Locador - Gestão Financeira
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};