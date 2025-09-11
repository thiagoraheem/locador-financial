import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Edit, Trash2, DollarSign, Filter, X, MoreHorizontal, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchContasPagar,
  deleteContaPagar,
  setFilters,
  setPagination,
} from '../../store/slices/contasPagarSlice';
import { AccountsPayableResponse } from '../../services/contasPagarApi';

interface ContasPagarTableProps {
  onEdit: (conta: AccountsPayableResponse) => void;
  onCreate: () => void;
  onPagar: (conta: AccountsPayableResponse) => void;
}

export const ContasPagarTable: React.FC<ContasPagarTableProps> = ({ onEdit, onCreate, onPagar }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    contasPagar,
    loading,
    error,
    filters,
    pagination,
    totalCount,
  } = useAppSelector((state) => state.contasPagar);

  const [localFilters, setLocalFilters] = useState(filters);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load data on component mount and when filters/pagination change
  useEffect(() => {
    dispatch(fetchContasPagar({
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

  // Handle delete
  const handleDelete = (id: number) => {
    if (window.confirm(t('messages.confirm_delete'))) {
      dispatch(deleteContaPagar(id));
    }
  };

  // Handle pagination changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    dispatch(setPagination({
      skip: (page - 1) * pageSize,
      limit: pageSize,
    }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    dispatch(setPagination({
      skip: 0,
      limit: newPageSize,
    }));
  };

  // Render functions for table cells
  const renderStatus = (status: string) => {
    let label = '';
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
    
    switch (status) {
      case 'A':
        label = t('contas_pagar.aberto');
        variant = 'outline';
        break;
      case 'P':
        label = t('contas_pagar.pago');
        variant = 'default';
        break;
      case 'V':
        label = t('contas_pagar.vencido');
        variant = 'destructive';
        break;
      case 'C':
        label = t('actions.cancel');
        variant = 'secondary';
        break;
    }
    
    return (
      <Badge variant={variant}>
        {label}
      </Badge>
    );
  };

  const renderActions = (conta: AccountsPayableResponse) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(conta)}>
          <Edit className="mr-2 h-4 w-4" />
          {t('actions.edit')}
        </DropdownMenuItem>
        {conta.Status !== 'P' && (
          <DropdownMenuItem onClick={() => onPagar(conta)}>
            <DollarSign className="mr-2 h-4 w-4" />
            {t('contas_pagar.pagar')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={() => handleDelete(conta.CodAccountsPayable)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t('actions.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder={t('contas_pagar.fornecedor')}
            value={localFilters.cod_fornecedor || ''}
            onChange={(e) => handleFilterChange('cod_fornecedor', e.target.value ? parseInt(e.target.value) : undefined)}
            type="number"
          />
        </div>
        
        <div>
          <Select
            value={localFilters.status || ''}
            onValueChange={(value) => handleFilterChange('status', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('contas_pagar.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">{t('contas_pagar.aberto')}</SelectItem>
              <SelectItem value="P">{t('contas_pagar.pago')}</SelectItem>
              <SelectItem value="V">{t('contas_pagar.vencido')}</SelectItem>
              <SelectItem value="C">{t('actions.cancel')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !localFilters.data_vencimento_inicio && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.data_vencimento_inicio ? format(new Date(localFilters.data_vencimento_inicio), 'dd/MM/yyyy') : t('contas_pagar.data_vencimento_inicio')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localFilters.data_vencimento_inicio ? new Date(localFilters.data_vencimento_inicio) : undefined}
                onSelect={(date) => handleFilterChange('data_vencimento_inicio', date ? format(date, 'yyyy-MM-dd') : undefined)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !localFilters.data_vencimento_fim && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.data_vencimento_fim ? format(new Date(localFilters.data_vencimento_fim), 'dd/MM/yyyy') : t('contas_pagar.data_vencimento_fim')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localFilters.data_vencimento_fim ? new Date(localFilters.data_vencimento_fim) : undefined}
                onSelect={(date) => handleFilterChange('data_vencimento_fim', date ? format(date, 'yyyy-MM-dd') : undefined)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Input
            placeholder={t('contas_pagar.valor_minimo')}
            value={localFilters.valor_min || ''}
            onChange={(e) => handleFilterChange('valor_min', e.target.value ? parseFloat(e.target.value) : undefined)}
            type="number"
            step="0.01"
            min="0"
          />
        </div>
        
        <div>
          <Input
            placeholder={t('contas_pagar.valor_maximo')}
            value={localFilters.valor_max || ''}
            onChange={(e) => handleFilterChange('valor_max', e.target.value ? parseFloat(e.target.value) : undefined)}
            type="number"
            step="0.01"
            min="0"
          />
        </div>
        
        <div>
          <Input
            placeholder={t('contas.empresa')}
            value={localFilters.cod_empresa || ''}
            onChange={(e) => handleFilterChange('cod_empresa', e.target.value ? parseInt(e.target.value) : undefined)}
            type="number"
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
            {t('contas_pagar.nova')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('contas_pagar.data_vencimento')}</TableHead>
              <TableHead>{t('contas_pagar.fornecedor')}</TableHead>
              <TableHead>{t('contas_pagar.numero_documento')}</TableHead>
              <TableHead>{t('contas_pagar.valor')}</TableHead>
              <TableHead>{t('contas_pagar.valor_pago')}</TableHead>
              <TableHead>{t('contas_pagar.status')}</TableHead>
              <TableHead className="w-[100px]">{t('actions.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : contasPagar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t('common.no_data')}
                </TableCell>
              </TableRow>
            ) : (
              contasPagar.map((conta) => (
                <TableRow key={conta.CodAccountsPayable}>
                  <TableCell>
                    {conta.DataVencimento ? format(new Date(conta.DataVencimento), 'dd/MM/yyyy') : ''}
                  </TableCell>
                  <TableCell>{conta.CodFornecedor || ''}</TableCell>
                  <TableCell>{conta.NumeroDocumento}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(conta.Valor || 0)}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(conta.ValorPago || 0)}
                  </TableCell>
                  <TableCell>{renderStatus(conta.Status)}</TableCell>
                  <TableCell>{renderActions(conta)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t('common.showing')} {startIndex + 1} {t('common.to')} {endIndex} {t('common.of')} {totalCount} {t('common.results')}
        </div>
        <div className="flex items-center space-x-2">
          <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(parseInt(value))}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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