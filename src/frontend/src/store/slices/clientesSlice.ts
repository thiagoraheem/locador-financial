import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { clientesApi } from '../../services/clientesApi';
import { ClienteResponse } from '../../services/clientesApi';

// Async thunks
export const fetchClientes = createAsyncThunk(
  'clientes/fetchClientes',
  async (params: { skip?: number; limit?: number; ativos_apenas?: boolean; search?: string }, { rejectWithValue }) => {
    try {
      const response = await clientesApi.list(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar clientes');
    }
  }
);

export const fetchCliente = createAsyncThunk(
  'clientes/fetchCliente',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await clientesApi.get(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar cliente');
    }
  }
);

export const createCliente = createAsyncThunk(
  'clientes/createCliente',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await clientesApi.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao criar cliente');
    }
  }
);

export const updateCliente = createAsyncThunk(
  'clientes/updateCliente',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await clientesApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao atualizar cliente');
    }
  }
);

export const deleteCliente = createAsyncThunk(
  'clientes/deleteCliente',
  async (id: number, { rejectWithValue }) => {
    try {
      await clientesApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao excluir cliente');
    }
  }
);

// State interface
interface ClientesState {
  clientes: ClienteResponse[];
  cliente: ClienteResponse | null;
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
const initialState: ClientesState = {
  clientes: [],
  cliente: null,
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
export const clientesSlice = createSlice({
  name: 'clientes',
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
    clearCliente: (state) => {
      state.cliente = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch clientes
    builder
      .addCase(fetchClientes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientes.fulfilled, (state, action: PayloadAction<ClienteResponse[]>) => {
        state.loading = false;
        state.clientes = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchClientes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single cliente
      .addCase(fetchCliente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCliente.fulfilled, (state, action: PayloadAction<ClienteResponse>) => {
        state.loading = false;
        state.cliente = action.payload;
      })
      .addCase(fetchCliente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create cliente
      .addCase(createCliente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCliente.fulfilled, (state, action: PayloadAction<ClienteResponse>) => {
        state.loading = false;
        state.clientes.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createCliente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update cliente
      .addCase(updateCliente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCliente.fulfilled, (state, action: PayloadAction<ClienteResponse>) => {
        state.loading = false;
        const index = state.clientes.findIndex(c => c.CodCliente === action.payload.CodCliente);
        if (index !== -1) {
          state.clientes[index] = action.payload;
        }
        if (state.cliente && state.cliente.CodCliente === action.payload.CodCliente) {
          state.cliente = action.payload;
        }
      })
      .addCase(updateCliente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete cliente
      .addCase(deleteCliente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCliente.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.clientes = state.clientes.filter(c => c.CodCliente !== action.payload);
        state.totalCount -= 1;
        if (state.cliente && state.cliente.CodCliente === action.payload) {
          state.cliente = null;
        }
      })
      .addCase(deleteCliente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setFilters,
  setPagination,
  clearCliente,
  clearError,
} = clientesSlice.actions;

// Export selectors
export const selectClientes = (state: { clientes: ClientesState }) => state.clientes.clientes;
export const selectCliente = (state: { clientes: ClientesState }) => state.clientes.cliente;
export const selectClientesLoading = (state: { clientes: ClientesState }) => state.clientes.loading;
export const selectClientesError = (state: { clientes: ClientesState }) => state.clientes.error;
export const selectClientesTotalCount = (state: { clientes: ClientesState }) => state.clientes.totalCount;
export const selectClientesFilters = (state: { clientes: ClientesState }) => state.clientes.filters;
export const selectClientesPagination = (state: { clientes: ClientesState }) => state.clientes.pagination;

export default clientesSlice.reducer;