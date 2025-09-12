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
      
      // Mapear os dados da API para a interface esperada pelo frontend
      const apiData = response.data;
      console.log('API Data received:', apiData);
      
      // Converter strings para números se necessário
      const parseNumber = (value: any): number => {
        if (typeof value === 'string') {
          // Remove vírgulas e converte para número
          return parseFloat(value.replace(',', '.')) || 0;
        }
        return Number(value) || 0;
      };
      
      const result = {
        receitas: parseNumber(apiData.total_receitas),
        despesas: parseNumber(apiData.total_despesas),
        saldo: parseNumber(apiData.saldo),
        receitasPendentes: parseNumber(apiData.receitas_pendentes || 0),
        despesasPendentes: parseNumber(apiData.despesas_pendentes || 0)
      };
      console.log('Mapped result:', result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar resumo do dashboard:', error);
      // Fallback com dados mockados em caso de erro
      const fallbackData = {
        receitas: 15420.50,
        despesas: 8750.30,
        saldo: 6670.20,
        receitasPendentes: 2340.00,
        despesasPendentes: 1890.00
      };
      console.log('Using fallback data:', fallbackData);
      return fallbackData;
    }
  },

  // Obter dados do fluxo de caixa
  async getFluxoCaixa(meses?: number): Promise<FluxoCaixaItem[]> {
    try {
      const response = await apiClient.get('/dashboard/fluxo-caixa', {
        params: { months: meses || 12 }
      });
      
      const apiData = response.data;
      console.log('Fluxo de caixa API response:', apiData);
      
      // O backend retorna: {periodo, entradas: [], saidas: [], saldo_mensal: []}
      // Precisamos mapear para: [{mes, receitas, despesas, saldo}]
      if (apiData && apiData.entradas && apiData.saidas && apiData.saldo_mensal) {
        const fluxoData: FluxoCaixaItem[] = [];
        
        // Criar um mapa para facilitar o acesso aos dados
        const entradasMap = new Map();
        const saidasMap = new Map();
        const saldoMap = new Map();
        
        apiData.entradas.forEach((item: any) => {
          entradasMap.set(item.mes_ano, item.valor);
        });
        
        apiData.saidas.forEach((item: any) => {
          saidasMap.set(item.mes_ano, item.valor);
        });
        
        apiData.saldo_mensal.forEach((item: any) => {
          saldoMap.set(item.mes_ano, item.saldo);
        });
        
        // Combinar todos os meses únicos
        const allMonths = new Set([
          ...apiData.entradas.map((item: any) => item.mes_ano),
          ...apiData.saidas.map((item: any) => item.mes_ano),
          ...apiData.saldo_mensal.map((item: any) => item.mes_ano)
        ]);
        
        // Converter para o formato esperado pelo frontend
         Array.from(allMonths).sort().forEach(mesAno => {
           const [mes] = mesAno.split('/');
           const mesNome = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                           'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][parseInt(mes) - 1];
          
          fluxoData.push({
            mes: mesNome,
            receitas: entradasMap.get(mesAno) || 0,
            despesas: saidasMap.get(mesAno) || 0,
            saldo: saldoMap.get(mesAno) || 0
          });
        });
        
        console.log('Mapped fluxo data:', fluxoData);
        return fluxoData;
      }
      
      return [];
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
      // Mapear tipo do frontend para o backend
      let tipoParam;
      if (tipo === 'receita') {
        tipoParam = 'S'; // Saída = Receita no backend
      } else if (tipo === 'despesa') {
        tipoParam = 'E'; // Entrada = Despesa no backend
      }
      
      const response = await apiClient.get('/dashboard/categorias', {
        params: {
          tipo: tipoParam,
          limite: limite || 10
        }
      });
      
      // Mapear resposta da API para o formato esperado pelo frontend
      const apiData = response.data;
      if (Array.isArray(apiData)) {
        return apiData.map(item => ({
          nome: item.categoria,
          valor: item.valor,
          percentual: 0 // Calcular percentual se necessário
        }));
      }
      
      return [];
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