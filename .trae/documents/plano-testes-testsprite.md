# Plano de Testes Abrangente - Locador Financial
## Framework TestSprite

## 1. Visão Geral do Plano de Testes

Este documento define uma estratégia abrangente de testes para o sistema Locador Financial, utilizando o framework TestSprite para garantir qualidade, confiabilidade e performance da aplicação financeira.

**Arquitetura do Sistema:**
- Backend: FastAPI + Python + SQL Server
- Frontend: React + TypeScript + Redux Toolkit
- Autenticação: JWT + OAuth2
- Deploy: Docker + Nginx

## 2. Configuração do Ambiente de Testes

### 2.1 Backend - Configuração TestSprite

```python
# conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import get_db, Base
from app.core.config import settings

# Configuração do banco de teste
SQLALCHEMY_DATABASE_URL = "mssql+pyodbc://test_user:test_pass@localhost:1433/test_locador_financial?driver=ODBC+Driver+17+for+SQL+Server"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db):
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]
```

### 2.2 Frontend - Configuração TestSprite

```typescript
// setupTests.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { server } from './src/__mocks__/server';

// Configuração do MSW para mocks de API
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

configure({ testIdAttribute: 'data-testid' });

// Mock do Redux Store
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { rootReducer } from './src/store';

export const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: options.preloadedState || {},
  });
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  
  return render(ui, { wrapper: Wrapper, ...options });
};
```

## 3. Testes de Backend

### 3.1 Testes de Endpoints - Autenticação

#### 3.1.1 POST /api/auth/login

**Cenários de Teste:**

```python
# test_auth.py
import pytest
from fastapi import status
from app.schemas.auth import UserLogin

class TestAuthLogin:
    
    def test_login_success(self, client, db_session):
        """Teste de login com credenciais válidas"""
        # Arrange
        user_data = {
            "username": "admin@locador.com",
            "password": "admin123"
        }
        
        # Act
        response = client.post("/api/auth/login", json=user_data)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
    
    def test_login_invalid_credentials(self, client):
        """Teste de login com credenciais inválidas"""
        # Arrange
        user_data = {
            "username": "invalid@email.com",
            "password": "wrongpassword"
        }
        
        # Act
        response = client.post("/api/auth/login", json=user_data)
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Invalid credentials" in response.json()["detail"]
    
    def test_login_missing_fields(self, client):
        """Teste de login com campos obrigatórios ausentes"""
        # Arrange
        user_data = {"username": "admin@locador.com"}
        
        # Act
        response = client.post("/api/auth/login", json=user_data)
        
        # Assert
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_login_sql_injection_attempt(self, client):
        """Teste de segurança contra SQL Injection"""
        # Arrange
        user_data = {
            "username": "admin'; DROP TABLE users; --",
            "password": "password"
        }
        
        # Act
        response = client.post("/api/auth/login", json=user_data)
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
```

### 3.2 Testes de Endpoints - Lançamentos

#### 3.2.1 GET /api/lancamentos/dia

