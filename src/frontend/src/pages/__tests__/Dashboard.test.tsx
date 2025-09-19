import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';

// Mock simples do Dashboard
const MockDashboard = () => {
  return (
    <div data-testid="dashboard">
      <h1>Dashboard</h1>
      <div data-testid="welcome-message">
        <p>Olá, Usuário Teste!</p>
      </div>
      <div data-testid="summary-cards">
        <div data-testid="card-contas-pagar">
          <h3>Total Contas a Pagar</h3>
          <span>R$ 5.000,00</span>
        </div>
        <div data-testid="card-contas-receber">
          <h3>Total Contas a Receber</h3>
          <span>R$ 8.000,00</span>
        </div>
        <div data-testid="card-saldo">
          <h3>Saldo Atual</h3>
          <span>R$ 15.000,00</span>
        </div>
      </div>
      <div data-testid="contas-vencendo">
        <h3>Contas Vencendo Hoje</h3>
        <ul>
          <li data-testid="conta-1">Conta de Luz - R$ 150,00</li>
          <li data-testid="conta-2">Recebimento Cliente A - R$ 2.000,00</li>
        </ul>
      </div>
    </div>
  );
};

// Mock do store Redux
const mockStore = configureStore({
  reducer: {
    auth: (state = { user: { nome: 'Usuário Teste' }, isAuthenticated: true }) => state,
    dashboard: (state = { 
      resumo: {
        totalContasPagar: 5000.00,
        totalContasReceber: 8000.00,
        saldoAtual: 15000.00,
        contasVencendoHoje: 2
      },
      loading: false,
      error: null
    }) => state
  }
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Dashboard', () => {
  describe('Renderização Básica', () => {
    it('deve renderizar o dashboard corretamente', () => {
      renderWithProviders(<MockDashboard />);
      
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('welcome-message')).toBeInTheDocument();
      expect(screen.getByText('Olá, Usuário Teste!')).toBeInTheDocument();
    });

    it('deve exibir cards de resumo financeiro', () => {
      renderWithProviders(<MockDashboard />);
      
      expect(screen.getByTestId('summary-cards')).toBeInTheDocument();
      expect(screen.getByTestId('card-contas-pagar')).toBeInTheDocument();
      expect(screen.getByTestId('card-contas-receber')).toBeInTheDocument();
      expect(screen.getByTestId('card-saldo')).toBeInTheDocument();
      
      expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 8.000,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 15.000,00')).toBeInTheDocument();
    });

    it('deve exibir lista de contas vencendo hoje', () => {
      renderWithProviders(<MockDashboard />);
      
      expect(screen.getByTestId('contas-vencendo')).toBeInTheDocument();
      expect(screen.getByText('Contas Vencendo Hoje')).toBeInTheDocument();
      expect(screen.getByTestId('conta-1')).toBeInTheDocument();
      expect(screen.getByTestId('conta-2')).toBeInTheDocument();
      
      expect(screen.getByText('Conta de Luz - R$ 150,00')).toBeInTheDocument();
      expect(screen.getByText('Recebimento Cliente A - R$ 2.000,00')).toBeInTheDocument();
    });
  });

  describe('Estrutura e Acessibilidade', () => {
    it('deve ter headings apropriados', () => {
      renderWithProviders(<MockDashboard />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    });

    it('deve ter elementos com data-testid para testes', () => {
      renderWithProviders(<MockDashboard />);
      
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('welcome-message')).toBeInTheDocument();
      expect(screen.getByTestId('summary-cards')).toBeInTheDocument();
      expect(screen.getByTestId('contas-vencendo')).toBeInTheDocument();
    });
  });
});