import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import ContaPagarForm from '../ContaPagarForm';
import { contasPagarSlice } from '../../../store/slices/contasPagarSlice';

// Mock das APIs
jest.mock('../../../services/contasPagarApi', () => ({
  create: jest.fn(),
  update: jest.fn(),
  getAll: jest.fn(),
}));

// Mock store setup
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      contasPagar: contasPagarSlice.reducer,
    },
    preloadedState: {
      contasPagar: {
        items: [],
        loading: false,
        error: null,
        filters: {},
        pagination: { page: 1, limit: 10, total: 0 },
        ...initialState,
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    ),
    store,
  };
};

// Mock do componente ContaPagarForm
const MockContaPagarForm = () => {
  return (
    <div data-testid="conta-pagar-form">
      <h2>Cadastro de Conta a Pagar</h2>
      <form>
        <input data-testid="descricao" placeholder="Descrição" />
        <input data-testid="valor" placeholder="Valor" type="number" />
        <input data-testid="vencimento" placeholder="Vencimento" type="date" />
        <button type="submit" data-testid="submit-btn">Salvar</button>
      </form>
    </div>
  );
};

describe('ContaPagarForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização Básica', () => {
    it('deve renderizar o componente mock corretamente', () => {
      renderWithProviders(<MockContaPagarForm />);
      
      expect(screen.getByTestId('conta-pagar-form')).toBeInTheDocument();
      expect(screen.getByText('Cadastro de Conta a Pagar')).toBeInTheDocument();
      expect(screen.getByTestId('descricao')).toBeInTheDocument();
      expect(screen.getByTestId('valor')).toBeInTheDocument();
      expect(screen.getByTestId('vencimento')).toBeInTheDocument();
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
    });

    it('deve permitir interação com os campos do formulário', () => {
      renderWithProviders(<MockContaPagarForm />);
      
      const descricaoInput = screen.getByTestId('descricao');
      const valorInput = screen.getByTestId('valor');
      const vencimentoInput = screen.getByTestId('vencimento');
      
      fireEvent.change(descricaoInput, { target: { value: 'Conta de Teste' } });
      fireEvent.change(valorInput, { target: { value: '100' } });
      fireEvent.change(vencimentoInput, { target: { value: '2024-03-01' } });
      
      expect(descricaoInput).toHaveValue('Conta de Teste');
      expect(valorInput).toHaveValue(100);
      expect(vencimentoInput).toHaveValue('2024-03-01');
    });

    it('deve permitir clique no botão de submit', () => {
      renderWithProviders(<MockContaPagarForm />);
      
      const submitButton = screen.getByTestId('submit-btn');
      fireEvent.click(submitButton);
      
      // Verifica se o botão ainda está presente após o clique
      expect(submitButton).toBeInTheDocument();
    });
  });

  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  describe('Renderização do Formulário', () => {
    it('deve renderizar todos os campos obrigatórios', () => {
      // Arrange & Act
      renderWithProviders(
        <ContaPagarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Assert
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/valor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/vencimento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/favorecido/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('deve renderizar com dados iniciais quando fornecidos', () => {
      // Arrange
      const initialData = {
        id: 1,
        descricao: 'Conta de Luz',
        valor: 150.00,
        vencimento: '2024-01-20',
        favorecido: 'Empresa de Energia'
      };

      // Act
      renderWithProviders(
        <ContaPagarForm 
          initialData={initialData}
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Assert
      expect(screen.getByDisplayValue('Conta de Luz')).toBeInTheDocument();
      expect(screen.getByDisplayValue('150')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Empresa de Energia')).toBeInTheDocument();
    });
  });

  describe('Validação de Formulário', () => {
    it('deve mostrar erros de validação para campos obrigatórios', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(
        <ContaPagarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Act
      await user.click(screen.getByRole('button', { name: /salvar/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/descrição é obrigatória/i)).toBeInTheDocument();
        expect(screen.getByText(/valor é obrigatório/i)).toBeInTheDocument();
        expect(screen.getByText(/vencimento é obrigatório/i)).toBeInTheDocument();
      });
    });

    it('deve validar formato de valor numérico', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(
        <ContaPagarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Act
      await user.type(screen.getByLabelText(/valor/i), 'abc');
      await user.click(screen.getByRole('button', { name: /salvar/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/valor deve ser um número válido/i)).toBeInTheDocument();
      });
    });

    it('deve validar valor mínimo', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(
        <ContaPagarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Act
      await user.type(screen.getByLabelText(/valor/i), '-10');
      await user.click(screen.getByRole('button', { name: /salvar/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/valor deve ser maior que zero/i)).toBeInTheDocument();
      });
    });
  });

  describe('Submissão do Formulário', () => {
    it('deve submeter formulário com dados válidos', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(
        <ContaPagarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Act
      await user.type(screen.getByLabelText(/descrição/i), 'Nova Conta');
      await user.type(screen.getByLabelText(/valor/i), '100.50');
      await user.type(screen.getByLabelText(/vencimento/i), '2024-02-15');
      await user.type(screen.getByLabelText(/favorecido/i), 'Fornecedor XYZ');
      await user.click(screen.getByRole('button', { name: /salvar/i }));

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          descricao: 'Nova Conta',
          valor: 100.50,
          vencimento: '2024-02-15',
          favorecido: 'Fornecedor XYZ'
        });
      });
    });

    it('deve chamar onCancel quando botão cancelar é clicado', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(
        <ContaPagarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Act
      await user.click(screen.getByRole('button', { name: /cancelar/i }));

      // Assert
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Estados de Loading', () => {
    it('deve mostrar estado de loading durante submissão', async () => {
      // Arrange
      server.use(
        rest.post('/api/contas-pagar', (req, res, ctx) => {
          return res(ctx.delay(1000), ctx.status(201), ctx.json({ id: 1 }));
        })
      );

      const user = userEvent.setup();
      renderWithProviders(
        <ContaPagarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Act
      await user.type(screen.getByLabelText(/descrição/i), 'Teste');
      await user.type(screen.getByLabelText(/valor/i), '100');
      await user.type(screen.getByLabelText(/vencimento/i), '2024-02-15');
      await user.click(screen.getByRole('button', { name: /salvar/i }));

      // Assert
      expect(screen.getByText(/salvando.../i)).toBeInTheDocument();
    });

    it('deve desabilitar botões durante loading', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(
        <ContaPagarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} loading={true} />
      );

      // Assert
      expect(screen.getByRole('button', { name: /salvar/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve exibir mensagem de erro quando submissão falha', async () => {
      // Arrange
      server.use(
        rest.post('/api/contas-pagar', (req, res, ctx) => {
          return res(ctx.status(400), ctx.json({ message: 'Erro de validação' }));
        })
      );

      const user = userEvent.setup();
      renderWithProviders(
        <ContaPagarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Act
      await user.type(screen.getByLabelText(/descrição/i), 'Teste');
      await user.type(screen.getByLabelText(/valor/i), '100');
      await user.type(screen.getByLabelText(/vencimento/i), '2024-02-15');
      await user.click(screen.getByRole('button', { name: /salvar/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/erro de validação/i)).toBeInTheDocument();
      });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels associados aos inputs', () => {
      // Arrange & Act
      renderWithProviders(
        <ContaPagarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Assert
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/valor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/vencimento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/favorecido/i)).toBeInTheDocument();
    });

    it('deve ter foco no primeiro campo ao carregar', () => {
      // Arrange & Act
      renderWithProviders(
        <ContaPagarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} autoFocus />
      );

      // Assert
      expect(screen.getByLabelText(/descrição/i)).toHaveFocus();
    });
  });
});