import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { contasPagarApi } from '../../services/contasPagarApi';
import { AccountsPayableResponse, AccountsPayablePaymentResponse } from '../../services/contasPagarApi';

// Async thunks
export const fetchContasPagar = createAsyncThunk(
  'contasPagar/fetchContasPagar',
  async (params: { 
    skip?: number; 
    limit?: number;
    cod_fornecedor?: number;
    cod_empresa?: number;
    status?: 'A' | 'P' | 'V' | 'C';
    data_vencimento_inicio?: string;
    data_vencimento_fim?: string;
    valor_min?: number;
    valor_max?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await contasPagarApi.list(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar contas a pagar');
    }
  }
);

export const fetchContaPagar = createAsyncThunk(
  'contasPagar/fetchContaPagar',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await contasPagarApi.get(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar conta a pagar');
    }
  }
);

export const createContaPagar = createAsyncThunk(
  'contasPagar/createContaPagar',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await contasPagarApi.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao criar conta a pagar');
    }
  }
);

export const updateContaPagar = createAsyncThunk(
  'contasPagar/updateContaPagar',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await contasPagarApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao atualizar conta a pagar');
    }
  }
);

export const deleteContaPagar = createAsyncThunk(
  'contasPagar/deleteContaPagar',
  async (id: number, { rejectWithValue }) => {
    try {
      await contasPagarApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao excluir conta a pagar');
    }
  }
);

export const pagarContaPagar = createAsyncThunk(
  'contasPagar/pagarContaPagar',
  async ({ id, paymentData }: { id: number; paymentData: any }, { rejectWithValue }) => {
    try {
      const response = await contasPagarApi.pagar(id, paymentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao pagar conta');
    }
  }
);

export const fetchPagamentosContaPagar = createAsyncThunk(
  'contasPagar/fetchPagamentosContaPagar',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await contasPagarApi.getPayments(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar pagamentos');
    }
  }
);

// State interface
interface ContasPagarState {
  contasPagar: AccountsPayableResponse[];
  contaPagar: AccountsPayableResponse | null;
  pagamentos: AccountsPayablePaymentResponse[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  filters: {
    cod_fornecedor?: number;
    cod_empresa?: number;
    status?: 'A' | 'P' | 'V' | 'C';
    data_vencimento_inicio?: string;
    data_vencimento_fim?: string;
    valor_min?: number;
    valor_max?: number;
  };
  pagination: {
    skip: number;
    limit: number;
  };
}

// Initial state
const initialState: ContasPagarState = {
  contasPagar: [],
  contaPagar: null,
  pagamentos: [],
  loading: false,
  error: null,
  totalCount: 0,
  filters: {},
  pagination: {
    skip: 0,
    limit: 20,
  },
};

// Slice
export const contasPagarSlice = createSlice({
  name: 'contasPagar',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{
      cod_fornecedor?: number;
      cod_empresa?: number;
      status?: 'A' | 'P' | 'V' | 'C';
      data_vencimento_inicio?: string;
      data_vencimento_fim?: string;
      valor_min?: number;
      valor_max?: number;
    }>) => {
      state.filters = action.payload;
    },
    setPagination: (state, action: PayloadAction<{ skip?: number; limit?: number }>) => {
      if (action.payload.skip !== undefined) {
        state.pagination.skip = action.payload.skip;
      }
      if (action.payload.limit !== undefined) {
        state.pagination.limit = action.payload.limit;
      }
    },
    clearContaPagar: (state) => {
      state.contaPagar = null;
    },
    clearPagamentos: (state) => {
      state.pagamentos = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch contas pagar
    builder
      .addCase(fetchContasPagar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContasPagar.fulfilled, (state, action: PayloadAction<AccountsPayableResponse[]>) => {
        state.loading = false;
        state.contasPagar = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchContasPagar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single conta pagar
      .addCase(fetchContaPagar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContaPagar.fulfilled, (state, action: PayloadAction<AccountsPayableResponse>) => {
        state.loading = false;
        state.contaPagar = action.payload;
      })
      .addCase(fetchContaPagar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create conta pagar
      .addCase(createContaPagar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContaPagar.fulfilled, (state, action: PayloadAction<AccountsPayableResponse>) => {
        state.loading = false;
        state.contasPagar.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createContaPagar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update conta pagar
      .addCase(updateContaPagar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContaPagar.fulfilled, (state, action: PayloadAction<AccountsPayableResponse>) => {
        state.loading = false;
        const index = state.contasPagar.findIndex(c => c.CodAccountsPayable === action.payload.CodAccountsPayable);
        if (index !== -1) {
          state.contasPagar[index] = action.payload;
        }
        if (state.contaPagar && state.contaPagar.CodAccountsPayable === action.payload.CodAccountsPayable) {
          state.contaPagar = action.payload;
        }
      })
      .addCase(updateContaPagar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete conta pagar
      .addCase(deleteContaPagar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContaPagar.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.contasPagar = state.contasPagar.filter(c => c.CodAccountsPayable !== action.payload);
        state.totalCount -= 1;
        if (state.contaPagar && state.contaPagar.CodAccountsPayable === action.payload) {
          state.contaPagar = null;
        }
      })
      .addCase(deleteContaPagar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Pagar conta
      .addCase(pagarContaPagar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(pagarContaPagar.fulfilled, (state, action: PayloadAction<AccountsPayableResponse>) => {
        state.loading = false;
        const index = state.contasPagar.findIndex(c => c.CodAccountsPayable === action.payload.CodAccountsPayable);
        if (index !== -1) {
          state.contasPagar[index] = action.payload;
        }
        if (state.contaPagar && state.contaPagar.CodAccountsPayable === action.payload.CodAccountsPayable) {
          state.contaPagar = action.payload;
        }
      })
      .addCase(pagarContaPagar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch pagamentos
      .addCase(fetchPagamentosContaPagar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPagamentosContaPagar.fulfilled, (state, action: PayloadAction<AccountsPayablePaymentResponse[]>) => {
        state.loading = false;
        state.pagamentos = action.payload;
      })
      .addCase(fetchPagamentosContaPagar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setFilters,
  setPagination,
  clearContaPagar,
  clearPagamentos,
  clearError,
} = contasPagarSlice.actions;

// Export selectors
export const selectContasPagar = (state: { contasPagar: ContasPagarState }) => state.contasPagar.contasPagar;
export const selectContaPagar = (state: { contasPagar: ContasPagarState }) => state.contasPagar.contaPagar;
export const selectPagamentosContaPagar = (state: { contasPagar: ContasPagarState }) => state.contasPagar.pagamentos;
export const selectContasPagarLoading = (state: { contasPagar: ContasPagarState }) => state.contasPagar.loading;
export const selectContasPagarError = (state: { contasPagar: ContasPagarState }) => state.contasPagar.error;
export const selectContasPagarTotalCount = (state: { contasPagar: ContasPagarState }) => state.contasPagar.totalCount;
export const selectContasPagarFilters = (state: { contasPagar: ContasPagarState }) => state.contasPagar.filters;
export const selectContasPagarPagination = (state: { contasPagar: ContasPagarState }) => state.contasPagar.pagination;

export default contasPagarSlice.reducer;