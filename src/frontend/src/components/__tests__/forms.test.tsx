import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '@/store/slices/authSlice';
import { uiSlice } from '@/store/slices/uiSlice';

// Mock simples das APIs
const mockContasPagarApi = {
  create: jest.fn(),
  update: jest.fn(),
  getAll: jest.fn()
};
const mockContasReceberApi = {
  create: jest.fn(),
  update: jest.fn(),
  getAll: jest.fn()
};

// Componente de formulário simples para teste
const SimpleForm: React.FC = () => {
  const [formData, setFormData] = React.useState({
    nome: '',
    email: '',
    valor: '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    if (!formData.valor) newErrors.valor = 'Valor é obrigatório';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Formulário válido
      console.log('Formulário enviado:', formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpa erro quando usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="simple-form">
      <h2>Formulário de Teste</h2>
      
      <div>
        <label htmlFor="nome">Nome:</label>
        <input
          id="nome"
          name="nome"
          type="text"
          value={formData.nome}
          onChange={handleChange}
          data-testid="input-nome"
        />
        {errors.nome && <span data-testid="error-nome">{errors.nome}</span>}
      </div>

      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          data-testid="input-email"
        />
        {errors.email && <span data-testid="error-email">{errors.email}</span>}
      </div>

      <div>
        <label htmlFor="valor">Valor:</label>
        <input
          id="valor"
          name="valor"
          type="number"
          value={formData.valor}
          onChange={handleChange}
          data-testid="input-valor"
        />
        {errors.valor && <span data-testid="error-valor">{errors.valor}</span>}
      </div>

      <button type="submit" data-testid="submit-button">
        Enviar
      </button>
    </form>
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

describe('Form Component Tests', () => {
  it('deve renderizar o formulário corretamente', () => {
    render(
      <TestWrapper>
        <SimpleForm />
      </TestWrapper>
    );

    expect(screen.getByText('Formulário de Teste')).toBeInTheDocument();
    expect(screen.getByTestId('input-nome')).toBeInTheDocument();
    expect(screen.getByTestId('input-email')).toBeInTheDocument();
    expect(screen.getByTestId('input-valor')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('deve permitir digitar nos campos de input', async () => {
    
    render(
      <TestWrapper>
        <SimpleForm />
      </TestWrapper>
    );

    const nomeInput = screen.getByTestId('input-nome');
    const emailInput = screen.getByTestId('input-email');
    const valorInput = screen.getByTestId('input-valor');

    await userEvent.type(nomeInput, 'João Silva');
    await userEvent.type(emailInput, 'joao@email.com');
    await userEvent.type(valorInput, '1000');

    expect(nomeInput).toHaveValue('João Silva');
    expect(emailInput).toHaveValue('joao@email.com');
    expect(valorInput).toHaveValue(1000);
  });

  it('deve mostrar erros de validação quando campos estão vazios', async () => {
    
    render(
      <TestWrapper>
        <SimpleForm />
      </TestWrapper>
    );

    const submitButton = screen.getByTestId('submit-button');
    await userEvent.click(submitButton);

    expect(screen.getByTestId('error-nome')).toHaveTextContent('Nome é obrigatório');
    expect(screen.getByTestId('error-email')).toHaveTextContent('Email é obrigatório');
    expect(screen.getByTestId('error-valor')).toHaveTextContent('Valor é obrigatório');
  });

  it('deve limpar erros quando usuário começa a digitar', async () => {
    
    render(
      <TestWrapper>
        <SimpleForm />
      </TestWrapper>
    );

    // Primeiro, gera os erros
    const submitButton = screen.getByTestId('submit-button');
    await userEvent.click(submitButton);

    expect(screen.getByTestId('error-nome')).toBeInTheDocument();

    // Depois, digita no campo para limpar o erro
    const nomeInput = screen.getByTestId('input-nome');
    await userEvent.type(nomeInput, 'João');

    expect(screen.queryByTestId('error-nome')).not.toBeInTheDocument();
  });

  it('deve funcionar com formulário válido', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(
      <TestWrapper>
        <SimpleForm />
      </TestWrapper>
    );

    // Preenche todos os campos
    await userEvent.type(screen.getByTestId('input-nome'), 'João Silva');
    await userEvent.type(screen.getByTestId('input-email'), 'joao@email.com');
    await userEvent.type(screen.getByTestId('input-valor'), '1000');

    // Submete o formulário
    await userEvent.click(screen.getByTestId('submit-button'));

    // Verifica se não há erros
    expect(screen.queryByTestId('error-nome')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error-email')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error-valor')).not.toBeInTheDocument();

    // Verifica se o console.log foi chamado (simulando envio)
    expect(consoleSpy).toHaveBeenCalledWith('Formulário enviado:', {
      nome: 'João Silva',
      email: 'joao@email.com',
      valor: '1000',
    });

    consoleSpy.mockRestore();
  });
});