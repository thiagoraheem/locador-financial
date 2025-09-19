import { configureStore } from '@reduxjs/toolkit';
import contasPagarReducer, {
  fetchContasPagar,
  createContaPagar,
  updateContaPagar,
  deleteContaPagar,
  payContaPagar,
  setFilters,
  clearFilters,
  setPagination,
  ContasPagarState
} from '../contasPagarSlice';
import { server } from '../../../setupTests';
import { rest } from 'msw';

// Mock data
const mockContasPagar = [
  {
    id: 1,
    descricao: 'Conta de Luz',
    valor: 150.00,
    vencimento: '2024-01-20',
    status: 'pendente',
    favorecido: 'Empresa de Energia'
  },
  {
    id: 2,
    descricao: 'Aluguel',
    valor: 1200.00,
    vencimento: '2024-01-15',
    status: 'pago',
    favorecido: 'Imobiliária XYZ'
  }
];

const initialState: ContasPagarState = {
  items: [],
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  }
};

describe('contasPagarSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        contasPagar: contasPagarReducer
      }
    });
  });

  describe('Initial State', () => {
    it('deve ter estado inicial correto', () => {
      // Arrange & Act
      const state = store.getState().contasPagar;

      // Assert
      expect(state).toEqual(initialState);
    });
  });

  describe('Synchronous Actions', () => {
    describe('setFilters', () => {
      it('deve definir filtros corretamente', () => {
        // Arrange
        const filters = { status: 'pendente', favorecido: 'Empresa' };

        // Act
        store.dispatch(setFilters(filters));
        const state = store.getState().contasPagar;

        // Assert
        expect(state.filters).toEqual(filters);
      });

      it('deve mesclar filtros existentes', () => {
        // Arrange
        store.dispatch(setFilters({ status: 'pendente' }));

        // Act
        store.dispatch(setFilters({ favorecido: 'Empresa' }));
        const state = store.getState().contasPagar;

        // Assert
        expect(state.filters).toEqual({
          status: 'pendente',
          favorecido: 'Empresa'
        });
      });
    });

    describe('clearFilters', () => {
      it('deve limpar todos os filtros', () => {
        // Arrange
        store.dispatch(setFilters({ status: 'pendente', favorecido: 'Empresa' }));

        // Act
        store.dispatch(clearFilters());
        const state = store.getState().contasPagar;

        // Assert
        expect(state.filters).toEqual({});
      });
    });

    describe('setPagination', () => {
      it('deve definir paginação corretamente', () => {
        // Arrange
        const pagination = { page: 2, limit: 20, total: 100 };

        // Act
        store.dispatch(setPagination(pagination));
        const state = store.getState().contasPagar;

        // Assert
        expect(state.pagination).toEqual(pagination);
      });

      it('deve mesclar com paginação existente', () => {
        // Arrange
        store.dispatch(setPagination({ page: 1, limit: 10, total: 50 }));

        // Act
        store.dispatch(setPagination({ page: 3 }));
        const state = store.getState().contasPagar;

        // Assert
        expect(state.pagination).toEqual({
          page: 3,
          limit: 10,
          total: 50
        });
      });
    });
  });

  describe('Async Actions', () => {
    describe('fetchContasPagar', () => {
      it('deve buscar contas com sucesso', async () => {
        // Arrange
        server.use(
          rest.get('/api/contas-pagar', (req, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.json({
                items: mockContasPagar,
                total: mockContasPagar.length
              })
            );
          })
        );

        // Act
        await store.dispatch(fetchContasPagar({ page: 1, limit: 10 }));
        const state = store.getState().contasPagar;

        // Assert
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        expect(state.items).toEqual(mockContasPagar);
        expect(state.pagination.total).toBe(mockContasPagar.length);
      });

      it('deve definir loading como true durante requisição', () => {
        // Arrange
        server.use(
          rest.get('/api/contas-pagar', (req, res, ctx) => {
            return res(ctx.delay(1000), ctx.status(200), ctx.json({ items: [], total: 0 }));
          })
        );

        // Act
        store.dispatch(fetchContasPagar({ page: 1, limit: 10 }));
        const state = store.getState().contasPagar;

        // Assert
        expect(state.loading).toBe(true);
      });

      it('deve tratar erro na requisição', async () => {
        // Arrange
        const errorMessage = 'Erro ao buscar contas';
        server.use(
          rest.get('/api/contas-pagar', (req, res, ctx) => {
            return res(
              ctx.status(500),
              ctx.json({ message: errorMessage })
            );
          })
        );

        // Act
        await store.dispatch(fetchContasPagar({ page: 1, limit: 10 }));
        const state = store.getState().contasPagar;

        // Assert
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
        expect(state.items).toEqual([]);
      });

      it('deve aplicar filtros na requisição', async () => {
        // Arrange
        let requestUrl = '';
        server.use(
          rest.get('/api/contas-pagar', (req, res, ctx) => {
            requestUrl = req.url.toString();
            return res(
              ctx.status(200),
              ctx.json({ items: [], total: 0 })
            );
          })
        );

        store.dispatch(setFilters({ status: 'pendente' }));

        // Act
        await store.dispatch(fetchContasPagar({ page: 1, limit: 10 }));

        // Assert
        expect(requestUrl).toContain('status=pendente');
      });
    });

    describe('createContaPagar', () => {
      it('deve criar conta com sucesso', async () => {
        // Arrange
        const newConta = {
          descricao: 'Nova Conta',
          valor: 100.00,
          vencimento: '2024-02-01',
          favorecido: 'Fornecedor'
        };

        const createdConta = { id: 3, ...newConta, status: 'pendente' };

        server.use(
          rest.post('/api/contas-pagar', (req, res, ctx) => {
            return res(
              ctx.status(201),
              ctx.json(createdConta)
            );
          })
        );

        // Act
        await store.dispatch(createContaPagar(newConta));
        const state = store.getState().contasPagar;

        // Assert
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        expect(state.items).toContainEqual(createdConta);
      });

      it('deve tratar erro na criação', async () => {
        // Arrange
        const errorMessage = 'Erro de validação';
        server.use(
          rest.post('/api/contas-pagar', (req, res, ctx) => {
            return res(
              ctx.status(400),
              ctx.json({ message: errorMessage })
            );
          })
        );

        const newConta = {
          descricao: '',
          valor: 0,
          vencimento: '',
          favorecido: ''
        };

        // Act
        await store.dispatch(createContaPagar(newConta));
        const state = store.getState().contasPagar;

        // Assert
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });

    describe('updateContaPagar', () => {
      it('deve atualizar conta com sucesso', async () => {
        // Arrange
        store.dispatch({ type: 'contasPagar/fetchContasPagar/fulfilled', payload: { items: mockContasPagar, total: 2 } });
        
        const updatedData = {
          id: 1,
          descricao: 'Conta de Luz Atualizada',
          valor: 200.00,
          vencimento: '2024-01-25',
          favorecido: 'Nova Empresa'
        };

        server.use(
          rest.put('/api/contas-pagar/1', (req, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.json({ ...updatedData, status: 'pendente' })
            );
          })
        );

        // Act
        await store.dispatch(updateContaPagar(updatedData));
        const state = store.getState().contasPagar;

        // Assert
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        
        const updatedItem = state.items.find(item => item.id === 1);
        expect(updatedItem?.descricao).toBe('Conta de Luz Atualizada');
        expect(updatedItem?.valor).toBe(200.00);
      });

      it('deve tratar erro na atualização', async () => {
        // Arrange
        const errorMessage = 'Conta não encontrada';
        server.use(
          rest.put('/api/contas-pagar/999', (req, res, ctx) => {
            return res(
              ctx.status(404),
              ctx.json({ message: errorMessage })
            );
          })
        );

        const updatedData = {
          id: 999,
          descricao: 'Conta Inexistente',
          valor: 100.00,
          vencimento: '2024-01-01',
          favorecido: 'Fornecedor'
        };

        // Act
        await store.dispatch(updateContaPagar(updatedData));
        const state = store.getState().contasPagar;

        // Assert
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });

    describe('deleteContaPagar', () => {
      it('deve excluir conta com sucesso', async () => {
        // Arrange
        store.dispatch({ type: 'contasPagar/fetchContasPagar/fulfilled', payload: { items: mockContasPagar, total: 2 } });
        
        server.use(
          rest.delete('/api/contas-pagar/1', (req, res, ctx) => {
            return res(ctx.status(204));
          })
        );

        // Act
        await store.dispatch(deleteContaPagar(1));
        const state = store.getState().contasPagar;

        // Assert
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        expect(state.items.find(item => item.id === 1)).toBeUndefined();
        expect(state.items).toHaveLength(1);
      });

      it('deve tratar erro na exclusão', async () => {
        // Arrange
        const errorMessage = 'Não é possível excluir conta paga';
        server.use(
          rest.delete('/api/contas-pagar/1', (req, res, ctx) => {
            return res(
              ctx.status(400),
              ctx.json({ message: errorMessage })
            );
          })
        );

        // Act
        await store.dispatch(deleteContaPagar(1));
        const state = store.getState().contasPagar;

        // Assert
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });

    describe('payContaPagar', () => {
      it('deve marcar conta como paga com sucesso', async () => {
        // Arrange
        store.dispatch({ type: 'contasPagar/fetchContasPagar/fulfilled', payload: { items: mockContasPagar, total: 2 } });
        
        server.use(
          rest.patch('/api/contas-pagar/1/pay', (req, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.json({ ...mockContasPagar[0], status: 'pago' })
            );
          })
        );

        // Act
        await store.dispatch(payContaPagar(1));
        const state = store.getState().contasPagar;

        // Assert
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
        
        const paidItem = state.items.find(item => item.id === 1);
        expect(paidItem?.status).toBe('pago');
      });

      it('deve tratar erro ao marcar como pago', async () => {
        // Arrange
        const errorMessage = 'Conta já está paga';
        server.use(
          rest.patch('/api/contas-pagar/1/pay', (req, res, ctx) => {
            return res(
              ctx.status(400),
              ctx.json({ message: errorMessage })
            );
          })
        );

        // Act
        await store.dispatch(payContaPagar(1));
        const state = store.getState().contasPagar;

        // Assert
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });
  });

  describe('Selectors', () => {
    it('deve selecionar contas pendentes', () => {
      // Arrange
      const stateWithData = {
        contasPagar: {
          ...initialState,
          items: mockContasPagar
        }
      };

      // Act
      const pendingContas = stateWithData.contasPagar.items.filter(conta => conta.status === 'pendente');

      // Assert
      expect(pendingContas).toHaveLength(1);
      expect(pendingContas[0].id).toBe(1);
    });

    it('deve calcular total de valores', () => {
      // Arrange
      const stateWithData = {
        contasPagar: {
          ...initialState,
          items: mockContasPagar
        }
      };

      // Act
      const totalValue = stateWithData.contasPagar.items.reduce((sum, conta) => sum + conta.valor, 0);

      // Assert
      expect(totalValue).toBe(1350.00);
    });

    it('deve filtrar contas por status', () => {
      // Arrange
      const stateWithData = {
        contasPagar: {
          ...initialState,
          items: mockContasPagar,
          filters: { status: 'pago' }
        }
      };

      // Act
      const filteredContas = stateWithData.contasPagar.items.filter(
        conta => conta.status === stateWithData.contasPagar.filters.status
      );

      // Assert
      expect(filteredContas).toHaveLength(1);
      expect(filteredContas[0].status).toBe('pago');
    });
  });

  describe('Error Handling', () => {
    it('deve limpar erro ao iniciar nova ação', async () => {
      // Arrange
      store.dispatch({ type: 'contasPagar/fetchContasPagar/rejected', payload: 'Erro anterior' });
      
      server.use(
        rest.get('/api/contas-pagar', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({ items: [], total: 0 })
          );
        })
      );

      // Act
      await store.dispatch(fetchContasPagar({ page: 1, limit: 10 }));
      const state = store.getState().contasPagar;

      // Assert
      expect(state.error).toBe(null);
    });
  });
});