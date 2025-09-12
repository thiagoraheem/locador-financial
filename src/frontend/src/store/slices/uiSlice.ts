import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  timestamp: number;
}

interface LoadingState {
  [key: string]: boolean;
}

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  loading: LoadingState;
  globalLoading: boolean;
  notifications: NotificationData[];
}

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: false,
  loading: {},
  globalLoading: false,
  notifications: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loading[action.payload];
    },
    clearAllLoading: (state) => {
      state.loading = {};
      state.globalLoading = false;
    },
    addNotification: (state, action: PayloadAction<Omit<NotificationData, 'id' | 'timestamp'>>) => {
      const notification: NotificationData = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    showSuccess: (state, action: PayloadAction<{ title: string; message?: string }>) => {
      const notification: NotificationData = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'success',
        title: action.payload.title,
        message: action.payload.message,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    showError: (state, action: PayloadAction<{ title: string; message?: string }>) => {
      const notification: NotificationData = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'error',
        title: action.payload.title,
        message: action.payload.message,
        persistent: true,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    showWarning: (state, action: PayloadAction<{ title: string; message?: string }>) => {
      const notification: NotificationData = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'warning',
        title: action.payload.title,
        message: action.payload.message,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    showInfo: (state, action: PayloadAction<{ title: string; message?: string }>) => {
      const notification: NotificationData = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'info',
        title: action.payload.title,
        message: action.payload.message,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  setGlobalLoading,
  clearLoading,
  clearAllLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  showSuccess,
  showError,
  showWarning,
  showInfo,
} = uiSlice.actions;

// Alias para compatibilidade
export const hideNotification = removeNotification;
export const clearNotification = clearNotifications;

// Seletores
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectLoading = (state: { ui: UIState }, key: string) => state.ui.loading[key] || false;
export const selectGlobalLoading = (state: { ui: UIState }) => state.ui.globalLoading;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectIsAnyLoading = (state: { ui: UIState }) => 
  state.ui.globalLoading || Object.values(state.ui.loading).some(loading => loading);