```python
# test_lancamentos.py
import pytest
from datetime import date, datetime
from fastapi import status

class TestLancamentosDia:
    
    def test_get_lancamentos_dia_success(self, client, authenticated_user, sample_lancamentos):
        """Teste de consulta de lançamentos do dia com sucesso"""
        # Arrange
        test_date = "2025-01-18"
        headers = {"Authorization": f"Bearer {authenticated_user['token']}"}
        
        # Act
        response = client.get(f"/api/lancamentos/dia?data={test_date}", headers=headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "lancamentos" in data
        assert "resumo" in data
        assert "graficoFormasPagamento" in data
        assert isinstance(data["lancamentos"], list)
        
        # Validar estrutura do resumo
        resumo = data["resumo"]
        assert "totalEntradas" in resumo
        assert "totalSaidas" in resumo
        assert "saldoDia" in resumo
        assert "totalPendente" in resumo
    
    def test_get_lancamentos_dia_with_filters(self, client, authenticated_user):
        """Teste de consulta com filtros aplicados"""
        # Arrange
        params = {
            "data": "2025-01-18",
            "valorMin": 1000.00,
            "valorMax": 10000.00,
            "tipoLancamento": "LANCAMENTOS"
        }
        headers = {"Authorization": f"Bearer {authenticated_user['token']}"}
        
        # Act
        response = client.get("/api/lancamentos/dia", params=params, headers=headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Validar que os filtros foram aplicados
        for lancamento in data["lancamentos"]:
            assert params["valorMin"] <= lancamento["montante"] <= params["valorMax"]
    
    def test_get_lancamentos_dia_unauthorized(self, client):
        """Teste de acesso sem autenticação"""
        # Act
        response = client.get("/api/lancamentos/dia?data=2025-01-18")
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_lancamentos_dia_invalid_date_format(self, client, authenticated_user):
        """Teste com formato de data inválido"""
        # Arrange
        headers = {"Authorization": f"Bearer {authenticated_user['token']}"}
        
        # Act
        response = client.get("/api/lancamentos/dia?data=18-01-2025", headers=headers)
        
        # Assert
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
```

### 3.3 Testes de Integração - Services

```python
# test_lancamento_service.py
import pytest
from app.services.lancamento_service import LancamentoService
from app.models.lancamento import Lancamento
from datetime import date

class TestLancamentoService:
    
    def test_get_lancamentos_by_date_integration(self, db_session, sample_data):
        """Teste de integração do serviço de lançamentos"""
        # Arrange
        service = LancamentoService(db_session)
        test_date = date(2025, 1, 18)
        
        # Act
        result = service.get_lancamentos_by_date(test_date)
        
        # Assert
        assert "lancamentos" in result
        assert "resumo" in result
        assert len(result["lancamentos"]) > 0
        
        # Validar cálculos do resumo
        resumo = result["resumo"]
        total_calculado = sum(l["montante"] for l in result["lancamentos"] if l["tipoMovimento"] == "Crédito")
        assert resumo["totalEntradas"] == total_calculado
    
    def test_confirmar_pagamentos_multiplos_integration(self, db_session, sample_lancamentos):
        """Teste de integração para confirmação múltipla de pagamentos"""
        # Arrange
        service = LancamentoService(db_session)
        lancamento_ids = [1, 2, 3]
        data_confirmacao = date.today()
        
        # Act
        result = service.confirmar_pagamentos_multiplos(lancamento_ids, data_confirmacao)
        
        # Assert
        assert result["success"] is True
        assert result["confirmed_count"] == len(lancamento_ids)
        
        # Verificar se os status foram atualizados no banco
        for lancamento_id in lancamento_ids:
            lancamento = db_session.query(Lancamento).filter(Lancamento.id == lancamento_id).first()
            assert lancamento.status == "Confirmado"
```

### 3.4 Testes de Performance e Carga

```python
# test_performance.py
import pytest
import time
from concurrent.futures import ThreadPoolExecutor

class TestPerformance:
    
    def test_lancamentos_dia_response_time(self, client, authenticated_user):
        """Teste de tempo de resposta da consulta de lançamentos"""
        # Arrange
        headers = {"Authorization": f"Bearer {authenticated_user['token']}"}
        
        # Act
        start_time = time.time()
        response = client.get("/api/lancamentos/dia?data=2025-01-18", headers=headers)
        end_time = time.time()
        
        # Assert
        assert response.status_code == 200
        response_time = end_time - start_time
        assert response_time < 2.0  # Máximo 2 segundos
    
    def test_concurrent_requests_load(self, client, authenticated_user):
        """Teste de carga com requisições concorrentes"""
        # Arrange
        headers = {"Authorization": f"Bearer {authenticated_user['token']}"}
        num_requests = 50
        
        def make_request():
            return client.get("/api/lancamentos/dia?data=2025-01-18", headers=headers)
        
        # Act
        start_time = time.time()
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(num_requests)]
            responses = [future.result() for future in futures]
        end_time = time.time()
        
        # Assert
        successful_responses = [r for r in responses if r.status_code == 200]
        assert len(successful_responses) >= num_requests * 0.95  # 95% de sucesso
        
        total_time = end_time - start_time
        avg_response_time = total_time / num_requests
        assert avg_response_time < 1.0  # Média menor que 1 segundo
```

