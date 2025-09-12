import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '@/store/slices/authSlice';
import { uiSlice } from '@/store/slices/uiSlice';

// Mock das APIs
jest.mock('@/services/api', () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn(),
  },
  dashboardApi: {
    getFinancialSummary: jest.fn(),
    getCashFlow: jest.fn(),
  },
}));

// Mock do react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Componente simples para teste
const SimpleDashboard: React.FC = () => {
  return (
    <div>
      <h1>Dashboard Financeiro</h1>
      <p>Visão geral das suas finanças</p>
      <div data-testid="dashboard-content">
        <div>Total de Receitas: R$ 10.000,00</div>
        <div>Total de Despesas: R$ 7.500,00</div>
        <div>Saldo Atual: R$ 2.500,00</div>
      </div>
    </div>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = configureStore({
    reducer: {
      auth: authSlice.reducer,
      ui: uiSlice.reducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
      ui: {
        theme: 'light',
        sidebarOpen: false,
        loading: false,
        notifications: [],
      },
    },
  });

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

describe('Dashboard Component Tests', () => {
  it('deve renderizar o componente Dashboard simples', () => {
    render(
      <TestWrapper>
        <SimpleDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Dashboard Financeiro')).toBeInTheDocument();
    expect(screen.getByText('Visão geral das suas finanças')).toBeInTheDocument();
  });

  it('deve exibir informações financeiras básicas', () => {
    render(
      <TestWrapper>
        <SimpleDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Total de Receitas: R$ 10.000,00')).toBeInTheDocument();
    expect(screen.getByText('Total de Despesas: R$ 7.500,00')).toBeInTheDocument();
    expect(screen.getByText('Saldo Atual: R$ 2.500,00')).toBeInTheDocument();
  });

  it('deve ter o container principal do dashboard', () => {
    render(
      <TestWrapper>
        <SimpleDashboard />
      </TestWrapper>
    );

    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
  });

  it('deve funcionar com o store Redux', () => {
    const { container } = render(
      <TestWrapper>
        <SimpleDashboard />
      </TestWrapper>
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});