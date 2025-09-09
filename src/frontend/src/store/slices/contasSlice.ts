import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { contasApi } from '../../services/contasApi';
import { ContaResponse } from '../../services/contasApi';

// Async thunks
export const fetchContas = createAsyncThunk(
  'contas/fetchContas',
  async (params: { skip?: number; limit?: number; cod_empresa?: number; ativas_apenas?: boolean }, { rejectWithValue }) => {
    try {
      const response = await contasApi.list(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar contas');
    }
  }
);

export const fetchConta = createAsyncThunk(
  'contas/fetchConta',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await contasApi.get(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar conta');
    }
  }
);

export const createConta = createAsyncThunk(
  'contas/createConta',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await contasApi.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao criar conta');
    }
  }
);

export const updateConta = createAsyncThunk(
  'contas/updateConta',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await contasApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao atualizar conta');
    }
  }
);

export const deleteConta = createAsyncThunk(
  'contas/deleteConta',
  async (id: number, { rejectWithValue }) => {
    try {
      await contasApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao excluir conta');
    }
  }
);

// State interface
interface ContasState {
  contas: ContaResponse[];
  conta: ContaResponse | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  filters: {
    cod_empresa?: number;
    ativas_apenas?: boolean;
  };
  pagination: {
    skip: number;
    limit: number;
  };
}

// Initial state
const initialState: ContasState = {
  contas: [],
  conta: null,
  loading: false,
  error: null,
  totalCount: 0,
  filters: {
    ativas_apenas: true,
  },
  pagination: {
    skip: 0,
    limit: 100,
  },
};

// Slice
export const contasSlice = createSlice({
  name: 'contas',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ cod_empresa?: number; ativas_apenas?: boolean }>) => {
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
    clearConta: (state) => {
      state.conta = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch contas
    builder
      .addCase(fetchContas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContas.fulfilled, (state, action: PayloadAction<ContaResponse[]>) => {
        state.loading = false;
        state.contas = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchContas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single conta
      .addCase(fetchConta.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConta.fulfilled, (state, action: PayloadAction<ContaResponse>) => {
        state.loading = false;
        state.conta = action.payload;
      })
      .addCase(fetchConta.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create conta
      .addCase(createConta.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConta.fulfilled, (state, action: PayloadAction<ContaResponse>) => {
        state.loading = false;
        state.contas.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createConta.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update conta
      .addCase(updateConta.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateConta.fulfilled, (state, action: PayloadAction<ContaResponse>) => {
        state.loading = false;
        const index = state.contas.findIndex(c => c.idConta === action.payload.idConta);
        if (index !== -1) {
          state.contas[index] = action.payload;
        }
        if (state.conta && state.conta.idConta === action.payload.idConta) {
          state.conta = action.payload;
        }
      })
      .addCase(updateConta.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete conta
      .addCase(deleteConta.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteConta.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.contas = state.contas.filter(c => c.idConta !== action.payload);
        state.totalCount -= 1;
        if (state.conta && state.conta.idConta === action.payload) {
          state.conta = null;
        }
      })
      .addCase(deleteConta.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setFilters,
  setPagination,
  clearConta,
  clearError,
} = contasSlice.actions;

// Export selectors
export const selectContas = (state: { contas: ContasState }) => state.contas.contas;
export const selectConta = (state: { contas: ContasState }) => state.contas.conta;
export const selectContasLoading = (state: { contas: ContasState }) => state.contas.loading;
export const selectContasError = (state: { contas: ContasState }) => state.contas.error;
export const selectContasTotalCount = (state: { contas: ContasState }) => state.contas.totalCount;
export const selectContasFilters = (state: { contas: ContasState }) => state.contas.filters;
export const selectContasPagination = (state: { contas: ContasState }) => state.contas.pagination;

export default contasSlice.reducer;