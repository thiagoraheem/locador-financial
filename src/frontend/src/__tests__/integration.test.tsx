import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '@/store/slices/authSlice';
import { uiSlice } from '@/store/slices/uiSlice';

// Mock das APIs
jest.mock('@/services/api', () => ({
  authApi: {
    login: jest.fn(),
    me: jest.fn(),
    logout: jest.fn(),
    validate: jest.fn(),
  },
  dashboardApi: {
    getResumo: jest.fn(),
    getFluxoCaixa: jest.fn(),
  },
}));

// Componente simples para teste de integração
const TestComponent: React.FC = () => {
  return (
    <div>
      <h1>Sistema Locador</h1>
      <p>Teste de integração básica</p>
    </div>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = configureStore({
    reducer: {
      auth: authSlice.reducer,
      ui: uiSlice.reducer,
    },
  });

  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

describe('Integração Básica', () => {
  test('renderiza componente simples', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByText('Sistema Locador')).toBeInTheDocument();
    expect(screen.getByText('Teste de integração básica')).toBeInTheDocument();
  });

  test('store Redux funciona corretamente', () => {
    const store = configureStore({
      reducer: {
        auth: authSlice.reducer,
        ui: uiSlice.reducer,
      },
    });

    const initialState = store.getState();
    expect(initialState.auth.isAuthenticated).toBe(false);
    expect(initialState.ui.loading).toBe(false);
  });
});