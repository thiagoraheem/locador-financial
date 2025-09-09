import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { lancamentosApi } from '../../services/lancamentosApi';
import { LancamentoResponse, LancamentoFilter } from '../../services/lancamentosApi';

// Async thunks
export const fetchLancamentos = createAsyncThunk(
  'lancamentos/fetchLancamentos',
  async (params: LancamentoFilter & { skip?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await lancamentosApi.list(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar lançamentos');
    }
  }
);

export const fetchLancamento = createAsyncThunk(
  'lancamentos/fetchLancamento',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await lancamentosApi.get(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar lançamento');
    }
  }
);

export const createLancamento = createAsyncThunk(
  'lancamentos/createLancamento',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await lancamentosApi.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao criar lançamento');
    }
  }
);

export const updateLancamento = createAsyncThunk(
  'lancamentos/updateLancamento',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await lancamentosApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao atualizar lançamento');
    }
  }
);

export const deleteLancamento = createAsyncThunk(
  'lancamentos/deleteLancamento',
  async (id: number, { rejectWithValue }) => {
    try {
      await lancamentosApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao excluir lançamento');
    }
  }
);

export const confirmLancamento = createAsyncThunk(
  'lancamentos/confirmLancamento',
  async ({ id, confirmar }: { id: number; confirmar: boolean }, { rejectWithValue }) => {
    try {
      const response = await lancamentosApi.confirm(id, confirmar);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao confirmar lançamento');
    }
  }
);

// State interface
interface LancamentosState {
  lancamentos: LancamentoResponse[];
  lancamento: LancamentoResponse | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  filters: LancamentoFilter;
  pagination: {
    skip: number;
    limit: number;
  };
}

// Initial state
const initialState: LancamentosState = {
  lancamentos: [],
  lancamento: null,
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
export const lancamentosSlice = createSlice({
  name: 'lancamentos',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<LancamentoFilter>) => {
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
    clearLancamento: (state) => {
      state.lancamento = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch lancamentos
    builder
      .addCase(fetchLancamentos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLancamentos.fulfilled, (state, action: PayloadAction<LancamentoResponse[]>) => {
        state.loading = false;
        state.lancamentos = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchLancamentos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single lancamento
      .addCase(fetchLancamento.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLancamento.fulfilled, (state, action: PayloadAction<LancamentoResponse>) => {
        state.loading = false;
        state.lancamento = action.payload;
      })
      .addCase(fetchLancamento.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create lancamento
      .addCase(createLancamento.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLancamento.fulfilled, (state, action: PayloadAction<LancamentoResponse>) => {
        state.loading = false;
        state.lancamentos.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createLancamento.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update lancamento
      .addCase(updateLancamento.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLancamento.fulfilled, (state, action: PayloadAction<LancamentoResponse>) => {
        state.loading = false;
        const index = state.lancamentos.findIndex(l => l.CodLancamento === action.payload.CodLancamento);
        if (index !== -1) {
          state.lancamentos[index] = action.payload;
        }
        if (state.lancamento && state.lancamento.CodLancamento === action.payload.CodLancamento) {
          state.lancamento = action.payload;
        }
      })
      .addCase(updateLancamento.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete lancamento
      .addCase(deleteLancamento.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLancamento.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.lancamentos = state.lancamentos.filter(l => l.CodLancamento !== action.payload);
        state.totalCount -= 1;
        if (state.lancamento && state.lancamento.CodLancamento === action.payload) {
          state.lancamento = null;
        }
      })
      .addCase(deleteLancamento.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Confirm lancamento
      .addCase(confirmLancamento.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmLancamento.fulfilled, (state, action: PayloadAction<LancamentoResponse>) => {
        state.loading = false;
        const index = state.lancamentos.findIndex(l => l.CodLancamento === action.payload.CodLancamento);
        if (index !== -1) {
          state.lancamentos[index] = action.payload;
        }
        if (state.lancamento && state.lancamento.CodLancamento === action.payload.CodLancamento) {
          state.lancamento = action.payload;
        }
      })
      .addCase(confirmLancamento.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setFilters,
  setPagination,
  clearLancamento,
  clearError,
} = lancamentosSlice.actions;

// Export selectors
export const selectLancamentos = (state: { lancamentos: LancamentosState }) => state.lancamentos.lancamentos;
export const selectLancamento = (state: { lancamentos: LancamentosState }) => state.lancamentos.lancamento;
export const selectLancamentosLoading = (state: { lancamentos: LancamentosState }) => state.lancamentos.loading;
export const selectLancamentosError = (state: { lancamentos: LancamentosState }) => state.lancamentos.error;
export const selectLancamentosTotalCount = (state: { lancamentos: LancamentosState }) => state.lancamentos.totalCount;
export const selectLancamentosFilters = (state: { lancamentos: LancamentosState }) => state.lancamentos.filters;
export const selectLancamentosPagination = (state: { lancamentos: LancamentosState }) => state.lancamentos.pagination;

export default lancamentosSlice.reducer;