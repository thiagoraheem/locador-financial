import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { categoriasApi } from '../../services/categoriasApi';
import { CategoriaResponse } from '../../services/categoriasApi';

// Async thunks
export const fetchCategorias = createAsyncThunk(
  'categorias/fetchCategorias',
  async (params: { skip?: number; limit?: number; tipo?: string; ativas_apenas?: boolean; hierarquica?: boolean }, { rejectWithValue }) => {
    try {
      const response = await categoriasApi.list(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar categorias');
    }
  }
);

export const fetchCategoria = createAsyncThunk(
  'categorias/fetchCategoria',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await categoriasApi.get(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar categoria');
    }
  }
);

export const createCategoria = createAsyncThunk(
  'categorias/createCategoria',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await categoriasApi.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao criar categoria');
    }
  }
);

export const updateCategoria = createAsyncThunk(
  'categorias/updateCategoria',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await categoriasApi.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao atualizar categoria');
    }
  }
);

export const deleteCategoria = createAsyncThunk(
  'categorias/deleteCategoria',
  async (id: number, { rejectWithValue }) => {
    try {
      await categoriasApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao excluir categoria');
    }
  }
);

export const activateCategoria = createAsyncThunk(
  'categorias/activateCategoria',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await categoriasApi.activate(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao ativar categoria');
    }
  }
);

export const moveCategoria = createAsyncThunk(
  'categorias/moveCategoria',
  async ({ id, nova_categoria_pai_id }: { id: number; nova_categoria_pai_id: number | null }, { rejectWithValue }) => {
    try {
      const response = await categoriasApi.move(id, nova_categoria_pai_id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao mover categoria');
    }
  }
);

// State interface
interface CategoriasState {
  categorias: CategoriaResponse[];
  categoria: CategoriaResponse | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  filters: {
    tipo?: string;
    ativas_apenas?: boolean;
    hierarquica?: boolean;
  };
  pagination: {
    skip: number;
    limit: number;
  };
}

// Initial state
const initialState: CategoriasState = {
  categorias: [],
  categoria: null,
  loading: false,
  error: null,
  totalCount: 0,
  filters: {
    ativas_apenas: true,
    hierarquica: false,
  },
  pagination: {
    skip: 0,
    limit: 100,
  },
};

// Slice
export const categoriasSlice = createSlice({
  name: 'categorias',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ tipo?: string; ativas_apenas?: boolean; hierarquica?: boolean }>) => {
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
    clearCategoria: (state) => {
      state.categoria = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch categorias
    builder
      .addCase(fetchCategorias.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategorias.fulfilled, (state, action: PayloadAction<CategoriaResponse[]>) => {
        state.loading = false;
        state.categorias = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchCategorias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single categoria
      .addCase(fetchCategoria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoria.fulfilled, (state, action: PayloadAction<CategoriaResponse>) => {
        state.loading = false;
        state.categoria = action.payload;
      })
      .addCase(fetchCategoria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create categoria
      .addCase(createCategoria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategoria.fulfilled, (state, action: PayloadAction<CategoriaResponse>) => {
        state.loading = false;
        state.categorias.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createCategoria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update categoria
      .addCase(updateCategoria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategoria.fulfilled, (state, action: PayloadAction<CategoriaResponse>) => {
        state.loading = false;
        const index = state.categorias.findIndex(c => c.CodCategoria === action.payload.CodCategoria);
        if (index !== -1) {
          state.categorias[index] = action.payload;
        }
        if (state.categoria && state.categoria.CodCategoria === action.payload.CodCategoria) {
          state.categoria = action.payload;
        }
      })
      .addCase(updateCategoria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete categoria
      .addCase(deleteCategoria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategoria.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.categorias = state.categorias.filter(c => c.CodCategoria !== action.payload);
        state.totalCount -= 1;
        if (state.categoria && state.categoria.CodCategoria === action.payload) {
          state.categoria = null;
        }
      })
      .addCase(deleteCategoria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Activate categoria
      .addCase(activateCategoria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateCategoria.fulfilled, (state, action: PayloadAction<CategoriaResponse>) => {
        state.loading = false;
        const index = state.categorias.findIndex(c => c.CodCategoria === action.payload.CodCategoria);
        if (index !== -1) {
          state.categorias[index] = action.payload;
        }
        if (state.categoria && state.categoria.CodCategoria === action.payload.CodCategoria) {
          state.categoria = action.payload;
        }
      })
      .addCase(activateCategoria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Move categoria
      .addCase(moveCategoria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveCategoria.fulfilled, (state, action: PayloadAction<CategoriaResponse>) => {
        state.loading = false;
        const index = state.categorias.findIndex(c => c.CodCategoria === action.payload.CodCategoria);
        if (index !== -1) {
          state.categorias[index] = action.payload;
        }
        if (state.categoria && state.categoria.CodCategoria === action.payload.CodCategoria) {
          state.categoria = action.payload;
        }
      })
      .addCase(moveCategoria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setFilters,
  setPagination,
  clearCategoria,
  clearError,
} = categoriasSlice.actions;

// Export selectors
export const selectCategorias = (state: { categorias: CategoriasState }) => state.categorias.categorias;
export const selectCategoria = (state: { categorias: CategoriasState }) => state.categorias.categoria;
export const selectCategoriasLoading = (state: { categorias: CategoriasState }) => state.categorias.loading;
export const selectCategoriasError = (state: { categorias: CategoriasState }) => state.categorias.error;
export const selectCategoriasTotalCount = (state: { categorias: CategoriasState }) => state.categorias.totalCount;
export const selectCategoriasFilters = (state: { categorias: CategoriasState }) => state.categorias.filters;
export const selectCategoriasPagination = (state: { categorias: CategoriasState }) => state.categorias.pagination;

export default categoriasSlice.reducer;