import React, { useState, useEffect } from 'react';
import { ClienteResponse, ClienteCreate } from '@/services/clientesApi';

export interface ClienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClienteCreate) => void;
  cliente?: ClienteResponse;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cliente
}) => {
  const [formData, setFormData] = useState<ClienteCreate>({
    DesCliente: '',
    RazaoSocial: '',
    FlgTipoPessoa: 'F',
    CPF: '',
    RG: '',
    CNPJ: '',
    IE: '',
    IM: '',
    Endereco: '',
    Bairro: '',
    CEP: '',
    Municipio: '',
    Estado: '',
    Telefone1: '',
    Telefone2: '',
    Email1: '',
    Email2: '',
    FlgLiberado: false,
    FlgVIP: false,
    FlgAtivo: 'S',
    Observacoes: ''
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        DesCliente: cliente.DesCliente,
        RazaoSocial: cliente.RazaoSocial,
        FlgTipoPessoa: cliente.FlgTipoPessoa,
        CPF: cliente.CPF,
        RG: cliente.RG,
        CNPJ: cliente.CNPJ,
        IE: cliente.IE,
        IM: cliente.IM,
        Endereco: cliente.Endereco,
        Bairro: cliente.Bairro,
        CEP: cliente.CEP,
        Municipio: cliente.Municipio,
        Estado: cliente.Estado,
        Telefone1: cliente.Telefone1,
        Telefone2: cliente.Telefone2,
        Email1: cliente.Email1,
        Email2: cliente.Email2,
        FlgLiberado: cliente.FlgLiberado,
        FlgVIP: cliente.FlgVIP,
        FlgAtivo: cliente.FlgAtivo,
        Observacoes: cliente.Observacoes
      });
    } else {
      setFormData({
        DesCliente: '',
        RazaoSocial: '',
        FlgTipoPessoa: 'F',
        CPF: '',
        RG: '',
        CNPJ: '',
        IE: '',
        IM: '',
        Endereco: '',
        Bairro: '',
        CEP: '',
        Municipio: '',
        Estado: '',
        Telefone1: '',
        Telefone2: '',
        Email1: '',
        Email2: '',
        FlgLiberado: false,
        FlgVIP: false,
        FlgAtivo: 'S',
        Observacoes: ''
      });
    }
  }, [cliente, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? ((e.target as HTMLInputElement).checked ? 'S' : 'N') : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
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
                Nome *
              </label>
              <input
                type="text"
                name="DesCliente"
                value={formData.DesCliente}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razão Social
              </label>
              <input
                type="text"
                name="RazaoSocial"
                value={formData.RazaoSocial}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Pessoa *
              </label>
              <select
                name="FlgTipoPessoa"
                value={formData.FlgTipoPessoa}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="F">Pessoa Física</option>
                <option value="J">Pessoa Jurídica</option>
              </select>
            </div>

            {formData.FlgTipoPessoa === 'F' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  name="CPF"
                  value={formData.CPF}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  name="CNPJ"
                  value={formData.CNPJ}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="Email1"
                value={formData.Email1}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="text"
                name="Telefone1"
                value={formData.Telefone1}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                name="Endereco"
                value={formData.Endereco}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bairro
              </label>
              <input
                type="text"
                name="Bairro"
                value={formData.Bairro}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                name="Municipio"
                value={formData.Municipio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UF
              </label>
              <input
                type="text"
                name="Estado"
                value={formData.Estado}
                onChange={handleChange}
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <input
                type="text"
                name="CEP"
                value={formData.CEP}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="FlgAtivo"
                  checked={formData.FlgAtivo === 'S'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Ativo</span>
              </label>
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
              {cliente ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};