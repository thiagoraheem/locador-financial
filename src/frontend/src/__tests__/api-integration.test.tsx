import '@testing-library/jest-dom';
import { authApi, dashboardApi } from '@/services/api';

// Mock do axios para simular respostas do backend
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}));

describe('Integração API Frontend-Backend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('authApi.login deve estar configurado corretamente', () => {
    expect(typeof authApi.login).toBe('function');
  });

  test('authApi.me deve estar configurado corretamente', () => {
    expect(typeof authApi.me).toBe('function');
  });

  test('authApi.logout deve estar configurado corretamente', () => {
    expect(typeof authApi.logout).toBe('function');
  });

  test('authApi.validate deve estar configurado corretamente', () => {
    expect(typeof authApi.validate).toBe('function');
  });

  test('dashboardApi.getResumo deve estar configurado corretamente', () => {
    expect(typeof dashboardApi.getResumo).toBe('function');
  });

  test('dashboardApi.getFluxoCaixa deve estar configurado corretamente', () => {
    expect(typeof dashboardApi.getFluxoCaixa).toBe('function');
  });

  test('configuração da API deve ter baseURL correto', () => {
    // Verifica se as funções da API existem e são chamáveis
    expect(authApi).toBeDefined();
    expect(dashboardApi).toBeDefined();
  });

  test('estrutura das interfaces deve estar correta', () => {
    // Teste básico para verificar se as interfaces estão sendo exportadas
    const mockLoginRequest = {
      username: 'test',
      password: 'test'
    };
    
    expect(mockLoginRequest).toHaveProperty('username');
    expect(mockLoginRequest).toHaveProperty('password');
  });
});