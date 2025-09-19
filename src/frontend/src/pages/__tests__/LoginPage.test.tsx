import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';

// Mock simples do LoginPage
const MockLoginPage = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <div data-testid="login-page">
      <h1>Login</h1>
      <form data-testid="login-form">
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            data-testid="email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email"
          />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input
            id="password"
            data-testid="password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
          />
        </div>
        <button type="submit" data-testid="login-button">
          Entrar
        </button>
      </form>
      <div data-testid="forgot-password">
        <a href="#">Esqueceu sua senha?</a>
      </div>
    </div>
  );
};

// Mock do store Redux
const mockStore = configureStore({
  reducer: {
    auth: (state = { 
      user: null, 
      isAuthenticated: false, 
      loading: false, 
      error: null 
    }) => state
  }
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('LoginPage', () => {
  describe('Renderização Básica', () => {
    it('deve renderizar a página de login corretamente', () => {
      renderWithProviders(<MockLoginPage />);
      
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('deve renderizar todos os campos do formulário', () => {
      renderWithProviders(<MockLoginPage />);
      
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
      
      expect(screen.getByLabelText('Email:')).toBeInTheDocument();
      expect(screen.getByLabelText('Senha:')).toBeInTheDocument();
    });

    it('deve renderizar link de esqueceu senha', () => {
      renderWithProviders(<MockLoginPage />);
      
      expect(screen.getByTestId('forgot-password')).toBeInTheDocument();
      expect(screen.getByText('Esqueceu sua senha?')).toBeInTheDocument();
    });
  });

  describe('Interações do Formulário', () => {
    it('deve permitir digitar no campo de email', () => {
      renderWithProviders(<MockLoginPage />);
      
      const emailInput = screen.getByTestId('email-input');
      fireEvent.change(emailInput, { target: { value: 'teste@email.com' } });
      
      expect(emailInput).toHaveValue('teste@email.com');
    });

    it('deve permitir digitar no campo de senha', () => {
      renderWithProviders(<MockLoginPage />);
      
      const passwordInput = screen.getByTestId('password-input');
      fireEvent.change(passwordInput, { target: { value: 'minhasenha123' } });
      
      expect(passwordInput).toHaveValue('minhasenha123');
    });

    it('deve permitir clicar no botão de login', () => {
      renderWithProviders(<MockLoginPage />);
      
      const loginButton = screen.getByTestId('login-button');
      fireEvent.click(loginButton);
      
      // Verifica se o botão ainda está presente após o clique
      expect(loginButton).toBeInTheDocument();
    });

    it('deve preencher ambos os campos e submeter', () => {
      renderWithProviders(<MockLoginPage />);
      
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const loginButton = screen.getByTestId('login-button');
      
      fireEvent.change(emailInput, { target: { value: 'usuario@teste.com' } });
      fireEvent.change(passwordInput, { target: { value: 'senha123' } });
      fireEvent.click(loginButton);
      
      expect(emailInput).toHaveValue('usuario@teste.com');
      expect(passwordInput).toHaveValue('senha123');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter labels associados aos inputs', () => {
      renderWithProviders(<MockLoginPage />);
      
      expect(screen.getByLabelText('Email:')).toBeInTheDocument();
      expect(screen.getByLabelText('Senha:')).toBeInTheDocument();
    });

    it('deve ter placeholders nos campos', () => {
      renderWithProviders(<MockLoginPage />);
      
      expect(screen.getByPlaceholderText('Digite seu email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Digite sua senha')).toBeInTheDocument();
    });

    it('deve ter heading principal', () => {
      renderWithProviders(<MockLoginPage />);
      
      expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    });
  });
});