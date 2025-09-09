import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { authSlice } from './slices/authSlice';
import { uiSlice } from './slices/uiSlice';
import { categoriasSlice } from './slices/categoriasSlice';
import { clientesSlice } from './slices/clientesSlice';
import { contasPagarSlice } from './slices/contasPagarSlice';
import { contasReceberSlice } from './slices/contasReceberSlice';
import { empresasSlice } from './slices/empresasSlice';
import { favorecidosSlice } from './slices/favorecidosSlice';
import { lancamentosSlice } from './slices/lancamentosSlice';
import { contasSlice } from './slices/contasSlice';
import { bancosSlice } from './slices/bancosSlice';
import dashboardSlice from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
    categorias: categoriasSlice.reducer,
    clientes: clientesSlice.reducer,
    contasPagar: contasPagarSlice.reducer,
    contasReceber: contasReceberSlice.reducer,
    empresas: empresasSlice.reducer,
    favorecidos: favorecidosSlice.reducer,
    lancamentos: lancamentosSlice.reducer,
    contas: contasSlice.reducer,
    bancos: bancosSlice.reducer,
    dashboard: dashboardSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks with proper types
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;