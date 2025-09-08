import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

// Configuração do cliente Axios
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
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

export const lancamentosApi = {
  list: (params?: any): Promise<AxiosResponse> =>
    apiClient.get('/lancamentos', { params }),
  
  get: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/lancamentos/${id}`),
  
  create: (data: any): Promise<AxiosResponse> =>
    apiClient.post('/lancamentos', data),
  
  update: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/lancamentos/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/lancamentos/${id}`),
  
  confirm: (id: number, confirmar: boolean): Promise<AxiosResponse> =>
    apiClient.patch(`/lancamentos/${id}/confirmar`, { confirmar }),
};

export const categoriasApi = {
  list: (params?: any): Promise<AxiosResponse> =>
    apiClient.get('/categorias', { params }),
  
  get: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/categorias/${id}`),
  
  create: (data: any): Promise<AxiosResponse> =>
    apiClient.post('/categorias', data),
  
  update: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/categorias/${id}`, data),
  
  delete: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/categorias/${id}`),
};