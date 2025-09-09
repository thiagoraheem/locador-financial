import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { empresasApi } from '../../services/empresasApi';
import { EmpresaResponse } from '../../services/empresasApi';

// Async thunks
export const fetchEmpresas = createAsyncThunk(
  'empresas/fetchEmpresas',
  async (params: { skip?: number; limit?: number; ativas_apenas?: boolean }, { rejectWithValue }) => {
    try {
      const response = await empresasApi.list(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar empresas');
    }
  }
);

export const fetchEmpresa = createAsyncThunk(
  'empresas/fetchEmpresa',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await empresasApi.get(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar empresa');
    }
  }
);

export const createEmpresa = createAsyncThunk(
  'empresas/createEmpresa',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await empresasApi.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao criar empresa');
    }
  }
);

export const updateEmpresa = createAsyncThunk(
  'empresas/updateEmpresa',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await empresasApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao atualizar empresa');
    }
  }
);

export const deleteEmpresa = createAsyncThunk(
  'empresas/deleteEmpresa',
  async (id: number, { rejectWithValue }) => {
    try {
      await empresasApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao excluir empresa');
    }
  }
);

// State interface
interface EmpresasState {
  empresas: EmpresaResponse[];
  empresa: EmpresaResponse | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  filters: {
    ativas_apenas?: boolean;
  };
  pagination: {
    skip: number;
    limit: number;
  };
}

// Initial state
const initialState: EmpresasState = {
  empresas: [],
  empresa: null,
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
export const empresasSlice = createSlice({
  name: 'empresas',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ ativas_apenas?: boolean }>) => {
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
    clearEmpresa: (state) => {
      state.empresa = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch empresas
    builder
      .addCase(fetchEmpresas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmpresas.fulfilled, (state, action: PayloadAction<EmpresaResponse[]>) => {
        state.loading = false;
        state.empresas = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchEmpresas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single empresa
      .addCase(fetchEmpresa.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmpresa.fulfilled, (state, action: PayloadAction<EmpresaResponse>) => {
        state.loading = false;
        state.empresa = action.payload;
      })
      .addCase(fetchEmpresa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create empresa
      .addCase(createEmpresa.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmpresa.fulfilled, (state, action: PayloadAction<EmpresaResponse>) => {
        state.loading = false;
        state.empresas.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createEmpresa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update empresa
      .addCase(updateEmpresa.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmpresa.fulfilled, (state, action: PayloadAction<EmpresaResponse>) => {
        state.loading = false;
        const index = state.empresas.findIndex(e => e.CodEmpresa === action.payload.CodEmpresa);
        if (index !== -1) {
          state.empresas[index] = action.payload;
        }
        if (state.empresa && state.empresa.CodEmpresa === action.payload.CodEmpresa) {
          state.empresa = action.payload;
        }
      })
      .addCase(updateEmpresa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete empresa
      .addCase(deleteEmpresa.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmpresa.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.empresas = state.empresas.filter(e => e.CodEmpresa !== action.payload);
        state.totalCount -= 1;
        if (state.empresa && state.empresa.CodEmpresa === action.payload) {
          state.empresa = null;
        }
      })
      .addCase(deleteEmpresa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setFilters,
  setPagination,
  clearEmpresa,
  clearError,
} = empresasSlice.actions;

// Export selectors
export const selectEmpresas = (state: { empresas: EmpresasState }) => state.empresas.empresas;
export const selectEmpresa = (state: { empresas: EmpresasState }) => state.empresas.empresa;
export const selectEmpresasLoading = (state: { empresas: EmpresasState }) => state.empresas.loading;
export const selectEmpresasError = (state: { empresas: EmpresasState }) => state.empresas.error;
export const selectEmpresasTotalCount = (state: { empresas: EmpresasState }) => state.empresas.totalCount;
export const selectEmpresasFilters = (state: { empresas: EmpresasState }) => state.empresas.filters;
export const selectEmpresasPagination = (state: { empresas: EmpresasState }) => state.empresas.pagination;

export default empresasSlice.reducer;