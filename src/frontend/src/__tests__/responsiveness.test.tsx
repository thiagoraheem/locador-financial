import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { server } from '../setupTests';
import { rest } from 'msw';
import App from '../App';
import ContasPagarTable from '../components/tables/ContasPagarTable';
import ContaPagarForm from '../components/forms/ContaPagarForm';
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
  },
  {
    id: 3,
    descricao: 'Internet',
    valor: 89.90,
    vencimento: '2024-01-25',
    status: 'pendente',
    favorecido: 'Provedor Internet'
  }
];

// Viewport sizes for testing
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
  largeDesktop: { width: 1440, height: 900 }
};

// Helper function to set viewport size
const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  fireEvent(window, new Event('resize'));
};

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
    preloadedState: {
      auth: {
        user: mockUser,
        token: mockUser.token,
        isAuthenticated: true,
        loading: false,
        error: null
      },
      contasPagar: {
        items: mockContasPagar,
        loading: false,
        error: null,
        filters: {},
        pagination: { page: 1, limit: 10, total: mockContasPagar.length }
      },
      ...initialState
    }
  });

  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

describe('Responsiveness Tests - Testes de Responsividade', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Setup MSW handlers
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

  afterEach(() => {
    // Reset viewport to default
    setViewport(1024, 768);
  });

  describe('Mobile Viewport (375px)', () => {
    beforeEach(() => {
      setViewport(viewports.mobile.width, viewports.mobile.height);
    });

    it('deve exibir menu hambúrguer no mobile', async () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        const hamburgerButton = screen.getByRole('button', { name: /menu/i });
        expect(hamburgerButton).toBeInTheDocument();
        expect(hamburgerButton).toBeVisible();
      });

      // Verificar que o menu principal está oculto
      const mainNav = screen.queryByRole('navigation', { name: /navegação principal/i });
      expect(mainNav).toHaveClass('hidden', 'md:block');
    });

    it('deve abrir e fechar menu lateral no mobile', async () => {
      // Arrange
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Act - Abrir menu
      const hamburgerButton = screen.getByRole('button', { name: /menu/i });
      await user.click(hamburgerButton);

      // Assert - Menu aberto
      await waitFor(() => {
        const sideMenu = screen.getByRole('dialog', { name: /menu lateral/i });
        expect(sideMenu).toBeInTheDocument();
        expect(sideMenu).toBeVisible();
      });

      // Act - Fechar menu
      const closeButton = screen.getByRole('button', { name: /fechar menu/i });
      await user.click(closeButton);

      // Assert - Menu fechado
      await waitFor(() => {
        const sideMenu = screen.queryByRole('dialog', { name: /menu lateral/i });
        expect(sideMenu).not.toBeInTheDocument();
      });
    });

    it('deve exibir tabela em formato de cards no mobile', async () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <ContasPagarTable />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        // Verificar se a tabela tradicional está oculta
        const table = screen.queryByRole('table');
        expect(table).toHaveClass('hidden', 'md:table');

        // Verificar se os cards estão visíveis
        const cardContainer = screen.getByTestId('mobile-cards-container');
        expect(cardContainer).toBeVisible();
        expect(cardContainer).toHaveClass('block', 'md:hidden');

        // Verificar conteúdo dos cards
        expect(screen.getByText('Conta de Luz')).toBeInTheDocument();
        expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
      });
    });

    it('deve empilhar campos do formulário verticalmente no mobile', async () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <ContaPagarForm onSubmit={jest.fn()} onCancel={jest.fn()} />
        </TestWrapper>
      );

      // Assert
      const formContainer = screen.getByTestId('form-container');
      expect(formContainer).toHaveClass('flex-col', 'space-y-4');

      // Verificar que os campos ocupam largura total
      const descricaoInput = screen.getByLabelText(/descrição/i);
      const valorInput = screen.getByLabelText(/valor/i);
      
      expect(descricaoInput.closest('.form-field')).toHaveClass('w-full');
      expect(valorInput.closest('.form-field')).toHaveClass('w-full');
    });

    it('deve ajustar botões para toque no mobile', async () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <ContasPagarTable />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        const actionButtons = screen.getAllByRole('button', { name: /editar|excluir|pagar/i });
        
        actionButtons.forEach(button => {
          // Verificar tamanho mínimo para toque (44px)
          const styles = window.getComputedStyle(button);
          const minHeight = parseInt(styles.minHeight) || parseInt(styles.height);
          expect(minHeight).toBeGreaterThanOrEqual(44);
        });
      });
    });

    it('deve ocultar colunas menos importantes no mobile', async () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <ContasPagarTable />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        // Verificar que colunas secundárias estão ocultas
        const favorecidoHeader = screen.queryByText(/favorecido/i);
        const dataVencimentoHeader = screen.queryByText(/vencimento/i);
        
        if (favorecidoHeader) {
          expect(favorecidoHeader.closest('th')).toHaveClass('hidden', 'md:table-cell');
        }
        
        if (dataVencimentoHeader) {
          expect(dataVencimentoHeader.closest('th')).toHaveClass('hidden', 'lg:table-cell');
        }
      });
    });
  });

  describe('Tablet Viewport (768px)', () => {
    beforeEach(() => {
      setViewport(viewports.tablet.width, viewports.tablet.height);
    });

    it('deve exibir navegação principal no tablet', async () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        const mainNav = screen.getByRole('navigation', { name: /navegação principal/i });
        expect(mainNav).toBeVisible();
        expect(mainNav).toHaveClass('block');

        // Menu hambúrguer deve estar oculto
        const hamburgerButton = screen.queryByRole('button', { name: /menu/i });
        expect(hamburgerButton).toHaveClass('md:hidden');
      });
    });

    it('deve exibir tabela tradicional no tablet', async () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <ContasPagarTable />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeVisible();
        expect(table).toHaveClass('md:table');

        // Cards devem estar ocultos
        const cardContainer = screen.queryByTestId('mobile-cards-container');
        if (cardContainer) {
          expect(cardContainer).toHaveClass('md:hidden');
        }
      });
    });

    it('deve organizar campos do formulário em duas colunas no tablet', async () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <ContaPagarForm onSubmit={jest.fn()} onCancel={jest.fn()} />
        </TestWrapper>
      );

      // Assert
      const formContainer = screen.getByTestId('form-container');
      expect(formContainer).toHaveClass('md:grid', 'md:grid-cols-2', 'md:gap-4');
    });

    it('deve mostrar algumas colunas secundárias no tablet', async () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <ContasPagarTable />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        const favorecidoHeader = screen.queryByText(/favorecido/i);
        if (favorecidoHeader) {
          expect(favorecidoHeader.closest('th')).toHaveClass('md:table-cell');
        }
      });
    });
  });

  describe('Desktop Viewport (1024px+)', () => {
    beforeEach(() => {
      setViewport(viewports.desktop.width, viewports.desktop.height);
    });

    it('deve exibir layout completo no desktop', async () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        // Navegação principal visível
        const mainNav = screen.getByRole('navigation', { name: /navegação principal/i });
        expect(mainNav).toBeVisible();

        // Sidebar visível (se existir)
        const sidebar = screen.queryByRole('complementary', { name: /sidebar/i });
        if (sidebar) {
          expect(sidebar).toBeVisible();
        }

        // Menu hambúrguer oculto
        const hamburgerButton = screen.queryByRole('button', { name: /menu/i });
        if (hamburgerButton) {
          expect(hamburgerButton).toHaveClass('lg:hidden');
        }
      });
    });

    it('deve exibir todas as colunas da tabela no desktop', async () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <ContasPagarTable />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeVisible();

        // Verificar que todas as colunas estão visíveis
        expect(screen.getByText(/descrição/i)).toBeInTheDocument();
        expect(screen.getByText(/valor/i)).toBeInTheDocument();
        expect(screen.getByText(/vencimento/i)).toBeInTheDocument();
        expect(screen.getByText(/favorecido/i)).toBeInTheDocument();
        expect(screen.getByText(/status/i)).toBeInTheDocument();
        expect(screen.getByText(/ações/i)).toBeInTheDocument();
      });
    });

    it('deve organizar formulário em layout otimizado para desktop', async () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <ContaPagarForm onSubmit={jest.fn()} onCancel={jest.fn()} />
        </TestWrapper>
      );

      // Assert
      const formContainer = screen.getByTestId('form-container');
      expect(formContainer).toHaveClass('lg:grid', 'lg:grid-cols-3', 'lg:gap-6');
    });

    it('deve exibir tooltips e informações adicionais no desktop', async () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <ContasPagarTable />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        const infoButtons = screen.getAllByRole('button', { name: /informações/i });
        expect(infoButtons.length).toBeGreaterThan(0);

        // Verificar que tooltips estão habilitados
        infoButtons.forEach(button => {
          expect(button).toHaveAttribute('title');
        });
      });
    });
  });

  describe('Large Desktop Viewport (1440px+)', () => {
    beforeEach(() => {
      setViewport(viewports.largeDesktop.width, viewports.largeDesktop.height);
    });

    it('deve utilizar espaço extra para melhor UX', async () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        const mainContainer = screen.getByTestId('main-container');
        expect(mainContainer).toHaveClass('xl:max-w-7xl', 'xl:mx-auto');
      });
    });

    it('deve exibir mais itens por página em telas grandes', async () => {
      // Arrange & Act
      render(
        <TestWrapper>
          <ContasPagarTable />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        const paginationSelect = screen.getByLabelText(/itens por página/i);
        const options = within(paginationSelect).getAllByRole('option');
        
        // Verificar que opções de mais itens estão disponíveis
        const highValueOptions = options.filter(option => 
          parseInt(option.textContent || '0') >= 50
        );
        expect(highValueOptions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Orientation Changes', () => {
    it('deve adaptar layout quando orientação muda de portrait para landscape', async () => {
      // Arrange - Portrait
      setViewport(375, 667);
      
      render(
        <TestWrapper>
          <ContasPagarTable />
        </TestWrapper>
      );

      // Verificar layout portrait
      await waitFor(() => {
        const cardContainer = screen.queryByTestId('mobile-cards-container');
        if (cardContainer) {
          expect(cardContainer).toBeVisible();
        }
      });

      // Act - Mudar para landscape
      setViewport(667, 375);

      // Assert - Layout deve se adaptar
      await waitFor(() => {
        // Em landscape, pode mostrar mais informações
        const table = screen.queryByRole('table');
        if (table) {
          expect(table).toBeVisible();
        }
      });
    });
  });

  describe('Touch and Hover Interactions', () => {
    it('deve ajustar interações para dispositivos touch', async () => {
      // Arrange - Mobile viewport
      setViewport(viewports.mobile.width, viewports.mobile.height);
      
      render(
        <TestWrapper>
          <ContasPagarTable />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        const actionButtons = screen.getAllByRole('button');
        
        actionButtons.forEach(button => {
          // Verificar que não há hover states em dispositivos touch
          expect(button).not.toHaveClass('hover:bg-gray-100');
          
          // Verificar estados de focus para acessibilidade
          expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
        });
      });
    });

    it('deve manter hover states em dispositivos desktop', async () => {
      // Arrange - Desktop viewport
      setViewport(viewports.desktop.width, viewports.desktop.height);
      
      render(
        <TestWrapper>
          <ContasPagarTable />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        const tableRows = screen.getAllByRole('row');
        
        tableRows.forEach(row => {
          if (row.getAttribute('data-testid') === 'table-row') {
            expect(row).toHaveClass('hover:bg-gray-50');
          }
        });
      });
    });
  });

  describe('Content Overflow and Scrolling', () => {
    it('deve gerenciar overflow horizontal em telas pequenas', async () => {
      // Arrange
      setViewport(viewports.mobile.width, viewports.mobile.height);
      
      render(
        <TestWrapper>
          <ContasPagarTable />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        const tableContainer = screen.getByTestId('table-container');
        expect(tableContainer).toHaveClass('overflow-x-auto');
      });
    });

    it('deve truncar texto longo em células da tabela', async () => {
      // Arrange
      const longDescriptionData = [
        {
          ...mockContasPagar[0],
          descricao: 'Esta é uma descrição muito longa que deve ser truncada em telas pequenas para manter a legibilidade'
        }
      ];

      render(
        <TestWrapper initialState={{
          contasPagar: {
            items: longDescriptionData,
            loading: false,
            error: null,
            filters: {},
            pagination: { page: 1, limit: 10, total: 1 }
          }
        }}>
          <ContasPagarTable />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        const descriptionCell = screen.getByText(/Esta é uma descrição muito longa/i);
        expect(descriptionCell).toHaveClass('truncate', 'max-w-xs');
      });
    });
  });

  describe('Performance on Different Viewports', () => {
    it('deve renderizar rapidamente em dispositivos móveis', async () => {
      // Arrange
      setViewport(viewports.mobile.width, viewports.mobile.height);
      const startTime = performance.now();

      // Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Renderização deve ser rápida (menos de 1 segundo)
      expect(renderTime).toBeLessThan(1000);
    });

    it('deve lazy load componentes pesados em telas pequenas', async () => {
      // Arrange
      setViewport(viewports.mobile.width, viewports.mobile.height);
      
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Assert - Componentes não críticos não devem estar carregados
      await waitFor(() => {
        const heavyComponents = screen.queryAllByTestId('heavy-component');
        expect(heavyComponents).toHaveLength(0);
      });
    });
  });
});