## 4. Testes de Frontend

### 4.1 Testes de Componentes Individuais

#### 4.1.1 Teste do Componente ContaPagarForm

```typescript
// ContaPagarForm.test.tsx
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContaPagarForm } from '../forms/ContaPagarForm';
import { renderWithProviders } from '../../__tests__/test-utils';

describe('ContaPagarForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar todos os campos obrigatórios', () => {
    // Arrange & Act
    renderWithProviders(
      <ContaPagarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    // Assert
    expect(screen.getByLabelText(/favorecido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data de vencimento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(
      <ContaPagarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    // Act
    const submitButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/favorecido é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/valor é obrigatório/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('deve submeter o formulário com dados válidos', async () => {
    // Arrange
    const user = userEvent.setup();
    const formData = {
      favorecido: 'Fornecedor Teste',
      valor: '1500.00',
      dataVencimento: '2025-02-15',
      categoria: 'Despesas Operacionais',
      descricao: 'Pagamento de serviços'
    };

    renderWithProviders(
      <ContaPagarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    // Act
    await user.type(screen.getByLabelText(/favorecido/i), formData.favorecido);
    await user.type(screen.getByLabelText(/valor/i), formData.valor);
    await user.type(screen.getByLabelText(/data de vencimento/i), formData.dataVencimento);
    await user.selectOptions(screen.getByLabelText(/categoria/i), formData.categoria);
    await user.type(screen.getByLabelText(/descrição/i), formData.descricao);
    
    const submitButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        favorecido: formData.favorecido,
        valor: parseFloat(formData.valor),
        dataVencimento: formData.dataVencimento,
        categoria: formData.categoria,
        descricao: formData.descricao
      }));
    });
  });

  it('deve formatar valor monetário corretamente', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(
      <ContaPagarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    // Act
    const valorInput = screen.getByLabelText(/valor/i);
    await user.type(valorInput, '123456');

    // Assert
    expect(valorInput).toHaveValue('R$ 1.234,56');
  });
});
```

#### 4.1.2 Teste do Componente ContasPagarTable

```typescript
// ContasPagarTable.test.tsx
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContasPagarTable } from '../tables/ContasPagarTable';
import { renderWithProviders } from '../../__tests__/test-utils';

const mockContasPagar = [
  {
    id: 1,
    favorecido: 'Fornecedor A',
    valor: 1500.00,
    dataVencimento: '2025-02-15',
    status: 'Pendente',
    categoria: 'Despesas Operacionais'
  },
  {
    id: 2,
    favorecido: 'Fornecedor B',
    valor: 2500.00,
    dataVencimento: '2025-02-20',
    status: 'Pago',
    categoria: 'Materiais'
  }
];

describe('ContasPagarTable', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnPay = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar todas as contas a pagar', () => {
    // Arrange & Act
    renderWithProviders(
      <ContasPagarTable 
        data={mockContasPagar}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPay={mockOnPay}
      />
    );

    // Assert
    expect(screen.getByText('Fornecedor A')).toBeInTheDocument();
    expect(screen.getByText('Fornecedor B')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 2.500,00')).toBeInTheDocument();
  });

  it('deve permitir ordenação por colunas', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(
      <ContasPagarTable 
        data={mockContasPagar}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPay={mockOnPay}
      />
    );

    // Act
    const valorHeader = screen.getByRole('columnheader', { name: /valor/i });
    await user.click(valorHeader);

    // Assert
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('R$ 1.500,00');
    expect(rows[2]).toHaveTextContent('R$ 2.500,00');
  });

  it('deve filtrar contas por status', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(
      <ContasPagarTable 
        data={mockContasPagar}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPay={mockOnPay}
      />
    );

    // Act
    const statusFilter = screen.getByRole('combobox', { name: /filtrar por status/i });
    await user.selectOptions(statusFilter, 'Pendente');

    // Assert
    expect(screen.getByText('Fornecedor A')).toBeInTheDocument();
    expect(screen.queryByText('Fornecedor B')).not.toBeInTheDocument();
  });

  it('deve chamar função de pagamento ao clicar no botão pagar', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(
      <ContasPagarTable 
        data={mockContasPagar}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onPay={mockOnPay}
      />
    );

    // Act
    const payButton = screen.getAllByRole('button', { name: /pagar/i })[0];
    await user.click(payButton);

    // Assert
    expect(mockOnPay).toHaveBeenCalledWith(1);
  });
});
```

