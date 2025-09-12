import React, { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { loginStart, loginSuccess, loginFailure, clearError } from '../../../store/slices/authSlice';
import { authApi } from '../../../services/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Separator } from '../../../components/ui/separator';
import { Loader2, Building2, TrendingUp, Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-8 flex-col md:flex-row">
          {/* Left Side - Branding */}
          <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
            <div className="flex items-center justify-center md:justify-start mb-6">
              <Building2 className="h-12 w-12 text-blue-600 mr-3" />
              <div>
                <h1 className="text-4xl font-bold text-blue-600">
                  Locador Financial
                </h1>
                <p className="text-lg text-gray-600 font-light">
                  Sistema de Gestão Financeira
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-medium mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Faça login para acessar sua conta
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              Acesse sua plataforma de gestão financeira com segurança.
            </p>

            {/* Features */}
            <div className="flex flex-col gap-3 mt-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm">Análises</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Segurança</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Gestão Completa</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 max-w-md w-full">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">Login</CardTitle>
                <CardDescription>
                  Entre com suas credenciais
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Separator className="mb-4" />

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login">Usuário</Label>
                    <Input
                      id="login"
                      {...register('login')}
                      autoComplete="username"
                      autoFocus
                      disabled={loading}
                      className={errors.login ? 'border-red-500' : ''}
                    />
                    {errors.login && (
                      <p className="text-sm text-red-500">{errors.login.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
                    <Input
                      id="senha"
                      type="password"
                      {...register('senha')}
                      autoComplete="current-password"
                      disabled={loading}
                      className={errors.senha ? 'border-red-500' : ''}
                    />
                    {errors.senha && (
                      <p className="text-sm text-red-500">{errors.senha.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>

                <Separator className="my-4" />

                <p className="text-xs text-gray-500 text-center">
                  © 2024 Sistema Locador - Gestão Financeira
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};