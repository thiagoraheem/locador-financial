import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Layout } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';
import { LoginPage } from './features/auth/pages/LoginPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { LancamentosPage } from './features/lancamentos/pages/LancamentosPage';
import { CategoriasPage } from './features/categorias/pages/CategoriasPage';
import { ContasPagarPage } from './features/contas-pagar/pages/ContasPagarPage';
import { ContasReceberPage } from './features/contas-receber/pages/ContasReceberPage';

function App() {
  const { ready } = useTranslation();

  if (!ready) {
    return <div>Carregando...</div>;
  }

  return (
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
        <Route path="contas-pagar" element={<ContasPagarPage />} />
        <Route path="contas-receber" element={<ContasReceberPage />} />
      </Route>

      {/* Redirecionamento padrão */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;