### 4.2 Testes de Integração - Redux

```typescript
// contasPagarSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import contasPagarReducer, {
  fetchContasPagar,
  createContaPagar,
  updateContaPagar,
  deleteContaPagar
} from '../slices/contasPagarSlice';
import { server } from '../../__mocks__/server';
import { rest } from 'msw';

describe('contasPagarSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        contasPagar: contasPagarReducer
      }
    });
  });

  describe('fetchContasPagar', () => {
    it('deve buscar contas a pagar com sucesso', async () => {
      // Arrange
      const mockResponse = {
        data: [
          { id: 1, favorecido: 'Fornecedor A', valor: 1500.00 },
          { id: 2, favorecido: 'Fornecedor B', valor: 2500.00 }
        ],
        total: 2
      };

      server.use(
        rest.get('/api/contas-pagar', (req, res, ctx) => {
          return res(ctx.json(mockResponse));
        })
      );

      // Act
      await store.dispatch(fetchContasPagar({ page: 1, limit: 10 }));

      // Assert
      const state = store.getState().contasPagar;
      expect(state.loading).toBe(false);
      expect(state.data).toEqual(mockResponse.data);
      expect(state.total).toBe(mockResponse.total);
      expect(state.error).toBeNull();
    });

    it('deve tratar erro na busca de contas a pagar', async () => {
      // Arrange
      server.use(
        rest.get('/api/contas-pagar', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ message: 'Erro interno do servidor' }));
        })
      );

      // Act
      await store.dispatch(fetchContasPagar({ page: 1, limit: 10 }));

      // Assert
      const state = store.getState().contasPagar;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Erro interno do servidor');
      expect(state.data).toEqual([]);
    });
  });

  describe('createContaPagar', () => {
    it('deve criar nova conta a pagar com sucesso', async () => {
      // Arrange
      const newConta = {
        favorecido: 'Novo Fornecedor',
        valor: 3000.00,
        dataVencimento: '2025-03-01',
        categoria: 'Serviços'
      };

      const mockResponse = { id: 3, ...newConta };

      server.use(
        rest.post('/api/contas-pagar', (req, res, ctx) => {
          return res(ctx.json(mockResponse));
        })
      );

      // Act
      await store.dispatch(createContaPagar(newConta));

      // Assert
      const state = store.getState().contasPagar;
      expect(state.loading).toBe(false);
      expect(state.data).toContainEqual(mockResponse);
      expect(state.error).toBeNull();
    });
  });
});
```

### 4.3 Testes de Fluxos de Usuário

