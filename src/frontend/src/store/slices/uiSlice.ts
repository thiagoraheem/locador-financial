import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  loading: boolean;
  notification: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  } | null;
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  sidebarOpen: true,
  loading: false,
  notification: null,
  theme: 'light',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    showNotification: (
      state,
      action: PayloadAction<{
        message: string;
        severity: 'success' | 'error' | 'warning' | 'info';
      }>
    ) => {
      state.notification = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity,
      };
    },
    hideNotification: (state) => {
      if (state.notification) {
        state.notification.open = false;
      }
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  showNotification,
  hideNotification,
  clearNotification,
  setTheme,
} = uiSlice.actions;