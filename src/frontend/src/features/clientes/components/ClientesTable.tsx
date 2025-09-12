import React from 'react';
import { ClienteResponse } from '@/services/clientesApi';

export interface ClientesTableProps {
  onEdit: (cliente: ClienteResponse) => void;
  onCreate: () => void;
}

export const ClientesTable: React.FC<ClientesTableProps> = ({ onEdit, onCreate }) => {
  // Mock data for now - will be replaced with real API data
  const mockClientes: ClienteResponse[] = [
    {
      CodCliente: 1,
      DesCliente: 'João Silva',
      RazaoSocial: 'João Silva ME',
      FlgTipoPessoa: 'F',
      CPF: '123.456.789-00',
      RG: '',
      CNPJ: '',
      IE: '',
      IM: '',
      Endereco: 'Rua das Flores, 123',
      Bairro: 'Centro',
      CEP: '01234-567',
      Municipio: 'São Paulo',
      Estado: 'SP',
      Telefone1: '(11) 99999-9999',
      Telefone2: '',
      Email1: 'joao@email.com',
      Email2: '',
      FlgLiberado: false,
      FlgVIP: false,
      FlgAtivo: 'S',
      Observacoes: '',
      NomUsuario: 'admin',
      DtCreate: '2024-01-15'
    },
    {
      CodCliente: 2,
      DesCliente: 'Maria Santos',
      RazaoSocial: 'Maria Santos Ltda',
      FlgTipoPessoa: 'J',
      CPF: '',
      RG: '',
      CNPJ: '12.345.678/0001-90',
      IE: '',
      IM: '',
      Endereco: 'Av. Paulista, 456',
      Bairro: 'Bela Vista',
      CEP: '01310-100',
      Municipio: 'São Paulo',
      Estado: 'SP',
      Telefone1: '(11) 88888-8888',
      Telefone2: '',
      Email1: 'maria@empresa.com',
      Email2: '',
      FlgLiberado: false,
      FlgVIP: false,
      FlgAtivo: 'S',
      Observacoes: '',
      NomUsuario: 'admin',
      DtCreate: '2024-01-20'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Clientes</h3>
        <button
          onClick={onCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Novo Cliente
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPF/CNPJ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefone
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
            {mockClientes.map((cliente) => (
              <tr key={cliente.CodCliente} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {cliente.DesCliente}
                    </div>
                    <div className="text-sm text-gray-500">
                      {cliente.Email1}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cliente.FlgTipoPessoa === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cliente.FlgTipoPessoa === 'F' ? cliente.CPF : cliente.CNPJ}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cliente.Telefone1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    cliente.FlgAtivo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cliente.FlgAtivo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(cliente)}
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