```typescript
// userFlows.test.tsx
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { renderWithProviders } from '../__tests__/test-utils';
import { server } from '../__mocks__/server';
import { rest } from 'msw';

describe('Fluxos de Usuário', () => {
  describe('Fluxo de Autenticação', () => {
    it('deve realizar login completo e navegar para dashboard', async () => {
      // Arrange
      const user = userEvent.setup();
      
      server.use(
        rest.post('/api/auth/login', (req, res, ctx) => {
          return res(ctx.json({
            access_token: 'mock-token',
            token_type: 'bearer',
            expires_in: 3600
          }));
        }),
        rest.get('/api/dashboard/summary', (req, res, ctx) => {
          return res(ctx.json({
            totalReceitas: 50000,
            totalDespesas: 30000,
            saldoAtual: 20000
          }));
        })
      );

      renderWithProviders(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Act - Realizar login
      await user.type(screen.getByLabelText(/email/i), 'admin@locador.com');
      await user.type(screen.getByLabelText(/senha/i), 'admin123');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      // Assert - Verificar redirecionamento para dashboard
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/R\$ 50\.000,00/)).toBeInTheDocument();
      });
    });
  });

  describe('Fluxo de Gestão de Contas a Pagar', () => {
    it('deve criar, editar e excluir conta a pagar', async () => {
      // Arrange
      const user = userEvent.setup();
      
      // Mock das APIs
      server.use(
        rest.get('/api/contas-pagar', (req, res, ctx) => {
          return res(ctx.json({ data: [], total: 0 }));
        }),
        rest.post('/api/contas-pagar', (req, res, ctx) => {
          return res(ctx.json({
            id: 1,
            favorecido: 'Fornecedor Teste',
            valor: 1500.00,
            status: 'Pendente'
          }));
        }),
        rest.put('/api/contas-pagar/1', (req, res, ctx) => {
          return res(ctx.json({
            id: 1,
            favorecido: 'Fornecedor Teste Editado',
            valor: 2000.00,
            status: 'Pendente'
          }));
        }),
        rest.delete('/api/contas-pagar/1', (req, res, ctx) => {
          return res(ctx.status(204));
        })
      );

      renderWithProviders(
        <BrowserRouter>
          <App />
        </BrowserRouter>,
        {
          preloadedState: {
            auth: {
              isAuthenticated: true,
              token: 'mock-token',
              user: { id: 1, email: 'admin@locador.com' }
            }
          }
        }
      );

      // Act 1 - Navegar para contas a pagar
      await user.click(screen.getByRole('link', { name: /contas a pagar/i }));
      
      // Act 2 - Criar nova conta
      await user.click(screen.getByRole('button', { name: /nova conta/i }));
      await user.type(screen.getByLabelText(/favorecido/i), 'Fornecedor Teste');
      await user.type(screen.getByLabelText(/valor/i), '1500.00');
      await user.click(screen.getByRole('button', { name: /salvar/i }));

      // Assert 1 - Verificar criação
      await waitFor(() => {
        expect(screen.getByText('Fornecedor Teste')).toBeInTheDocument();
      });

      // Act 3 - Editar conta
      await user.click(screen.getByRole('button', { name: /editar/i }));
      await user.clear(screen.getByLabelText(/favorecido/i));
      await user.type(screen.getByLabelText(/favorecido/i), 'Fornecedor Teste Editado');
      await user.click(screen.getByRole('button', { name: /salvar/i }));

      // Assert 2 - Verificar edição
      await waitFor(() => {
        expect(screen.getByText('Fornecedor Teste Editado')).toBeInTheDocument();
      });

      // Act 4 - Excluir conta
      await user.click(screen.getByRole('button', { name: /excluir/i }));
      await user.click(screen.getByRole('button', { name: /confirmar/i }));

      // Assert 3 - Verificar exclusão
      await waitFor(() => {
        expect(screen.queryByText('Fornecedor Teste Editado')).not.toBeInTheDocument();
      });
    });
  });
});
```

### 4.4 Testes de Responsividade

