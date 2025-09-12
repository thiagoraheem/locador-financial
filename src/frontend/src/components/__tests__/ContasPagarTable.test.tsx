import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ContasPagarTable } from '../tables/ContasPagarTable';
import { contasPagarSlice } from '../../store/slices/contasPagarSlice';
import { uiSlice } from '../../store/slices/uiSlice';

// Mock do i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'contas_pagar.title': 'Contas a Pagar',
        'contas_pagar.data_vencimento': 'Data de Vencimento',
        'contas_pagar.fornecedor': 'Fornecedor',
        'lancamentos.numero_documento': 'Número do Documento',
        'contas_pagar.valor': 'Valor',
        'contas_pagar.valor_pago': 'Valor Pago',
        'contas_pagar.status': 'Status',
        'contas_pagar.aberto': 'Aberto',
        'contas_pagar.pago': 'Pago',
        'contas_pagar.vencido': 'Vencido',
        'actions.actions': 'Ações',
        'actions.edit': 'Editar',
        'contas_pagar.pagar': 'Pagar',
        'actions.delete': 'Excluir',
        'actions.filter': 'Filtrar',
        'actions.clear': 'Limpar',
        'contas_pagar.nova': 'Nova Conta',
        'contas_pagar.data_vencimento_inicio': 'Data de Vencimento Início',
        'contas_pagar.data_vencimento_fim': 'Data de Vencimento Fim',
        'contas_pagar.valor_minimo': 'Valor Mínimo',
        'contas_pagar.valor_maximo': 'Valor Máximo',
      };
      return translations[key] || key;
    },
  }),
}));

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      contasPagar: contasPagarSlice.reducer,
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

describe('ContasPagarTable', () => {
  const mockOnEdit = jest.fn();
  const mockOnCreate = jest.fn();
  const mockOnPagar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with filter controls', () => {
    const initialState = {
      contasPagar: {
        contasPagar: [],
        loading: false,
        error: null,
        totalCount: 0,
        filters: {},
        pagination: { skip: 0, limit: 20 },
      },
    };

    render(
      <TestWrapper initialState={initialState}>
        <ContasPagarTable
          onEdit={mockOnEdit}
          onCreate={mockOnCreate}
          onPagar={mockOnPagar}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Data de Vencimento')).toBeInTheDocument();
    expect(screen.getByText('Fornecedor')).toBeInTheDocument();
    expect(screen.getByText('Valor')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Fornecedor')).toBeInTheDocument();
    expect(screen.getByLabelText('Data de Vencimento Início')).toBeInTheDocument();
    expect(screen.getByLabelText('Data de Vencimento Fim')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor Mínimo')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor Máximo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filtrar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nova Conta' })).toBeInTheDocument();
  });

  test('renders table with data', () => {
    const mockContas = [
      {
        CodAccountsPayable: 1,
        CodEmpresa: 1,
        CodFornecedor: 2,
        fornecedor_nome: 'Fornecedor Teste',
        DataVencimento: '2023-01-01',
        Valor: 100.50,
        ValorPago: 50.25,
        Status: 'A',
        NumeroDocumento: 'DOC001',
      },
    ];

    const initialState = {
      contasPagar: {
        contasPagar: mockContas,
        loading: false,
        error: null,
        totalCount: 1,
        filters: {},
        pagination: { skip: 0, limit: 20 },
      },
    };

    render(
      <TestWrapper initialState={initialState}>
        <ContasPagarTable
          onEdit={mockOnEdit}
          onCreate={mockOnCreate}
          onPagar={mockOnPagar}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Fornecedor Teste')).toBeInTheDocument();
    expect(screen.getByText('DOC001')).toBeInTheDocument();
    expect(screen.getByText('R$ 100,50')).toBeInTheDocument();
    expect(screen.getByText('R$ 50,25')).toBeInTheDocument();
    expect(screen.getByText('Aberto')).toBeInTheDocument();
  });

  test('calls onCreate when new button is clicked', async () => {
    const user = userEvent.setup();
    const initialState = {
      contasPagar: {
        contasPagar: [],
        loading: false,
        error: null,
        totalCount: 0,
        filters: {},
        pagination: { skip: 0, limit: 20 },
      },
    };

    render(
      <TestWrapper initialState={initialState}>
        <ContasPagarTable
          onEdit={mockOnEdit}
          onCreate={mockOnCreate}
          onPagar={mockOnPagar}
        />
      </TestWrapper>
    );

    const newButton = screen.getByRole('button', { name: 'Nova Conta' });
    await user.click(newButton);

    expect(mockOnCreate).toHaveBeenCalled();
  });

  test('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const mockContas = [
      {
        CodAccountsPayable: 1,
        CodEmpresa: 1,
        CodFornecedor: 2,
        fornecedor_nome: 'Fornecedor Teste',
        DataVencimento: '2023-01-01',
        Valor: 100.50,
        ValorPago: 50.25,
        Status: 'A',
        NumeroDocumento: 'DOC001',
      },
    ];

    const initialState = {
      contasPagar: {
        contasPagar: mockContas,
        loading: false,
        error: null,
        totalCount: 1,
        filters: {},
        pagination: { skip: 0, limit: 20 },
      },
    };

    render(
      <TestWrapper initialState={initialState}>
        <ContasPagarTable
          onEdit={mockOnEdit}
          onCreate={mockOnCreate}
          onPagar={mockOnPagar}
        />
      </TestWrapper>
    );

    const editButton = screen.getByRole('button', { name: 'Editar' });
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockContas[0]);
  });
});