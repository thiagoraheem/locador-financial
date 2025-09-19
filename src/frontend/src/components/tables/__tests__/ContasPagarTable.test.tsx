import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import ContasPagarTable from '../ContasPagarTable';
import { server } from '../../../setupTests';
import { rest } from 'msw';

// Mock data
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
    status: 'vencido',
    favorecido: 'Provedor Internet'
  }
];

// Mock store setup
const mockStore = configureStore({
  reducer: {
    contasPagar: (state = { 
      items: mockContasPagar, 
      loading: false, 
      error: null,
      filters: {},
      pagination: { page: 1, limit: 10, total: 3 }
    }, action) => state,
    auth: (state = { user: { id: 1, nome: 'Test User' }, token: 'mock-token' }, action) => state
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

describe('ContasPagarTable', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnPay = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização da Tabela', () => {
    it('deve renderizar cabeçalhos da tabela', () => {
      // Arrange & Act
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
        />
      );

      // Assert
      expect(screen.getByText('Descrição')).toBeInTheDocument();
      expect(screen.getByText('Valor')).toBeInTheDocument();
      expect(screen.getByText('Vencimento')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Favorecido')).toBeInTheDocument();
      expect(screen.getByText('Ações')).toBeInTheDocument();
    });

    it('deve renderizar todas as contas fornecidas', () => {
      // Arrange & Act
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
        />
      );

      // Assert
      expect(screen.getByText('Conta de Luz')).toBeInTheDocument();
      expect(screen.getByText('Aluguel')).toBeInTheDocument();
      expect(screen.getByText('Internet')).toBeInTheDocument();
      expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 1.200,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 89,90')).toBeInTheDocument();
    });

    it('deve mostrar mensagem quando não há dados', () => {
      // Arrange & Act
      renderWithProviders(
        <ContasPagarTable 
          data={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
        />
      );

      // Assert
      expect(screen.getByText(/nenhuma conta encontrada/i)).toBeInTheDocument();
    });
  });

  describe('Formatação de Dados', () => {
    it('deve formatar valores monetários corretamente', () => {
      // Arrange & Act
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
        />
      );

      // Assert
      expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 1.200,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 89,90')).toBeInTheDocument();
    });

    it('deve formatar datas corretamente', () => {
      // Arrange & Act
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
        />
      );

      // Assert
      expect(screen.getByText('20/01/2024')).toBeInTheDocument();
      expect(screen.getByText('15/01/2024')).toBeInTheDocument();
      expect(screen.getByText('25/01/2024')).toBeInTheDocument();
    });

    it('deve mostrar status com cores apropriadas', () => {
      // Arrange & Act
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
        />
      );

      // Assert
      const pendenteBadge = screen.getByText('Pendente');
      const pagoBadge = screen.getByText('Pago');
      const vencidoBadge = screen.getByText('Vencido');

      expect(pendenteBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
      expect(pagoBadge).toHaveClass('bg-green-100', 'text-green-800');
      expect(vencidoBadge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  describe('Ações da Tabela', () => {
    it('deve chamar onEdit quando botão editar é clicado', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
        />
      );

      // Act
      const editButtons = screen.getAllByLabelText(/editar/i);
      await user.click(editButtons[0]);

      // Assert
      expect(mockOnEdit).toHaveBeenCalledWith(mockContasPagar[0]);
    });

    it('deve chamar onDelete quando botão excluir é clicado', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
        />
      );

      // Act
      const deleteButtons = screen.getAllByLabelText(/excluir/i);
      await user.click(deleteButtons[0]);

      // Assert
      expect(mockOnDelete).toHaveBeenCalledWith(mockContasPagar[0].id);
    });

    it('deve chamar onPay quando botão pagar é clicado', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
        />
      );

      // Act
      const payButtons = screen.getAllByLabelText(/marcar como pago/i);
      await user.click(payButtons[0]);

      // Assert
      expect(mockOnPay).toHaveBeenCalledWith(mockContasPagar[0].id);
    });

    it('não deve mostrar botão pagar para contas já pagas', () => {
      // Arrange & Act
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
        />
      );

      // Assert
      const payButtons = screen.getAllByLabelText(/marcar como pago/i);
      // Deve ter 2 botões (para pendente e vencido), mas não para o pago
      expect(payButtons).toHaveLength(2);
    });
  });

  describe('Ordenação', () => {
    it('deve permitir ordenação por descrição', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSort = jest.fn();
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
          onSort={mockOnSort}
        />
      );

      // Act
      await user.click(screen.getByText('Descrição'));

      // Assert
      expect(mockOnSort).toHaveBeenCalledWith('descricao', 'asc');
    });

    it('deve permitir ordenação por valor', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSort = jest.fn();
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
          onSort={mockOnSort}
        />
      );

      // Act
      await user.click(screen.getByText('Valor'));

      // Assert
      expect(mockOnSort).toHaveBeenCalledWith('valor', 'asc');
    });

    it('deve alternar direção da ordenação', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSort = jest.fn();
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
          onSort={mockOnSort}
          sortField="descricao"
          sortDirection="asc"
        />
      );

      // Act
      await user.click(screen.getByText('Descrição'));

      // Assert
      expect(mockOnSort).toHaveBeenCalledWith('descricao', 'desc');
    });
  });

  describe('Filtros', () => {
    it('deve aplicar filtro de status', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnFilter = jest.fn();
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
          onFilter={mockOnFilter}
        />
      );

      // Act
      const statusFilter = screen.getByLabelText(/filtrar por status/i);
      await user.selectOptions(statusFilter, 'pendente');

      // Assert
      expect(mockOnFilter).toHaveBeenCalledWith({ status: 'pendente' });
    });

    it('deve aplicar filtro de período', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnFilter = jest.fn();
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
          onFilter={mockOnFilter}
        />
      );

      // Act
      const dataInicioFilter = screen.getByLabelText(/data início/i);
      await user.type(dataInicioFilter, '2024-01-01');

      // Assert
      expect(mockOnFilter).toHaveBeenCalledWith({ dataInicio: '2024-01-01' });
    });
  });

  describe('Paginação', () => {
    it('deve mostrar informações de paginação', () => {
      // Arrange & Act
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
          pagination={{ page: 1, limit: 10, total: 25 }}
        />
      );

      // Assert
      expect(screen.getByText(/mostrando 1-10 de 25 registros/i)).toBeInTheDocument();
    });

    it('deve permitir navegação entre páginas', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnPageChange = jest.fn();
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
          pagination={{ page: 1, limit: 10, total: 25 }}
          onPageChange={mockOnPageChange}
        />
      );

      // Act
      await user.click(screen.getByLabelText(/próxima página/i));

      // Assert
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Estados de Loading', () => {
    it('deve mostrar skeleton durante carregamento', () => {
      // Arrange & Act
      renderWithProviders(
        <ContasPagarTable 
          data={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
          loading={true}
        />
      );

      // Assert
      expect(screen.getByTestId('table-skeleton')).toBeInTheDocument();
    });

    it('deve desabilitar ações durante loading', () => {
      // Arrange & Act
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
          loading={true}
        />
      );

      // Assert
      const editButtons = screen.getAllByLabelText(/editar/i);
      const deleteButtons = screen.getAllByLabelText(/excluir/i);
      
      editButtons.forEach(button => expect(button).toBeDisabled());
      deleteButtons.forEach(button => expect(button).toBeDisabled());
    });
  });

  describe('Responsividade', () => {
    it('deve adaptar layout para telas pequenas', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });
      
      // Act
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
        />
      );

      // Assert
      expect(screen.getByTestId('mobile-table-view')).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels apropriados para screen readers', () => {
      // Arrange & Act
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
        />
      );

      // Assert
      expect(screen.getByRole('table')).toHaveAccessibleName(/tabela de contas a pagar/i);
      expect(screen.getAllByLabelText(/editar/i)).toHaveLength(3);
      expect(screen.getAllByLabelText(/excluir/i)).toHaveLength(3);
    });

    it('deve suportar navegação por teclado', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithProviders(
        <ContasPagarTable 
          data={mockContasPagar}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onPay={mockOnPay}
        />
      );

      // Act
      const firstEditButton = screen.getAllByLabelText(/editar/i)[0];
      firstEditButton.focus();
      await user.keyboard('{Enter}');

      // Assert
      expect(mockOnEdit).toHaveBeenCalledWith(mockContasPagar[0]);
    });
  });
});