```typescript
// responsiveness.test.tsx
import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../__tests__/test-utils';
import { Dashboard } from '../features/dashboard/pages/Dashboard';

describe('Testes de Responsividade', () => {
  const resizeWindow = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    window.dispatchEvent(new Event('resize'));
  };

  describe('Dashboard Responsivo', () => {
    it('deve adaptar layout para mobile (320px)', () => {
      // Arrange
      resizeWindow(320, 568);
      
      renderWithProviders(<Dashboard />);

      // Assert
      const container = screen.getByTestId('dashboard-container');
      expect(container).toHaveClass('grid-cols-1'); // Layout de coluna única
      
      // Verificar se sidebar está colapsada
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('w-16'); // Sidebar colapsada
    });

    it('deve adaptar layout para tablet (768px)', () => {
      // Arrange
      resizeWindow(768, 1024);
      
      renderWithProviders(<Dashboard />);

      // Assert
      const container = screen.getByTestId('dashboard-container');
      expect(container).toHaveClass('grid-cols-2'); // Layout de duas colunas
    });

    it('deve usar layout completo para desktop (1200px)', () => {
      // Arrange
      resizeWindow(1200, 800);
      
      renderWithProviders(<Dashboard />);

      // Assert
      const container = screen.getByTestId('dashboard-container');
      expect(container).toHaveClass('grid-cols-3'); // Layout de três colunas
      
      // Verificar se sidebar está expandida
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('w-64'); // Sidebar expandida
    });
  });

  describe('Tabelas Responsivas', () => {
    it('deve mostrar scroll horizontal em telas pequenas', () => {
      // Arrange
      resizeWindow(480, 800);
      
      renderWithProviders(<ContasPagarTable data={mockData} />);

      // Assert
      const tableContainer = screen.getByTestId('table-container');
      expect(tableContainer).toHaveClass('overflow-x-auto');
    });
  });
});
```

## 5. Critérios de Aceitação e Cobertura

### 5.1 Critérios de Aceitação

**Backend:**
- ✅ Cobertura de código mínima: 85%
- ✅ Todos os endpoints devem retornar códigos de status corretos
- ✅ Validação de schemas Pydantic em 100% dos endpoints
- ✅ Testes de segurança para todos os endpoints autenticados
- ✅ Tempo de resposta máximo: 2 segundos para consultas simples
- ✅ Suporte a 100 requisições concorrentes com 95% de sucesso

**Frontend:**
- ✅ Cobertura de código mínima: 80%
- ✅ Todos os componentes principais testados
- ✅ Fluxos de usuário críticos validados
- ✅ Responsividade testada para mobile, tablet e desktop
- ✅ Acessibilidade (WCAG 2.1 AA) validada
- ✅ Performance: First Contentful Paint < 2s

### 5.2 Métricas de Cobertura

```bash
# Backend - Executar testes com cobertura
pytest --cov=app --cov-report=html --cov-report=term-missing

# Frontend - Executar testes com cobertura
npm run test -- --coverage --watchAll=false
```

### 5.3 Automação CI/CD

```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      sqlserver:
        image: mcr.microsoft.com/mssql/server:2019-latest
        env:
          SA_PASSWORD: YourStrongPassword123!
          ACCEPT_EULA: Y
          MSSQL_DB: test_locador_financial
        options: >-
          --health-cmd "/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrongPassword123! -Q 'SELECT 1'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    
    - name: Install dependencies
      run: |
        cd src/backend
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        cd src/backend
        pytest --cov=app --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v1

  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd src/frontend
        npm ci
    
    - name: Run tests
      run: |
        cd src/frontend
        npm run test -- --coverage --watchAll=false
    
    - name: Upload coverage
      uses: codecov/codecov-action@v1
```

## 6. Fixtures e Mocks

### 6.1 Fixtures Backend

