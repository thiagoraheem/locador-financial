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
} from '@mui/material';
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
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
          }}
        >
          {/* Logo/Title */}
          <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            Sistema Financeiro
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
            Locador
          </Typography>

          {/* Welcome Message */}
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            {t('auth.welcome')}
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ width: '100%' }}
          >
            <TextField
              {...register('login')}
              margin="normal"
              fullWidth
              label={t('auth.username')}
              autoComplete="username"
              autoFocus
              error={!!errors.login}
              helperText={errors.login?.message}
              disabled={loading}
            />

            <TextField
              {...register('senha')}
              margin="normal"
              fullWidth
              label={t('auth.password')}
              type="password"
              autoComplete="current-password"
              error={!!errors.senha}
              helperText={errors.senha?.message}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Entrando...' : t('auth.login_button')}
            </Button>
          </Box>

          {/* Footer Info */}
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
            © 2024 Sistema Locador - Gestão Financeira
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};