import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { configureStore } from '@reduxjs/toolkit';
import { ContaPagarForm } from '../forms/ContaPagarForm';
import { theme } from '../../theme';
import { contasPagarSlice } from '../../store/slices/contasPagarSlice';
import { uiSlice } from '../../store/slices/uiSlice';
import { ptBR } from 'date-fns/locale';

// Mock do i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'contas_pagar.nova': 'Nova Conta a Pagar',
        'contas_pagar.editar': 'Editar Conta a Pagar',
        'contas.empresa': 'Empresa',
        'contas_pagar.fornecedor': 'Fornecedor',
        'contas.conta': 'Conta Bancária',
        'lancamentos.categoria': 'Categoria',
        'lancamentos.data_emissao': 'Data de Emissão',
        'contas_pagar.data_vencimento': 'Data de Vencimento',
        'contas_pagar.valor': 'Valor',
        'lancamentos.numero_documento': 'Número do Documento',
        'contas_pagar.parcela': 'Parcela',
        'contas_pagar.total_parcelas': 'Total de Parcelas',
        'contas_pagar.status': 'Status',
        'contas_pagar.aberto': 'Aberto',
        'contas_pagar.pago': 'Pago',
        'contas_pagar.vencido': 'Vencido',
        'lancamentos.cancelado': 'Cancelado',
        'contas_pagar.codigo_barras': 'Código de Barras',
        'contas_pagar.linha_digitavel': 'Linha Digitável',
        'lancamentos.observacoes': 'Observações',
        'actions.cancel': 'Cancelar',
        'actions.save': 'Salvar',
        'validation.required': 'Campo obrigatório',
        'validation.positive_number': 'Número deve ser positivo',
        'validation.max_length': 'Texto muito longo',
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
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            {children}
          </LocalizationProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe('ContaPagarForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form for new account payable', () => {
    render(
      <TestWrapper>
        <ContaPagarForm
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Nova Conta a Pagar')).toBeInTheDocument();
    expect(screen.getByLabelText('Empresa')).toBeInTheDocument();
    expect(screen.getByLabelText('Fornecedor')).toBeInTheDocument();
    expect(screen.getByLabelText('Data de Vencimento')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor')).toBeInTheDocument();
  });

  test('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ContaPagarForm
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    const saveButton = screen.getByRole('button', { name: 'Salvar' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ContaPagarForm
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    // Fill in required fields
    const empresaInput = screen.getByLabelText('Empresa');
    const fornecedorInput = screen.getByLabelText('Fornecedor');
    const dataVencimentoInput = screen.getByLabelText('Data de Vencimento');
    const valorInput = screen.getByLabelText('Valor');
    const saveButton = screen.getByRole('button', { name: 'Salvar' });

    await user.type(empresaInput, '1');
    await user.type(fornecedorInput, '2');
    fireEvent.change(dataVencimentoInput, { target: { value: '01/01/2023' } });
    await user.type(valorInput, '100.50');

    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  test('renders form for editing account payable', () => {
    const initialData = {
      CodAccountsPayable: 1,
      CodEmpresa: 1,
      CodFornecedor: 2,
      DataVencimento: '2023-01-01',
      Valor: 100.50,
      Status: 'A',
    };

    render(
      <TestWrapper>
        <ContaPagarForm
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialData}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Editar Conta a Pagar')).toBeInTheDocument();
    expect(screen.getByLabelText('Empresa')).toHaveValue(1);
    expect(screen.getByLabelText('Fornecedor')).toHaveValue(2);
    expect(screen.getByLabelText('Valor')).toHaveValue(100.5);
  });
});