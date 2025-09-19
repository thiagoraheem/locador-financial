import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { server } from '../setupTests';
import { rest } from 'msw';
import App from '../App';
import contasPagarReducer from '../store/slices/contasPagarSlice';
import authReducer from '../store/slices/authSlice';

// Mock data
const mockUser = {
  id: 1,
  email: 'user@test.com',
  name: 'Test User',
  token: 'mock-jwt-token'
};

const mockContasPagar = [
  {
    id: 1,
    descricao: 'Conta de Luz',
    valor: 150.00,
    vencimento: '2024-01-20',
    status: 'pendente',
    favorecido: 'Empresa de Energia'
  },
  {
    id: 2,
    descricao: 'Aluguel',
    valor: 1200.00,
    vencimento: '2024-01-15',
    status: 'pago',
    favorecido: 'Imobiliária XYZ'
  }
];

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; initialState?: any }> = ({ 
  children, 
  initialState = {} 
}) => {
  const store = configureStore({
    reducer: {
      contasPagar: contasPagarReducer,
      auth: authReducer
    },
    preloadedState: initialState
  });

  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

describe('User Flows - Fluxos Completos de Usuário', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Fluxo de Autenticação', () => {
    it('deve realizar login completo com sucesso', async () => {
      // Arrange
      server.use(
        rest.post('/api/auth/login', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              user: mockUser,
              token: mockUser.token
            })
          );
        })
      );

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Act - Navegar para login
      const loginButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(loginButton);

      // Preencher formulário de login
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /fazer login/i });

      await user.type(emailInput, mockUser.email);
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/bem-vindo/i)).toBeInTheDocument();
        expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      });

      // Verificar se o token foi salvo
      expect(localStorage.getItem('authToken')).toBe(mockUser.token);
    });

    it('deve exibir erro de login com credenciais inválidas', async () => {
      // Arrange
      server.use(
        rest.post('/api/auth/login', (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({ message: 'Credenciais inválidas' })
          );
        })
      );

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Act
      const loginButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(loginButton);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /fazer login/i });

      await user.type(emailInput, 'wrong@email.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
      });
    });

    it('deve realizar logout com sucesso', async () => {
      // Arrange - Usuário já logado
      const initialState = {
        auth: {
          user: mockUser,
          token: mockUser.token,
          isAuthenticated: true,
          loading: false,
          error: null
        }
      };

      localStorage.setItem('authToken', mockUser.token);

      render(
        <TestWrapper initialState={initialState}>
          <App />
        </TestWrapper>
      );

      // Act
      const userMenu = screen.getByText(mockUser.name);
      await user.click(userMenu);

      const logoutButton = screen.getByRole('button', { name: /sair/i });
      await user.click(logoutButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      });

      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });

  describe('Fluxo de Gerenciamento de Contas a Pagar', () => {
    const authenticatedState = {
      auth: {
        user: mockUser,
        token: mockUser.token,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    };

    beforeEach(() => {
      localStorage.setItem('authToken', mockUser.token);
      
      // Mock das APIs
      server.use(
        rest.get('/api/contas-pagar', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              items: mockContasPagar,
              total: mockContasPagar.length
            })
          );
        })
      );
    });

    it('deve listar contas a pagar ao acessar a página', async () => {
      // Arrange & Act
      render(
        <TestWrapper initialState={authenticatedState}>
          <App />
        </TestWrapper>
      );

      // Navegar para contas a pagar
      const contasMenu = screen.getByText(/contas a pagar/i);
      await user.click(contasMenu);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Conta de Luz')).toBeInTheDocument();
        expect(screen.getByText('Aluguel')).toBeInTheDocument();
        expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 1.200,00')).toBeInTheDocument();
      });
    });

    it('deve criar nova conta a pagar com sucesso', async () => {
      // Arrange
      const newConta = {
        id: 3,
        descricao: 'Internet',
        valor: 89.90,
        vencimento: '2024-02-01',
        status: 'pendente',
        favorecido: 'Provedor Internet'
      };

      server.use(
        rest.post('/api/contas-pagar', (req, res, ctx) => {
          return res(
            ctx.status(201),
            ctx.json(newConta)
          );
        })
      );

      render(
        <TestWrapper initialState={authenticatedState}>
          <App />
        </TestWrapper>
      );

      // Act - Navegar e abrir formulário
      const contasMenu = screen.getByText(/contas a pagar/i);
      await user.click(contasMenu);

      await waitFor(() => {
        expect(screen.getByText('Conta de Luz')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /nova conta/i });
      await user.click(addButton);

      // Preencher formulário
      const descricaoInput = screen.getByLabelText(/descrição/i);
      const valorInput = screen.getByLabelText(/valor/i);
      const vencimentoInput = screen.getByLabelText(/vencimento/i);
      const favorecidoInput = screen.getByLabelText(/favorecido/i);
      const saveButton = screen.getByRole('button', { name: /salvar/i });

      await user.type(descricaoInput, newConta.descricao);
      await user.type(valorInput, newConta.valor.toString());
      await user.type(vencimentoInput, newConta.vencimento);
      await user.type(favorecidoInput, newConta.favorecido);
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Internet')).toBeInTheDocument();
        expect(screen.getByText('R$ 89,90')).toBeInTheDocument();
        expect(screen.getByText(/conta criada com sucesso/i)).toBeInTheDocument();
      });
    });

    it('deve editar conta existente com sucesso', async () => {
      // Arrange
      const updatedConta = {
        ...mockContasPagar[0],
        descricao: 'Conta de Luz - Atualizada',
        valor: 175.00
      };

      server.use(
        rest.put('/api/contas-pagar/1', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json(updatedConta)
          );
        })
      );

      render(
        <TestWrapper initialState={authenticatedState}>
          <App />
        </TestWrapper>
      );

      // Act
      const contasMenu = screen.getByText(/contas a pagar/i);
      await user.click(contasMenu);

      await waitFor(() => {
        expect(screen.getByText('Conta de Luz')).toBeInTheDocument();
      });

      // Encontrar e clicar no botão de editar da primeira conta
      const contaRow = screen.getByText('Conta de Luz').closest('tr');
      const editButton = within(contaRow!).getByRole('button', { name: /editar/i });
      await user.click(editButton);

      // Editar campos
      const descricaoInput = screen.getByDisplayValue('Conta de Luz');
      const valorInput = screen.getByDisplayValue('150');
      
      await user.clear(descricaoInput);
      await user.type(descricaoInput, 'Conta de Luz - Atualizada');
      await user.clear(valorInput);
      await user.type(valorInput, '175.00');

      const saveButton = screen.getByRole('button', { name: /salvar/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Conta de Luz - Atualizada')).toBeInTheDocument();
        expect(screen.getByText('R$ 175,00')).toBeInTheDocument();
        expect(screen.getByText(/conta atualizada com sucesso/i)).toBeInTheDocument();
      });
    });

    it('deve marcar conta como paga', async () => {
      // Arrange
      server.use(
        rest.patch('/api/contas-pagar/1/pay', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({ ...mockContasPagar[0], status: 'pago' })
          );
        })
      );

      render(
        <TestWrapper initialState={authenticatedState}>
          <App />
        </TestWrapper>
      );

      // Act
      const contasMenu = screen.getByText(/contas a pagar/i);
      await user.click(contasMenu);

      await waitFor(() => {
        expect(screen.getByText('Conta de Luz')).toBeInTheDocument();
      });

      const contaRow = screen.getByText('Conta de Luz').closest('tr');
      const payButton = within(contaRow!).getByRole('button', { name: /pagar/i });
      await user.click(payButton);

      // Confirmar pagamento
      const confirmButton = screen.getByRole('button', { name: /confirmar pagamento/i });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/pago/i)).toBeInTheDocument();
        expect(screen.getByText(/conta paga com sucesso/i)).toBeInTheDocument();
      });
    });

    it('deve excluir conta com confirmação', async () => {
      // Arrange
      server.use(
        rest.delete('/api/contas-pagar/1', (req, res, ctx) => {
          return res(ctx.status(204));
        })
      );

      render(
        <TestWrapper initialState={authenticatedState}>
          <App />
        </TestWrapper>
      );

      // Act
      const contasMenu = screen.getByText(/contas a pagar/i);
      await user.click(contasMenu);

      await waitFor(() => {
        expect(screen.getByText('Conta de Luz')).toBeInTheDocument();
      });

      const contaRow = screen.getByText('Conta de Luz').closest('tr');
      const deleteButton = within(contaRow!).getByRole('button', { name: /excluir/i });
      await user.click(deleteButton);

      // Confirmar exclusão
      const confirmButton = screen.getByRole('button', { name: /confirmar exclusão/i });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Conta de Luz')).not.toBeInTheDocument();
        expect(screen.getByText(/conta excluída com sucesso/i)).toBeInTheDocument();
      });
    });

    it('deve filtrar contas por status', async () => {
      // Arrange & Act
      render(
        <TestWrapper initialState={authenticatedState}>
          <App />
        </TestWrapper>
      );

      const contasMenu = screen.getByText(/contas a pagar/i);
      await user.click(contasMenu);

      await waitFor(() => {
        expect(screen.getByText('Conta de Luz')).toBeInTheDocument();
        expect(screen.getByText('Aluguel')).toBeInTheDocument();
      });

      // Filtrar por status 'pendente'
      const statusFilter = screen.getByLabelText(/status/i);
      await user.selectOptions(statusFilter, 'pendente');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Conta de Luz')).toBeInTheDocument();
        expect(screen.queryByText('Aluguel')).not.toBeInTheDocument();
      });
    });

    it('deve pesquisar contas por descrição', async () => {
      // Arrange & Act
      render(
        <TestWrapper initialState={authenticatedState}>
          <App />
        </TestWrapper>
      );

      const contasMenu = screen.getByText(/contas a pagar/i);
      await user.click(contasMenu);

      await waitFor(() => {
        expect(screen.getByText('Conta de Luz')).toBeInTheDocument();
        expect(screen.getByText('Aluguel')).toBeInTheDocument();
      });

      // Pesquisar por 'Luz'
      const searchInput = screen.getByPlaceholderText(/pesquisar/i);
      await user.type(searchInput, 'Luz');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Conta de Luz')).toBeInTheDocument();
        expect(screen.queryByText('Aluguel')).not.toBeInTheDocument();
      });
    });
  });

  describe('Fluxo de Navegação e UX', () => {
    const authenticatedState = {
      auth: {
        user: mockUser,
        token: mockUser.token,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    };

    it('deve navegar entre páginas usando menu', async () => {
      // Arrange
      render(
        <TestWrapper initialState={authenticatedState}>
          <App />
        </TestWrapper>
      );

      // Act & Assert - Dashboard
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();

      // Navegar para Contas a Pagar
      const contasMenu = screen.getByText(/contas a pagar/i);
      await user.click(contasMenu);
      
      await waitFor(() => {
        expect(screen.getByText(/lista de contas/i)).toBeInTheDocument();
      });

      // Navegar para Relatórios
      const relatoriosMenu = screen.getByText(/relatórios/i);
      await user.click(relatoriosMenu);
      
      await waitFor(() => {
        expect(screen.getByText(/relatórios financeiros/i)).toBeInTheDocument();
      });
    });

    it('deve exibir breadcrumbs corretos', async () => {
      // Arrange
      render(
        <TestWrapper initialState={authenticatedState}>
          <App />
        </TestWrapper>
      );

      // Act
      const contasMenu = screen.getByText(/contas a pagar/i);
      await user.click(contasMenu);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/home/i)).toBeInTheDocument();
        expect(screen.getByText(/contas a pagar/i)).toBeInTheDocument();
      });
    });

    it('deve manter estado da aplicação durante navegação', async () => {
      // Arrange
      render(
        <TestWrapper initialState={authenticatedState}>
          <App />
        </TestWrapper>
      );

      // Act - Aplicar filtro
      const contasMenu = screen.getByText(/contas a pagar/i);
      await user.click(contasMenu);

      await waitFor(() => {
        expect(screen.getByText('Conta de Luz')).toBeInTheDocument();
      });

      const statusFilter = screen.getByLabelText(/status/i);
      await user.selectOptions(statusFilter, 'pendente');

      // Navegar para outra página e voltar
      const dashboardMenu = screen.getByText(/dashboard/i);
      await user.click(dashboardMenu);
      
      await user.click(contasMenu);

      // Assert - Filtro deve ser mantido
      await waitFor(() => {
        expect(statusFilter).toHaveValue('pendente');
      });
    });
  });

  describe('Fluxo de Tratamento de Erros', () => {
    const authenticatedState = {
      auth: {
        user: mockUser,
        token: mockUser.token,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    };

    it('deve exibir erro de conexão e permitir retry', async () => {
      // Arrange
      server.use(
        rest.get('/api/contas-pagar', (req, res, ctx) => {
          return res.networkError('Erro de conexão');
        })
      );

      render(
        <TestWrapper initialState={authenticatedState}>
          <App />
        </TestWrapper>
      );

      // Act
      const contasMenu = screen.getByText(/contas a pagar/i);
      await user.click(contasMenu);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/erro de conexão/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
      });

      // Act - Retry
      server.use(
        rest.get('/api/contas-pagar', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({ items: mockContasPagar, total: mockContasPagar.length })
          );
        })
      );

      const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
      await user.click(retryButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Conta de Luz')).toBeInTheDocument();
      });
    });

    it('deve redirecionar para login quando token expirar', async () => {
      // Arrange
      server.use(
        rest.get('/api/contas-pagar', (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({ message: 'Token expirado' })
          );
        })
      );

      render(
        <TestWrapper initialState={authenticatedState}>
          <App />
        </TestWrapper>
      );

      // Act
      const contasMenu = screen.getByText(/contas a pagar/i);
      await user.click(contasMenu);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
        expect(screen.getByText(/sessão expirada/i)).toBeInTheDocument();
      });
    });
  });
});