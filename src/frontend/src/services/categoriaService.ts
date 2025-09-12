import { apiClient } from './api';
import { CategoriaResponse } from './categoriasApi';

type Categoria = CategoriaResponse;

export interface CreateCategoriaRequest {
  nome: string;
  descricao?: string;
  tipo: 'receita' | 'despesa' | 'ambos';
  cor?: string;
  icone?: string;
  ativa: boolean;
  categoria_pai_id?: number;
}

export interface UpdateCategoriaRequest extends Partial<CreateCategoriaRequest> {
  id: number;
}

export interface CategoriaListResponse {
  categorias: Categoria[];
  total: number;
  page: number;
  per_page: number;
}

export interface CategoriaTreeNode extends Categoria {
  subcategorias?: CategoriaTreeNode[];
}

export const categoriaService = {
  // Listar categorias com paginação
  async list(params?: {
    page?: number;
    per_page?: number;
    tipo?: 'receita' | 'despesa' | 'ambos';
    ativa?: boolean;
    search?: string;
    categoria_pai_id?: number;
  }): Promise<CategoriaListResponse> {
    const response = await apiClient.get('/categorias', { params });
    return response.data;
  },

  // Buscar categoria por ID
  async getById(id: number): Promise<Categoria> {
    const response = await apiClient.get(`/categorias/${id}`);
    return response.data;
  },

  // Criar nova categoria
  async create(data: CreateCategoriaRequest): Promise<Categoria> {
    const response = await apiClient.post('/categorias', data);
    return response.data;
  },

  // Atualizar categoria
  async update(id: number, data: Partial<CreateCategoriaRequest>): Promise<Categoria> {
    const response = await apiClient.put(`/categorias/${id}`, data);
    return response.data;
  },

  // Deletar categoria
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/categorias/${id}`);
  },

  // Obter todas as categorias ativas (sem paginação)
  async getAtivas(tipo?: 'receita' | 'despesa'): Promise<Categoria[]> {
    const response = await apiClient.get('/categorias/ativas', {
      params: { tipo }
    });
    return response.data;
  },

  // Obter categorias em formato de árvore (com subcategorias)
  async getTree(tipo?: 'receita' | 'despesa'): Promise<CategoriaTreeNode[]> {
    const response = await apiClient.get('/categorias/tree', {
      params: { tipo }
    });
    return response.data;
  },

  // Obter subcategorias de uma categoria pai
  async getSubcategorias(categoriaPaiId: number): Promise<Categoria[]> {
    const response = await apiClient.get(`/categorias/${categoriaPaiId}/subcategorias`);
    return response.data;
  },

  // Buscar categorias por nome
  async search(query: string, tipo?: 'receita' | 'despesa'): Promise<Categoria[]> {
    const response = await apiClient.get('/categorias/search', {
      params: { q: query, tipo }
    });
    return response.data;
  },

  // Verificar se categoria pode ser deletada (não tem lançamentos associados)
  async canDelete(id: number): Promise<{
    can_delete: boolean;
    lancamentos_count: number;
    message?: string;
  }> {
    const response = await apiClient.get(`/categorias/${id}/can-delete`);
    return response.data;
  },

  // Obter estatísticas de uso da categoria
  async getEstatisticas(id: number, dataInicio?: string, dataFim?: string): Promise<{
    total_lancamentos: number;
    total_valor: number;
    media_valor: number;
    ultimo_uso: string;
  }> {
    const response = await apiClient.get(`/categorias/${id}/estatisticas`, {
      params: {
        data_inicio: dataInicio,
        data_fim: dataFim
      }
    });
    return response.data;
  },

  // Mover categoria para outra categoria pai
  async mover(id: number, novaCategoriaPaiId?: number): Promise<Categoria> {
    const response = await apiClient.patch(`/categorias/${id}/mover`, {
      nova_categoria_pai_id: novaCategoriaPaiId
    });
    return response.data;
  },

  // Obter categorias mais utilizadas
  async getMaisUtilizadas(limite?: number, tipo?: 'receita' | 'despesa'): Promise<Array<{
    categoria: Categoria;
    total_uso: number;
    total_valor: number;
  }>> {
    const response = await apiClient.get('/categorias/mais-utilizadas', {
      params: { limite: limite || 10, tipo }
    });
    return response.data;
  }
};

export default categoriaService;