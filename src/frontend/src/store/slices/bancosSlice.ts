import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bancosApi } from '../../services/bancosApi';
import { BancoResponse } from '../../services/bancosApi';

// Async thunks
export const fetchBancos = createAsyncThunk(
  'bancos/fetchBancos',
  async (params: { skip?: number; limit?: number; ativos_apenas?: boolean }, { rejectWithValue }) => {
    try {
      const response = await bancosApi.list(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar bancos');
    }
  }
);

export const fetchBanco = createAsyncThunk(
  'bancos/fetchBanco',
  async (codigo: number, { rejectWithValue }) => {
    try {
      const response = await bancosApi.get(codigo);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar banco');
    }
  }
);

export const createBanco = createAsyncThunk(
  'bancos/createBanco',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await bancosApi.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao criar banco');
    }
  }
);

export const updateBanco = createAsyncThunk(
  'bancos/updateBanco',
  async ({ codigo, data }: { codigo: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await bancosApi.update(codigo, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao atualizar banco');
    }
  }
);

export const deleteBanco = createAsyncThunk(
  'bancos/deleteBanco',
  async (codigo: number, { rejectWithValue }) => {
    try {
      await bancosApi.delete(codigo);
      return codigo;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao excluir banco');
    }
  }
);

// State interface
interface BancosState {
  bancos: BancoResponse[];
  banco: BancoResponse | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  filters: {
    ativos_apenas?: boolean;
  };
  pagination: {
    skip: number;
    limit: number;
  };
}

// Initial state
const initialState: BancosState = {
  bancos: [],
  banco: null,
  loading: false,
  error: null,
  totalCount: 0,
  filters: {
    ativos_apenas: true,
  },
  pagination: {
    skip: 0,
    limit: 100,
  },
};

// Slice
export const bancosSlice = createSlice({
  name: 'bancos',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ ativos_apenas?: boolean }>) => {
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
    clearBanco: (state) => {
      state.banco = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch bancos
    builder
      .addCase(fetchBancos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBancos.fulfilled, (state, action: PayloadAction<BancoResponse[]>) => {
        state.loading = false;
        state.bancos = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchBancos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single banco
      .addCase(fetchBanco.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanco.fulfilled, (state, action: PayloadAction<BancoResponse>) => {
        state.loading = false;
        state.banco = action.payload;
      })
      .addCase(fetchBanco.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create banco
      .addCase(createBanco.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBanco.fulfilled, (state, action: PayloadAction<BancoResponse>) => {
        state.loading = false;
        state.bancos.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createBanco.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update banco
      .addCase(updateBanco.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBanco.fulfilled, (state, action: PayloadAction<BancoResponse>) => {
        state.loading = false;
        const index = state.bancos.findIndex(b => b.Codigo === action.payload.Codigo);
        if (index !== -1) {
          state.bancos[index] = action.payload;
        }
        if (state.banco && state.banco.Codigo === action.payload.Codigo) {
          state.banco = action.payload;
        }
      })
      .addCase(updateBanco.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete banco
      .addCase(deleteBanco.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBanco.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.bancos = state.bancos.filter(b => b.Codigo !== action.payload);
        state.totalCount -= 1;
        if (state.banco && state.banco.Codigo === action.payload) {
          state.banco = null;
        }
      })
      .addCase(deleteBanco.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setFilters,
  setPagination,
  clearBanco,
  clearError,
} = bancosSlice.actions;

// Export selectors
export const selectBancos = (state: { bancos: BancosState }) => state.bancos.bancos;
export const selectBanco = (state: { bancos: BancosState }) => state.bancos.banco;
export const selectBancosLoading = (state: { bancos: BancosState }) => state.bancos.loading;
export const selectBancosError = (state: { bancos: BancosState }) => state.bancos.error;
export const selectBancosTotalCount = (state: { bancos: BancosState }) => state.bancos.totalCount;
export const selectBancosFilters = (state: { bancos: BancosState }) => state.bancos.filters;
export const selectBancosPagination = (state: { bancos: BancosState }) => state.bancos.pagination;

export default bancosSlice.reducer;