import { apiClient } from './api';

export interface DashboardResumo {
  receitas: number;
  despesas: number;
  saldo: number;
  receitasPendentes: number;
  despesasPendentes: number;
}

export interface FluxoCaixaItem {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export interface CategoriaResumo {
  nome: string;
  valor: number;
  percentual: number;
}

export interface VencimentoItem {
  id: number;
  descricao: string;
  valor: number;
  vencimento: string;
  tipo: 'receita' | 'despesa';
  status?: string;
  cliente?: string;
}

export interface FavorecidoItem {
  nome: string;
  valor: number;
  tipo: 'cliente' | 'fornecedor';
  total_lancamentos?: number;
}

export const dashboardService = {
  // Obter resumo financeiro do dashboard
  async getResumo(dataInicio?: string, dataFim?: string): Promise<DashboardResumo> {
    try {
      const response = await apiClient.get('/dashboard/resumo', {
        params: {
          data_inicio: dataInicio,
          data_fim: dataFim
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar resumo do dashboard:', error);
      // Fallback com dados mockados em caso de erro
      return {
        receitas: 15420.50,
        despesas: 8750.30,
        saldo: 6670.20,
        receitasPendentes: 2340.00,
        despesasPendentes: 1890.00
      };
    }
  },

  // Obter dados do fluxo de caixa
  async getFluxoCaixa(meses?: number): Promise<FluxoCaixaItem[]> {
    try {
      const response = await apiClient.get('/dashboard/fluxo-caixa', {
        params: { meses: meses || 6 }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar fluxo de caixa:', error);
      // Fallback com dados mockados
      return [
        { mes: 'Jan', receitas: 12000, despesas: 8000, saldo: 4000 },
        { mes: 'Fev', receitas: 15000, despesas: 9500, saldo: 5500 },
        { mes: 'Mar', receitas: 13500, despesas: 7800, saldo: 5700 },
        { mes: 'Abr', receitas: 16200, despesas: 10200, saldo: 6000 },
        { mes: 'Mai', receitas: 14800, despesas: 8900, saldo: 5900 },
        { mes: 'Jun', receitas: 17500, despesas: 11200, saldo: 6300 }
      ];
    }
  },

  // Obter resumo por categorias
  async getCategorias(tipo?: 'receita' | 'despesa', limite?: number): Promise<CategoriaResumo[]> {
    try {
      const response = await apiClient.get('/dashboard/categorias', {
        params: {
          tipo,
          limite: limite || 10
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      // Fallback com dados mockados
      return [
        { nome: 'Aluguel', valor: 4500, percentual: 35 },
        { nome: 'Manutenção', valor: 2800, percentual: 22 },
        { nome: 'Impostos', valor: 1950, percentual: 15 },
        { nome: 'Seguros', valor: 1200, percentual: 9 },
        { nome: 'Outros', valor: 2400, percentual: 19 }
      ];
    }
  },

  // Obter próximos vencimentos
  async getVencimentos(dias?: number, limite?: number): Promise<VencimentoItem[]> {
    try {
      const response = await apiClient.get('/dashboard/vencimentos', {
        params: {
          dias: dias || 30,
          limite: limite || 10
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar vencimentos:', error);
      // Fallback com dados mockados
      return [
        { id: 1, descricao: 'Aluguel Apt 101', valor: 1200, vencimento: '2024-01-15', tipo: 'receita' },
        { id: 2, descricao: 'Conta de Luz', valor: 350, vencimento: '2024-01-18', tipo: 'despesa' },
        { id: 3, descricao: 'Aluguel Apt 205', valor: 1500, vencimento: '2024-01-20', tipo: 'receita' },
        { id: 4, descricao: 'Manutenção Elevador', valor: 800, vencimento: '2024-01-22', tipo: 'despesa' },
        { id: 5, descricao: 'IPTU', valor: 450, vencimento: '2024-01-25', tipo: 'despesa' }
      ];
    }
  },

  // Obter principais favorecidos (clientes/fornecedores)
  async getFavorecidos(limite?: number): Promise<FavorecidoItem[]> {
    try {
      const response = await apiClient.get('/dashboard/favorecidos', {
        params: { limite: limite || 10 }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar favorecidos:', error);
      // Fallback com dados mockados
      return [
        { nome: 'João Silva', valor: 1200, tipo: 'cliente' },
        { nome: 'Maria Santos', valor: 1500, tipo: 'cliente' },
        { nome: 'Empresa XYZ Ltda', valor: 800, tipo: 'fornecedor' },
        { nome: 'Construtora ABC', valor: 2200, tipo: 'fornecedor' },
        { nome: 'Pedro Oliveira', valor: 950, tipo: 'cliente' }
      ];
    }
  },

  // Obter todos os dados do dashboard de uma vez
  async getDashboardData(): Promise<{
    resumo: DashboardResumo;
    fluxoCaixa: FluxoCaixaItem[];
    categorias: CategoriaResumo[];
    vencimentos: VencimentoItem[];
    favorecidos: FavorecidoItem[];
  }> {
    try {
      const [resumo, fluxoCaixa, categorias, vencimentos, favorecidos] = await Promise.all([
        this.getResumo(),
        this.getFluxoCaixa(),
        this.getCategorias(),
        this.getVencimentos(),
        this.getFavorecidos()
      ]);

      return {
        resumo,
        fluxoCaixa: Array.isArray(fluxoCaixa) ? fluxoCaixa : [],
        categorias: Array.isArray(categorias) ? categorias : [],
        vencimentos: Array.isArray(vencimentos) ? vencimentos : [],
        favorecidos: Array.isArray(favorecidos) ? favorecidos : []
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      // Return safe fallback data structure
      return {
        resumo: {
          receitas: 0,
          despesas: 0,
          saldo: 0,
          receitasPendentes: 0,
          despesasPendentes: 0
        },
        fluxoCaixa: [],
        categorias: [],
        vencimentos: [],
        favorecidos: []
      };
    }
  }
};

export default dashboardService;