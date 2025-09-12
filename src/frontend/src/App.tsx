import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Layout } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';
import { ThemeProvider } from './components/theme-provider';
import { TestComponents } from './components/test-components';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { NotificationContainer } from './components/ui/Notification';
import { Loading } from './components/ui/Loading';
import { useUI } from './hooks/useUI';
import { useSelector, useDispatch } from 'react-redux';
import { selectNotifications, removeNotification } from './store/slices/uiSlice';
import { LoginPage } from './features/auth/pages/LoginPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { LancamentosPage } from './features/lancamentos/pages/LancamentosPage';
import { CategoriasPage } from './features/categorias/pages/CategoriasPage';
import { ContasPagarPage } from './features/contas-pagar/pages/ContasPagarPage';
import { ContasReceberPage } from './features/contas-receber/pages/ContasReceberPage';
import { EmpresasPage } from './features/empresas/pages/EmpresasPage';
import { BancosPage } from './features/bancos/pages/BancosPage';
import { ContasPage } from './features/contas/pages/ContasPage';
import { ClientesPage } from './features/clientes/pages/ClientesPage';

function App() {
  const { ready } = useTranslation();

  if (!ready) {
    return <Loading fullScreen text="Carregando aplicação..." />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AppContent />

      </ThemeProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { globalLoading } = useUI();
  const notifications = useSelector(selectNotifications);
  const dispatch = useDispatch();

  const handleCloseNotification = (id: string) => {
    dispatch(removeNotification(id));
  };

  return (
    <>
      {globalLoading && <Loading fullScreen text="Processando..." />}
      <Routes>
      {/* Rota pública de login */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Rotas protegidas */}
      <Route path="/" element={
        <AuthGuard>
          <Layout />
        </AuthGuard>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="lancamentos" element={<LancamentosPage />} />
        <Route path="categorias" element={<CategoriasPage />} />
        <Route path="empresas" element={<EmpresasPage />} />
        <Route path="bancos" element={<BancosPage />} />
        <Route path="contas" element={<ContasPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="contas-pagar" element={<ContasPagarPage />} />
        <Route path="contas-receber" element={<ContasReceberPage />} />
      </Route>

      {/* Rota de teste dos componentes ShadCN */}
      <Route path="/test-components" element={<TestComponents />} />

      {/* Redirecionamento padrão */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <NotificationContainer 
        notifications={notifications} 
        onClose={handleCloseNotification} 
      />
    </>
  );
}

export default App;