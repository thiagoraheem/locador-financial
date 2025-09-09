import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { dashboardApi } from '../../services/dashboardApi';
import {
  FinancialSummary,
  CashFlowData,
  CategorySummary,
  OverdueSummary,
  TopFavorecido
} from '../../services/dashboardApi';

// Async thunks
export const fetchFinancialSummary = createAsyncThunk(
  'dashboard/fetchFinancialSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getResumo();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar resumo financeiro');
    }
  }
);

export const fetchCashFlow = createAsyncThunk(
  'dashboard/fetchCashFlow',
  async (months: number = 12, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getFluxoCaixa(months);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar fluxo de caixa');
    }
  }
);

export const fetchCategorySummary = createAsyncThunk(
  'dashboard/fetchCategorySummary',
  async (tipo: 'E' | 'S', { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getCategorias(tipo);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar resumo por categorias');
    }
  }
);

export const fetchOverdueSummary = createAsyncThunk(
  'dashboard/fetchOverdueSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getVencimentos();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar resumo de vencimentos');
    }
  }
);

export const fetchTopFavorecidos = createAsyncThunk(
  'dashboard/fetchTopFavorecidos',
  async ({ tipo, limit }: { tipo: 'E' | 'S'; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getFavorecidos(tipo, limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Erro ao buscar top favorecidos');
    }
  }
);

// State interface
interface DashboardState {
  financialSummary: FinancialSummary | null;
  cashFlow: CashFlowData | null;
  revenueCategories: CategorySummary[];
  expenseCategories: CategorySummary[];
  overdueSummary: OverdueSummary | null;
  topReceitas: TopFavorecido[];
  topDespesas: TopFavorecido[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: DashboardState = {
  financialSummary: null,
  cashFlow: null,
  revenueCategories: [],
  expenseCategories: [],
  overdueSummary: null,
  topReceitas: [],
  topDespesas: [],
  loading: false,
  error: null,
};

// Slice
export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch financial summary
    builder
      .addCase(fetchFinancialSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinancialSummary.fulfilled, (state, action: PayloadAction<FinancialSummary>) => {
        state.loading = false;
        state.financialSummary = action.payload;
      })
      .addCase(fetchFinancialSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch cash flow
      .addCase(fetchCashFlow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCashFlow.fulfilled, (state, action: PayloadAction<CashFlowData>) => {
        state.loading = false;
        state.cashFlow = action.payload;
      })
      .addCase(fetchCashFlow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch revenue categories
      .addCase(fetchCategorySummary.fulfilled, (state, action: PayloadAction<CategorySummary[]>) => {
        if (action.meta.arg === 'E') {
          state.revenueCategories = action.payload;
        } else {
          state.expenseCategories = action.payload;
        }
      })
      .addCase(fetchCategorySummary.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch overdue summary
      .addCase(fetchOverdueSummary.fulfilled, (state, action: PayloadAction<OverdueSummary>) => {
        state.overdueSummary = action.payload;
      })
      .addCase(fetchOverdueSummary.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch top favorecidos
      .addCase(fetchTopFavorecidos.fulfilled, (state, action: PayloadAction<TopFavorecido[]>) => {
        if (action.meta.arg.tipo === 'E') {
          state.topReceitas = action.payload;
        } else {
          state.topDespesas = action.payload;
        }
      })
      .addCase(fetchTopFavorecidos.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearError } = dashboardSlice.actions;

export default dashboardSlice.reducer;