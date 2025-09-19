import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/store';
import { LoginPage } from './LoginPage';
import { authApi } from '../../../services/api';

// Mock da API de autenticação
jest.mock('../../../services/api', () => ({
  authApi: {
    login: jest.fn()
  }
}));

const mockAuthApi = authApi as jest.Mocked<typeof authApi>;

// Mock do i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
}));

// Mock do react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  test('renders login form elements', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/usuário é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid credentials', async () => {
    const mockLoginResponse = {
      data: {
        access_token: 'fake-token',
        token_type: 'Bearer',
        expires_in: 3600,
        user_info: {
          cod_funcionario: 1,
          nome: 'Test User',
          login: 'testuser',
          is_active: true,
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };

    mockAuthApi.login.mockResolvedValue(mockLoginResponse);

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText(/usuário/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuthApi.login).toHaveBeenCalledWith({
        login: 'testuser',
        senha: 'password123',
      });
    });
  });

  test('shows error message on login failure', async () => {
    const mockError = new Error('Credenciais inválidas');

    mockAuthApi.login.mockRejectedValue(mockError);

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText(/usuário/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await userEvent.type(usernameInput, 'wronguser');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/erro ao fazer login/i)).toBeInTheDocument();
    });
  });
});