```python
# fixtures.py
import pytest
from datetime import date, datetime
from app.models.lancamento import Lancamento
from app.models.categoria import Categoria
from app.models.favorecido import Favorecido

@pytest.fixture
def sample_categoria(db_session):
    categoria = Categoria(
        nome="Despesas Operacionais",
        descricao="Categoria para despesas operacionais",
        ativo=True
    )
    db_session.add(categoria)
    db_session.commit()
    return categoria

@pytest.fixture
def sample_favorecido(db_session):
    favorecido = Favorecido(
        nome="Fornecedor Teste",
        documento="12.345.678/0001-90",
        email="fornecedor@teste.com",
        ativo=True
    )
    db_session.add(favorecido)
    db_session.commit()
    return favorecido

@pytest.fixture
def sample_lancamentos(db_session, sample_categoria, sample_favorecido):
    lancamentos = [
        Lancamento(
            data=date(2025, 1, 18),
            numeroDocumento="DOC001",
            montante=1500.00,
            comentario="Teste de lançamento 1",
            aVista=True,
            tipoMovimento="Débito",
            status="Pendente",
            favorecidoId=sample_favorecido.id,
            categoriaId=sample_categoria.id
        ),
        Lancamento(
            data=date(2025, 1, 18),
            numeroDocumento="DOC002",
            montante=2500.00,
            comentario="Teste de lançamento 2",
            aVista=False,
            tipoMovimento="Crédito",
            status="Confirmado",
            favorecidoId=sample_favorecido.id,
            categoriaId=sample_categoria.id
        )
    ]
    
    for lancamento in lancamentos:
        db_session.add(lancamento)
    db_session.commit()
    return lancamentos

@pytest.fixture
def authenticated_user(client):
    # Simular login e retornar token
    response = client.post("/api/auth/login", json={
        "username": "admin@locador.com",
        "password": "admin123"
    })
    return {
        "token": response.json()["access_token"],
        "user_id": 1
    }
```

### 6.2 Mocks Frontend

```typescript
// __mocks__/server.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        expires_in: 3600
      })
    );
  }),

  // Contas a pagar endpoints
  rest.get('/api/contas-pagar', (req, res, ctx) => {
    return res(
      ctx.json({
        data: [
          {
            id: 1,
            favorecido: 'Fornecedor Mock',
            valor: 1500.00,
            dataVencimento: '2025-02-15',
            status: 'Pendente',
            categoria: 'Despesas Operacionais'
          }
        ],
        total: 1
      })
    );
  }),

  rest.post('/api/contas-pagar', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 2,
        ...req.body,
        status: 'Pendente',
        createdAt: new Date().toISOString()
      })
    );
  }),

  // Dashboard endpoints
  rest.get('/api/dashboard/summary', (req, res, ctx) => {
    return res(
      ctx.json({
        totalReceitas: 50000,
        totalDespesas: 30000,
        saldoAtual: 20000,
        contasPendentes: 5
      })
    );
  })
];

export const server = setupServer(...handlers);
```

## 7. Execução dos Testes

### 7.1 Comandos Backend

```bash
# Executar todos os testes
pytest

# Executar testes com cobertura
pytest --cov=app --cov-report=html

# Executar testes específicos
pytest tests/test_auth.py

# Executar testes de performance
pytest tests/test_performance.py -v

# Executar testes em paralelo
pytest -n auto
```

### 7.2 Comandos Frontend

```bash
# Executar todos os testes
npm test

# Executar testes com cobertura
npm run test -- --coverage

# Executar testes específicos
npm test -- ContaPagarForm.test.tsx

# Executar testes em modo watch
npm test -- --watch

# Executar testes de integração
npm test -- --testPathPattern=integration
```

## 8. Relatórios e Monitoramento

### 8.1 Relatórios de Cobertura

- **Backend**: Relatórios HTML gerados em `htmlcov/`
- **Frontend**: Relatórios gerados em `coverage/`
- **Integração**: Codecov para monitoramento contínuo

### 8.2 Métricas de Qualidade

- **Tempo de execução**: < 5 minutos para suite completa
- **Taxa de sucesso**: > 99% em ambiente CI/CD
- **Cobertura mínima**: 85% backend, 80% frontend
- **Performance**: Testes de carga validando 100+ usuários simultâneos

---

**Documento criado em:** Janeiro 2025  
**Versão:** 1.0  
**Framework:** TestSprite  
**Projeto:** Locador Financial