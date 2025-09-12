import { apiClient } from './api';
import { ClienteResponse } from './clientesApi';

type Cliente = ClienteResponse;

export interface CreateClienteRequest {
  nome: string;
  razao_social?: string;
  tipo_pessoa: 'fisica' | 'juridica';
  cpf_cnpj: string;
  email?: string;
  telefone?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  ativo: boolean;
}

export interface UpdateClienteRequest extends Partial<CreateClienteRequest> {
  id: number;
}

export interface ClienteListResponse {
  clientes: Cliente[];
  total: number;
  page: number;
  per_page: number;
}

export const clienteService = {
  // Listar clientes com paginação
  async list(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    tipo_pessoa?: 'fisica' | 'juridica';
    ativo?: boolean;
  }): Promise<ClienteListResponse> {
    const response = await apiClient.get('/clientes', { params });
    return response.data;
  },

  // Buscar cliente por ID
  async getById(id: number): Promise<Cliente> {
    const response = await apiClient.get(`/clientes/${id}`);
    return response.data;
  },

  // Criar novo cliente
  async create(data: CreateClienteRequest): Promise<Cliente> {
    const response = await apiClient.post('/clientes', data);
    return response.data;
  },

  // Atualizar cliente
  async update(id: number, data: Partial<CreateClienteRequest>): Promise<Cliente> {
    const response = await apiClient.put(`/clientes/${id}`, data);
    return response.data;
  },

  // Deletar cliente
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/clientes/${id}`);
  },

  // Buscar clientes por nome ou CPF/CNPJ
  async search(query: string): Promise<Cliente[]> {
    const response = await apiClient.get('/clientes/search', {
      params: { q: query }
    });
    return response.data;
  },

  // Verificar se CPF/CNPJ já existe
  async checkCpfCnpj(cpfCnpj: string, excludeId?: number): Promise<boolean> {
    const response = await apiClient.get('/clientes/check-cpf-cnpj', {
      params: { cpf_cnpj: cpfCnpj, exclude_id: excludeId }
    });
    return response.data.exists;
  }
};

export default clienteService;