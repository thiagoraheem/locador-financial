import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { favorecidosApi } from '../../services/favorecidosApi';
import { FavorecidoResponse } from '../../services/favorecidosApi';

// Async thunks
export const fetchFavorecidos = createAsyncThunk(
  'favorecidos/fetchFavorecidos',
  async (params: { skip?: number; limit?: number; ativos_apenas?: boolean; search?: string }, { rejectWithValue }) => {
    try {
      const response = await favorecidosApi.list(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar favorecidos');
    }
  }
);

export const fetchFavorecido = createAsyncThunk(
  'favorecidos/fetchFavorecido',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await favorecidosApi.get(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar favorecido');
    }
  }
);

export const createFavorecido = createAsyncThunk(
  'favorecidos/createFavorecido',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await favorecidosApi.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao criar favorecido');
    }
  }
);

export const updateFavorecido = createAsyncThunk(
  'favorecidos/updateFavorecido',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await favorecidosApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao atualizar favorecido');
    }
  }
);

export const deleteFavorecido = createAsyncThunk(
  'favorecidos/deleteFavorecido',
  async (id: number, { rejectWithValue }) => {
    try {
      await favorecidosApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao excluir favorecido');
    }
  }
);

export const activateFavorecido = createAsyncThunk(
  'favorecidos/activateFavorecido',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await favorecidosApi.activate(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao ativar favorecido');
    }
  }
);

// State interface
interface FavorecidosState {
  favorecidos: FavorecidoResponse[];
  favorecido: FavorecidoResponse | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  filters: {
    ativos_apenas?: boolean;
    search?: string;
  };
  pagination: {
    skip: number;
    limit: number;
  };
}

// Initial state
const initialState: FavorecidosState = {
  favorecidos: [],
  favorecido: null,
  loading: false,
  error: null,
  totalCount: 0,
  filters: {
    ativos_apenas: true,
  },
  pagination: {
    skip: 0,
    limit: 50,
  },
};

// Slice
export const favorecidosSlice = createSlice({
  name: 'favorecidos',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ ativos_apenas?: boolean; search?: string }>) => {
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
    clearFavorecido: (state) => {
      state.favorecido = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch favorecidos
    builder
      .addCase(fetchFavorecidos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorecidos.fulfilled, (state, action: PayloadAction<FavorecidoResponse[]>) => {
        state.loading = false;
        state.favorecidos = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchFavorecidos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single favorecido
      .addCase(fetchFavorecido.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorecido.fulfilled, (state, action: PayloadAction<FavorecidoResponse>) => {
        state.loading = false;
        state.favorecido = action.payload;
      })
      .addCase(fetchFavorecido.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create favorecido
      .addCase(createFavorecido.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFavorecido.fulfilled, (state, action: PayloadAction<FavorecidoResponse>) => {
        state.loading = false;
        state.favorecidos.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createFavorecido.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update favorecido
      .addCase(updateFavorecido.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFavorecido.fulfilled, (state, action: PayloadAction<FavorecidoResponse>) => {
        state.loading = false;
        const index = state.favorecidos.findIndex(f => f.CodFavorecido === action.payload.CodFavorecido);
        if (index !== -1) {
          state.favorecidos[index] = action.payload;
        }
        if (state.favorecido && state.favorecido.CodFavorecido === action.payload.CodFavorecido) {
          state.favorecido = action.payload;
        }
      })
      .addCase(updateFavorecido.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete favorecido
      .addCase(deleteFavorecido.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFavorecido.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.favorecidos = state.favorecidos.filter(f => f.CodFavorecido !== action.payload);
        state.totalCount -= 1;
        if (state.favorecido && state.favorecido.CodFavorecido === action.payload) {
          state.favorecido = null;
        }
      })
      .addCase(deleteFavorecido.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Activate favorecido
      .addCase(activateFavorecido.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateFavorecido.fulfilled, (state, action: PayloadAction<FavorecidoResponse>) => {
        state.loading = false;
        const index = state.favorecidos.findIndex(f => f.CodFavorecido === action.payload.CodFavorecido);
        if (index !== -1) {
          state.favorecidos[index] = action.payload;
        }
        if (state.favorecido && state.favorecido.CodFavorecido === action.payload.CodFavorecido) {
          state.favorecido = action.payload;
        }
      })
      .addCase(activateFavorecido.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setFilters,
  setPagination,
  clearFavorecido,
  clearError,
} = favorecidosSlice.actions;

// Export selectors
export const selectFavorecidos = (state: { favorecidos: FavorecidosState }) => state.favorecidos.favorecidos;
export const selectFavorecido = (state: { favorecidos: FavorecidosState }) => state.favorecidos.favorecido;
export const selectFavorecidosLoading = (state: { favorecidos: FavorecidosState }) => state.favorecidos.loading;
export const selectFavorecidosError = (state: { favorecidos: FavorecidosState }) => state.favorecidos.error;
export const selectFavorecidosTotalCount = (state: { favorecidos: FavorecidosState }) => state.favorecidos.totalCount;
export const selectFavorecidosFilters = (state: { favorecidos: FavorecidosState }) => state.favorecidos.filters;
export const selectFavorecidosPagination = (state: { favorecidos: FavorecidosState }) => state.favorecidos.pagination;

export default favorecidosSlice.reducer;