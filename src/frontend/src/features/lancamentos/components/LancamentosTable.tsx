import React from 'react';
import { LancamentoResponse } from '@/services/lancamentosApi';

export interface LancamentosTableProps {
  onEdit: (lancamento: LancamentoResponse) => void;
  onCreate: () => void;
}

export const LancamentosTable: React.FC<LancamentosTableProps> = ({ onEdit, onCreate }) => {
  // Mock data for now - will be replaced with real API data
  const mockLancamentos: LancamentoResponse[] = [
    {
      CodLancamento: 1,
      Data: '2024-01-15',
      DataEmissao: '2024-01-15',
      CodEmpresa: 1,
      idConta: 1,
      CodFavorecido: 1,
      CodCategoria: 1,
      Valor: 1500.00,
      IndMov: 'E',
      NumDocto: 'DOC001',
      CodFormaPagto: 1,
      FlgFrequencia: 'U',
      Observacao: 'Pagamento de aluguel',
      FlgConfirmacao: true,
      favorecido_nome: 'João Silva',
      categoria_nome: 'Aluguel',
      forma_pagamento_nome: 'Dinheiro',
      empresa_nome: 'Empresa 1',
      conta_nome: 'Conta Corrente',
      NomUsuario: 'Admin',
      DtCreate: '2024-01-15T10:00:00Z'
    },
    {
      CodLancamento: 2,
      Data: '2024-01-16',
      DataEmissao: '2024-01-16',
      CodEmpresa: 1,
      idConta: 1,
      CodFavorecido: 2,
      CodCategoria: 2,
      Valor: 250.00,
      IndMov: 'S',
      NumDocto: 'DOC002',
      CodFormaPagto: 2,
      FlgFrequencia: 'U',
      Observacao: 'Conta de luz',
      FlgConfirmacao: false,
      favorecido_nome: 'Maria Santos',
      categoria_nome: 'Energia Elétrica',
      forma_pagamento_nome: 'Cartão',
      empresa_nome: 'Empresa 1',
      conta_nome: 'Conta Corrente',
      NomUsuario: 'Admin',
      DtCreate: '2024-01-16T10:00:00Z'
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Lançamentos</h3>
        <button
          onClick={onCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Novo Lançamento
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockLancamentos.map((lancamento) => (
              <tr key={lancamento.CodLancamento} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(lancamento.Data)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {lancamento.Observacao}
                    </div>
                    <div className="text-sm text-gray-500">
                      {lancamento.NumDocto}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    lancamento.IndMov === 'E' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {lancamento.IndMov === 'E' ? 'Entrada' : 'Saída'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={lancamento.IndMov === 'E' ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(lancamento.Valor)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    lancamento.FlgConfirmacao 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lancamento.FlgConfirmacao ? 'Confirmado' : 'Pendente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(lancamento)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};