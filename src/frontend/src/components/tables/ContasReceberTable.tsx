import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  MoreHorizontal,
  CalendarIcon,
  Filter,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchContasReceber,
  deleteContaReceber,
  setFilters,
  setPagination,
} from '../../store/slices/contasReceberSlice';
import { AccountsReceivableResponse } from '../../services/contasReceberApi';

interface ContasReceberTableProps {
  onEdit: (conta: AccountsReceivableResponse) => void;
  onCreate: () => void;
  onReceber: (conta: AccountsReceivableResponse) => void;
}

export const ContasReceberTable: React.FC<ContasReceberTableProps> = ({ onEdit, onCreate, onReceber }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    contasReceber,
    loading,
    error,
    filters,
    pagination,
    totalCount,
  } = useAppSelector((state) => state.contasReceber);

  const [localFilters, setLocalFilters] = useState(filters);
  const [currentPage, setCurrentPage] = useState(Math.floor(pagination.skip / pagination.limit) + 1);
  const [pageSize, setPageSize] = useState(pagination.limit);

  // Load data on component mount and when filters/pagination change
  useEffect(() => {
    dispatch(fetchContasReceber({
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
      dispatch(deleteContaReceber(id));
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

  // Render functions
  const renderStatus = (status: string) => {
    let label = '';
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
    
    switch (status) {
      case 'A':
        label = t('contas_receber.aberto');
        variant = 'outline';
        break;
      case 'R':
        label = t('contas_receber.recebido');
        variant = 'default';
        break;
      case 'V':
        label = t('contas_receber.vencido');
        variant = 'destructive';
        break;
      case 'C':
        label = t('actions.cancel');
        variant = 'secondary';
        break;
    }
    
    return <Badge variant={variant}>{label}</Badge>;
  };

  const renderActions = (conta: AccountsReceivableResponse) => (
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
        {conta.Status !== 'R' && (
          <DropdownMenuItem onClick={() => onReceber(conta)}>
            <DollarSign className="mr-2 h-4 w-4" />
            {t('contas_receber.receber')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={() => handleDelete(conta.CodAccountsReceivable)}
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
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder={t('contas_receber.cliente')}
            value={localFilters.cod_cliente || ''}
            onChange={(e) => handleFilterChange('cod_cliente', e.target.value ? parseInt(e.target.value) : undefined)}
            type="number"
          />
        </div>
        
        <div>
          <Select
            value={localFilters.status || ''}
            onValueChange={(value) => handleFilterChange('status', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('contas_receber.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">{t('contas_receber.aberto')}</SelectItem>
              <SelectItem value="R">{t('contas_receber.recebido')}</SelectItem>
              <SelectItem value="V">{t('contas_receber.vencido')}</SelectItem>
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
                {localFilters.data_vencimento_inicio
                  ? format(new Date(localFilters.data_vencimento_inicio), 'dd/MM/yyyy', { locale: ptBR })
                  : t('contas_receber.data_vencimento_inicio')}
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
                {localFilters.data_vencimento_fim
                  ? format(new Date(localFilters.data_vencimento_fim), 'dd/MM/yyyy', { locale: ptBR })
                  : t('contas_receber.data_vencimento_fim')}
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
            placeholder={t('contas_receber.valor_minimo')}
            value={localFilters.valor_min || ''}
            onChange={(e) => handleFilterChange('valor_min', e.target.value ? parseFloat(e.target.value) : undefined)}
            type="number"
            min="0"
            step="0.01"
          />
        </div>
        
        <div>
          <Input
            placeholder={t('contas_receber.valor_maximo')}
            value={localFilters.valor_max || ''}
            onChange={(e) => handleFilterChange('valor_max', e.target.value ? parseFloat(e.target.value) : undefined)}
            type="number"
            min="0"
            step="0.01"
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
            {t('contas_receber.nova')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('contas_receber.data_vencimento')}</TableHead>
              <TableHead>{t('contas_receber.cliente')}</TableHead>
              <TableHead>{t('lancamentos.numero_documento')}</TableHead>
              <TableHead>{t('contas_receber.valor')}</TableHead>
              <TableHead>{t('contas_receber.valor_recebido')}</TableHead>
              <TableHead>{t('contas_receber.status')}</TableHead>
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
            ) : contasReceber.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t('common.no_data')}
                </TableCell>
              </TableRow>
            ) : (
              contasReceber.map((conta) => (
                <TableRow key={conta.CodAccountsReceivable}>
                  <TableCell>
                    {conta.DataVencimento ? format(new Date(conta.DataVencimento), 'dd/MM/yyyy', { locale: ptBR }) : ''}
                  </TableCell>
                  <TableCell>{conta.cliente_nome}</TableCell>
                  <TableCell>{conta.NumeroDocumento}</TableCell>
                  <TableCell>
                    {`R$ ${(conta.Valor || 0).toFixed(2)}`.replace('.', ',')}
                  </TableCell>
                  <TableCell>
                    {`R$ ${(conta.ValorRecebido || 0).toFixed(2)}`.replace('.', ',')}
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
          Mostrando {startIndex} a {endIndex} de {totalCount} registros
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Anterior
          </Button>
          <div className="text-sm">
            Página {currentPage} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Próxima
          </Button>
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