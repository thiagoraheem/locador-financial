import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { contasReceberApi } from '../../services/contasReceberApi';
import { AccountsReceivableResponse, AccountsReceivablePaymentResponse } from '../../services/contasReceberApi';

// Async thunks
export const fetchContasReceber = createAsyncThunk(
  'contasReceber/fetchContasReceber',
  async (params: { 
    skip?: number; 
    limit?: number;
    cod_cliente?: number;
    cod_empresa?: number;
    status?: 'A' | 'R' | 'V' | 'C';
    data_vencimento_inicio?: string;
    data_vencimento_fim?: string;
    valor_min?: number;
    valor_max?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await contasReceberApi.list(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar contas a receber');
    }
  }
);

export const fetchContaReceber = createAsyncThunk(
  'contasReceber/fetchContaReceber',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await contasReceberApi.get(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar conta a receber');
    }
  }
);

export const createContaReceber = createAsyncThunk(
  'contasReceber/createContaReceber',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await contasReceberApi.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao criar conta a receber');
    }
  }
);

export const updateContaReceber = createAsyncThunk(
  'contasReceber/updateContaReceber',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await contasReceberApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao atualizar conta a receber');
    }
  }
);

export const deleteContaReceber = createAsyncThunk(
  'contasReceber/deleteContaReceber',
  async (id: number, { rejectWithValue }) => {
    try {
      await contasReceberApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao excluir conta a receber');
    }
  }
);

export const receberContaReceber = createAsyncThunk(
  'contasReceber/receberContaReceber',
  async ({ id, paymentData }: { id: number; paymentData: any }, { rejectWithValue }) => {
    try {
      const response = await contasReceberApi.receber(id, paymentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao receber conta');
    }
  }
);

export const fetchRecebimentosContaReceber = createAsyncThunk(
  'contasReceber/fetchRecebimentosContaReceber',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await contasReceberApi.getPayments(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar recebimentos');
    }
  }
);

// State interface
interface ContasReceberState {
  contasReceber: AccountsReceivableResponse[];
  contaReceber: AccountsReceivableResponse | null;
  recebimentos: AccountsReceivablePaymentResponse[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  filters: {
    cod_cliente?: number;
    cod_empresa?: number;
    status?: 'A' | 'R' | 'V' | 'C';
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
const initialState: ContasReceberState = {
  contasReceber: [],
  contaReceber: null,
  recebimentos: [],
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
export const contasReceberSlice = createSlice({
  name: 'contasReceber',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{
      cod_cliente?: number;
      cod_empresa?: number;
      status?: 'A' | 'R' | 'V' | 'C';
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
    clearContaReceber: (state) => {
      state.contaReceber = null;
    },
    clearRecebimentos: (state) => {
      state.recebimentos = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch contas receber
    builder
      .addCase(fetchContasReceber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContasReceber.fulfilled, (state, action: PayloadAction<AccountsReceivableResponse[]>) => {
        state.loading = false;
        state.contasReceber = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchContasReceber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single conta receber
      .addCase(fetchContaReceber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContaReceber.fulfilled, (state, action: PayloadAction<AccountsReceivableResponse>) => {
        state.loading = false;
        state.contaReceber = action.payload;
      })
      .addCase(fetchContaReceber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create conta receber
      .addCase(createContaReceber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContaReceber.fulfilled, (state, action: PayloadAction<AccountsReceivableResponse>) => {
        state.loading = false;
        state.contasReceber.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createContaReceber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update conta receber
      .addCase(updateContaReceber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContaReceber.fulfilled, (state, action: PayloadAction<AccountsReceivableResponse>) => {
        state.loading = false;
        const index = state.contasReceber.findIndex(c => c.CodAccountsReceivable === action.payload.CodAccountsReceivable);
        if (index !== -1) {
          state.contasReceber[index] = action.payload;
        }
        if (state.contaReceber && state.contaReceber.CodAccountsReceivable === action.payload.CodAccountsReceivable) {
          state.contaReceber = action.payload;
        }
      })
      .addCase(updateContaReceber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete conta receber
      .addCase(deleteContaReceber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContaReceber.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.contasReceber = state.contasReceber.filter(c => c.CodAccountsReceivable !== action.payload);
        state.totalCount -= 1;
        if (state.contaReceber && state.contaReceber.CodAccountsReceivable === action.payload) {
          state.contaReceber = null;
        }
      })
      .addCase(deleteContaReceber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Receber conta
      .addCase(receberContaReceber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(receberContaReceber.fulfilled, (state, action: PayloadAction<AccountsReceivableResponse>) => {
        state.loading = false;
        const index = state.contasReceber.findIndex(c => c.CodAccountsReceivable === action.payload.CodAccountsReceivable);
        if (index !== -1) {
          state.contasReceber[index] = action.payload;
        }
        if (state.contaReceber && state.contaReceber.CodAccountsReceivable === action.payload.CodAccountsReceivable) {
          state.contaReceber = action.payload;
        }
      })
      .addCase(receberContaReceber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch recebimentos
      .addCase(fetchRecebimentosContaReceber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecebimentosContaReceber.fulfilled, (state, action: PayloadAction<AccountsReceivablePaymentResponse[]>) => {
        state.loading = false;
        state.recebimentos = action.payload;
      })
      .addCase(fetchRecebimentosContaReceber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setFilters,
  setPagination,
  clearContaReceber,
  clearRecebimentos,
  clearError,
} = contasReceberSlice.actions;

// Export selectors
export const selectContasReceber = (state: { contasReceber: ContasReceberState }) => state.contasReceber.contasReceber;
export const selectContaReceber = (state: { contasReceber: ContasReceberState }) => state.contasReceber.contaReceber;
export const selectRecebimentosContaReceber = (state: { contasReceber: ContasReceberState }) => state.contasReceber.recebimentos;
export const selectContasReceberLoading = (state: { contasReceber: ContasReceberState }) => state.contasReceber.loading;
export const selectContasReceberError = (state: { contasReceber: ContasReceberState }) => state.contasReceber.error;
export const selectContasReceberTotalCount = (state: { contasReceber: ContasReceberState }) => state.contasReceber.totalCount;
export const selectContasReceberFilters = (state: { contasReceber: ContasReceberState }) => state.contasReceber.filters;
export const selectContasReceberPagination = (state: { contasReceber: ContasReceberState }) => state.contasReceber.pagination;

export default contasReceberSlice.reducer;