import React, { useState, useEffect } from 'react';
import { LancamentoResponse, LancamentoCreate } from '@/services/lancamentosApi';

export interface LancamentoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LancamentoCreate) => void;
  lancamento?: LancamentoResponse;
}

export const LancamentoForm: React.FC<LancamentoFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lancamento
}) => {
  const [formData, setFormData] = useState<LancamentoCreate>({
    Data: '',
    DataEmissao: '',
    CodEmpresa: null,
    idConta: null,
    CodFavorecido: 1,
    CodCategoria: 1,
    Valor: 0,
    IndMov: 'E',
    NumDocto: '',
    CodFormaPagto: 1,
    FlgFrequencia: 'U',
    Observacao: ''
  });

  useEffect(() => {
    if (lancamento) {
      setFormData({
        Data: lancamento.Data,
        DataEmissao: lancamento.DataEmissao,
        CodEmpresa: lancamento.CodEmpresa,
        idConta: lancamento.idConta,
        CodFavorecido: lancamento.CodFavorecido,
        CodCategoria: lancamento.CodCategoria,
        Valor: lancamento.Valor,
        IndMov: lancamento.IndMov,
        NumDocto: lancamento.NumDocto,
        CodFormaPagto: lancamento.CodFormaPagto,
        FlgFrequencia: lancamento.FlgFrequencia,
        Observacao: lancamento.Observacao
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        Data: today,
        DataEmissao: today,
        CodEmpresa: null,
        idConta: null,
        CodFavorecido: 1,
        CodCategoria: 1,
        Valor: 0,
        IndMov: 'E',
        NumDocto: '',
        CodFormaPagto: 1,
        FlgFrequencia: 'U',
        Observacao: ''
      });
    }
  }, [lancamento, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
        ? parseFloat(value) || 0
        : value === '' && (name === 'IdCliente') 
        ? null 
        : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {lancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data *
              </label>
              <input
                type="date"
                name="Data"
                value={formData.Data}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Emissão *
              </label>
              <input
                type="date"
                name="DataEmissao"
                value={formData.DataEmissao}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Favorecido *
              </label>
              <select
                name="CodFavorecido"
                value={formData.CodFavorecido}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>João Silva</option>
                <option value={2}>Maria Santos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Movimento *
              </label>
              <select
                name="IndMov"
                value={formData.IndMov}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="E">Entrada</option>
                <option value="S">Saída</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor *
              </label>
              <input
                type="number"
                name="Valor"
                value={formData.Valor}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                name="CodCategoria"
                value={formData.CodCategoria}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Aluguel</option>
                <option value={2}>Energia Elétrica</option>
                <option value={3}>Água</option>
                <option value={4}>Internet</option>
                <option value={5}>Manutenção</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <select
                name="CodEmpresa"
                value={formData.CodEmpresa || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma empresa</option>
                <option value={1}>Empresa 1</option>
                <option value={2}>Empresa 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forma de Pagamento *
              </label>
              <select
                name="CodFormaPagto"
                value={formData.CodFormaPagto}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Dinheiro</option>
                <option value={2}>Cartão</option>
                <option value={3}>Transferência</option>
                <option value={4}>PIX</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número do Documento
              </label>
              <input
                type="text"
                name="NumDocto"
                value={formData.NumDocto || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conta
              </label>
              <select
                name="idConta"
                value={formData.idConta || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma conta</option>
                <option value={1}>Conta Corrente</option>
                <option value={2}>Conta Poupança</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequência
              </label>
              <select
                name="FlgFrequencia"
                value={formData.FlgFrequencia || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione a frequência</option>
                <option value="U">Única</option>
                <option value="M">Mensal</option>
                <option value="A">Anual</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                name="Observacao"
                value={formData.Observacao || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {lancamento ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};