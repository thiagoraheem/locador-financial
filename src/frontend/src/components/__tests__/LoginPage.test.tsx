import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { authSlice } from '@/store/slices/authSlice';
import { uiSlice } from '@/store/slices/uiSlice';

// Mock das APIs
jest.mock('@/services/api', () => ({
  authApi: {
    login: jest.fn(),
  },
}));

// Mock do react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock do i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.welcome': 'Bem-vindo ao Sistema Financeiro Locador',
        'auth.username': 'Usuário',
        'auth.password': 'Senha',
        'auth.login_button': 'Entrar',
        'auth.invalid_credentials': 'Usuário ou senha incorretos',
      };
      return translations[key] || key;
    },
  }),
}));

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      ui: uiSlice.reducer,
    },
    preloadedState: initialState,
  });
};

const TestWrapper: React.FC<{ 
  children: React.ReactNode; 
  initialState?: any;
}> = ({ children, initialState = {} }) => {
  const store = createTestStore(initialState);
  
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Locador Financial')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Usuário')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      const errorMessages = screen.getAllByText('Campo obrigatório');
      expect(errorMessages).toHaveLength(2); // One for login, one for senha
    });
  });

  test('submits form with valid data', async () => {
    const mockLogin = require('@/services/api').authApi.login;
    
    mockLogin.mockResolvedValue({
      data: {
        access_token: 'fake-token',
        user_info: {
          cod_funcionario: 1,
          nome: 'Test User',
          login: 'test',
          is_active: true,
        },
      },
    });

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText('Usuário');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    await userEvent.type(usernameInput, 'test');
    await userEvent.type(passwordInput, 'password');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        login: 'test',
        senha: 'password',
      });
    });
  });
});