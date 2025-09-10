import axios, { AxiosResponse } from 'axios';
import { config } from '../config/environment';

// API Configuration from centralized config
const { apiUrl: API_BASE_URL, environment, enableLogs, apiTimeout } = config;
const IS_PRODUCTION = environment === 'production';

// Logging utility for development
const log = (...args: any[]) => {
  if (enableLogs) {
    console.log('[API]', ...args);
  }
};

// Configuração do cliente Axios
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log da configuração inicial
log('API Client configured:', {
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: apiTimeout,
  environment: environment
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    log('Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    log('Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    log('Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    log('Response Error:', status, url, error.message);
    
    if (status === 401) {
      // Token expirado ou inválido
      log('Authentication failed, redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (status >= 500 && IS_PRODUCTION) {
      // Em produção, log erros de servidor sem expor detalhes
      console.error('Server error occurred. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

// Tipos para API
export interface LoginRequest {
  login: string;
  senha: string;
}

export interface UserInfo {
  cod_funcionario: number;
  nome: string;
  login: string;
  email?: string;
  cod_setor?: number;
  cod_funcao?: number;
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_info: UserInfo;
}

// Serviços de API
export const authApi = {
  login: (credentials: LoginRequest): Promise<AxiosResponse<LoginResponse>> =>
    apiClient.post('/auth/login', credentials),
  
  me: (): Promise<AxiosResponse<UserInfo>> =>
    apiClient.get('/auth/me'),
  
  logout: (): Promise<AxiosResponse> =>
    apiClient.post('/auth/logout'),
  
  validate: (): Promise<AxiosResponse> =>
    apiClient.get('/auth/validate'),
};

export const dashboardApi = {
  getResumo: (): Promise<AxiosResponse> =>
    apiClient.get('/dashboard/resumo'),
  
  getFluxoCaixa: (): Promise<AxiosResponse> =>
    apiClient.get('/dashboard/fluxo-caixa'),
};