import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Edit, Trash2, Filter, X, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchClientes,
  deleteCliente,
  setFilters,
  setPagination,
} from '../../store/slices/clientesSlice';
import { ClienteResponse } from '../../services/clientesApi';

interface ClientesTableProps {
  onEdit: (cliente: ClienteResponse) => void;
  onCreate: () => void;
}

export const ClientesTable: React.FC<ClientesTableProps> = ({ onEdit, onCreate }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    clientes,
    loading,
    error,
    filters,
    pagination,
    totalCount,
  } = useAppSelector((state) => state.clientes);

  const [localFilters, setLocalFilters] = useState(filters);
  const [currentPage, setCurrentPage] = useState(Math.floor(pagination.skip / pagination.limit) + 1);
  const [pageSize, setPageSize] = useState(pagination.limit);

  // Load data on component mount and when filters/pagination change
  useEffect(() => {
    dispatch(fetchClientes({
      ...filters,
      skip: pagination.skip,
      limit: pagination.limit,
    }));
  }, [dispatch, filters, pagination]);

  // Handle filter changes
  const handleFilterChange = (field: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    dispatch(setFilters(localFilters));
    // Reset to first page when applying filters
    dispatch(setPagination({ skip: 0, limit: pagination.limit }));
  };

  // Clear filters
  const handleClearFilters = () => {
    setLocalFilters({});
    dispatch(setFilters({}));
    // Reset to first page when clearing filters
    dispatch(setPagination({ skip: 0, limit: pagination.limit }));
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    dispatch(setPagination({
      skip: (page - 1) * pageSize,
      limit: pageSize,
    }));
  };

  // Handle page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    dispatch(setPagination({
      skip: 0,
      limit: newPageSize,
    }));
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (window.confirm(t('messages.confirm_delete'))) {
      dispatch(deleteCliente(id));
    }
  };

  // Render functions for table cells
  const renderTipoPessoa = (tipo: string) => (
    <Badge variant={tipo === 'F' ? 'default' : 'secondary'}>
      {tipo === 'F' ? t('clientes.tipo_pessoa_f') : t('clientes.tipo_pessoa_j')}
    </Badge>
  );

  const renderStatus = (ativo: string) => (
    <Badge variant={ativo === 'S' ? 'default' : 'outline'}>
      {ativo === 'S' ? t('categorias.ativo') : t('categorias.inativo')}
    </Badge>
  );

  const renderActions = (cliente: ClienteResponse) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(cliente)}>
          <Edit className="mr-2 h-4 w-4" />
          {t('actions.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(cliente.CodCliente)}>
          <Trash2 className="mr-2 h-4 w-4" />
          {t('actions.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder={t('clientes.nome')}
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleApplyFilters} size="sm">
            <Filter className="mr-2 h-4 w-4" />
            {t('actions.filter')}
          </Button>
          <Button variant="outline" onClick={handleClearFilters} size="sm">
            <X className="mr-2 h-4 w-4" />
            {t('actions.clear')}
          </Button>
          <Button onClick={onCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t('clientes.novo')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('clientes.nome')}</TableHead>
              <TableHead>{t('clientes.tipo_pessoa')}</TableHead>
              <TableHead>{t('clientes.cpf')}</TableHead>
              <TableHead>{t('clientes.cnpj')}</TableHead>
              <TableHead>{t('clientes.telefone1')}</TableHead>
              <TableHead>{t('clientes.email1')}</TableHead>
              <TableHead>{t('categorias.ativo')}</TableHead>
              <TableHead className="w-[100px]">{t('actions.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  {t('messages.loading')}
                </TableCell>
              </TableRow>
            ) : clientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  {t('messages.no_data')}
                </TableCell>
              </TableRow>
            ) : (
              clientes.map((cliente) => (
                <TableRow key={cliente.CodCliente}>
                  <TableCell className="font-medium">{cliente.DesCliente}</TableCell>
                  <TableCell>{renderTipoPessoa(cliente.FlgTipoPessoa)}</TableCell>
                  <TableCell>{cliente.CPF || '-'}</TableCell>
                  <TableCell>{cliente.CNPJ || '-'}</TableCell>
                  <TableCell>{cliente.Telefone1 || '-'}</TableCell>
                  <TableCell>{cliente.Email1 || '-'}</TableCell>
                  <TableCell>{renderStatus(cliente.FlgAtivo)}</TableCell>
                  <TableCell>{renderActions(cliente)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {startItem} a {endItem} de {totalCount} resultados
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Itens por página:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              {totalPages > 5 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
      
      {error && (
        <div className="text-red-600 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
};