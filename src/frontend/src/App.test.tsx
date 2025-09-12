import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/store';
import App from './App';

// Mock do i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
}));

// Wrapper para testes com providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

describe('App Component', () => {
  test('renders without crashing', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    // Verifica se o app renderiza sem erros
    expect(document.body).toBeInTheDocument();
  });

  test('renders application content', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    // Verifica se a aplicação renderiza algum conteúdo
    expect(document.body).toContainHTML('<div');
  });
});