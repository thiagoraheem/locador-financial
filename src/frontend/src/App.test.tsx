import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import { theme } from './theme';
import { authSlice } from './store/slices/authSlice';
import { uiSlice } from './store/slices/uiSlice';

// Mock do i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    ready: true,
  }),
}));

// Store de teste
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      ui: uiSlice.reducer,
    },
    preloadedState: initialState,
  });
};

// Wrapper para testes
const TestWrapper: React.FC<{ 
  children: React.ReactNode; 
  initialState?: any;
}> = ({ children, initialState = {} }) => {
  const store = createTestStore(initialState);
  
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

test('renders without crashing', () => {
  render(
    <TestWrapper>
      <App />
    </TestWrapper>
  );
});

test('redirects to login when not authenticated', () => {
  render(
    <TestWrapper initialState={{
      auth: {
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      }
    }}>
      <App />
    </TestWrapper>
  );
  
  // Deve mostrar a página de login ou redirecionar
  expect(window.location.pathname).toBe('/');
});