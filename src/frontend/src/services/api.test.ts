import axios from 'axios';
import { authApi, dashboardApi } from './api';

// Mock do axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock da resposta do axios
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
};

mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authApi', () => {
    test('login should make POST request to /auth/login', async () => {
      const mockResponse = {
        data: {
          access_token: 'mock-token',
          user: { id: 1, username: 'testuser' },
        },
      };
      
      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      
      const credentials = { login: 'testuser', senha: 'password' };
      const result = await authApi.login(credentials);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse.data);
    });

    test('me should make GET request to /auth/me', async () => {
      const mockResponse = {
        data: { id: 1, username: 'testuser' },
      };
      
      mockAxiosInstance.get.mockResolvedValue(mockResponse);
      
      const result = await authApi.me();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse.data);
    });

    test('logout should make POST request to /auth/logout', async () => {
      const mockResponse = { data: { message: 'Logout successful' } };
      
      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      
      const result = await authApi.logout();
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('dashboardApi', () => {
    test('getResumo should make GET request to /dashboard/resumo', async () => {
      const mockResponse = {
        data: {
          totalReceitas: 1000,
          totalDespesas: 500,
          saldoAtual: 500,
        },
      };
      
      mockAxiosInstance.get.mockResolvedValue(mockResponse);
      
      const result = await dashboardApi.getResumo();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dashboard/resumo');
      expect(result).toEqual(mockResponse.data);
    });

    test('getFluxoCaixa should make GET request to /dashboard/fluxo-caixa', async () => {
      const mockResponse = {
        data: [
          { data: '2024-01-01', entrada: 1000, saida: 500 },
          { data: '2024-01-02', entrada: 800, saida: 300 },
        ],
      };
      
      mockAxiosInstance.get.mockResolvedValue(mockResponse);
      
      const result = await dashboardApi.getFluxoCaixa();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dashboard/fluxo-caixa');
      expect(result).toEqual(mockResponse.data);
    });
  });
});