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
import {
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  Check,
  XCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchLancamentos,
  deleteLancamento,
  confirmLancamento,
  setFilters,
  setPagination,
} from '../../store/slices/lancamentosSlice';
import { LancamentoResponse } from '../../services/lancamentosApi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LancamentosTableProps {
  onEdit: (lancamento: LancamentoResponse) => void;
  onCreate: () => void;
}

export const LancamentosTable: React.FC<LancamentosTableProps> = ({ onEdit, onCreate }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    lancamentos,
    loading,
    error,
    filters,
    pagination,
    totalCount,
  } = useAppSelector((state) => state.lancamentos);

  const [localFilters, setLocalFilters] = useState(filters);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load data on component mount and when filters/pagination change
  useEffect(() => {
    const skip = (currentPage - 1) * pageSize;
    dispatch(fetchLancamentos({
      ...localFilters,
      skip,
      limit: pageSize,
    }));
  }, [dispatch, currentPage, pageSize, localFilters]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const skip = (page - 1) * pageSize;
    dispatch(setPagination({ skip, limit: pageSize }));
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize);
    setPageSize(size);
    setCurrentPage(1);
    dispatch(setPagination({ skip: 0, limit: size }));
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (window.confirm(t('messages.confirm_delete'))) {
      dispatch(deleteLancamento(id));
    }
  };

  // Handle confirm/unconfirm
  const handleConfirm = (id: number, confirmar: boolean) => {
    dispatch(confirmLancamento({ id, confirmar }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    return dateString ? format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR }) : '';
  };

  // Format currency
  const formatCurrency = (value: number) => {
    const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  // Render tipo movimento badge
  const renderTipoMovimento = (indMov: string) => {
    const isEntrada = indMov === 'E';
    return (
      <Badge variant={isEntrada ? 'default' : 'destructive'}>
        {isEntrada ? t('lancamentos.entrada') : t('lancamentos.saida')}
      </Badge>
    );
  };

  // Render status badge
  const renderStatus = (flgConfirmacao: boolean) => {
    return (
      <Badge variant={flgConfirmacao ? 'default' : 'secondary'}>
        {flgConfirmacao ? t('lancamentos.confirmado') : t('lancamentos.pendente')}
      </Badge>
    );
  };

  // Render actions dropdown
  const renderActions = (lancamento: LancamentoResponse) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(lancamento)}>
            <Edit className="mr-2 h-4 w-4" />
            {t('actions.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleConfirm(lancamento.CodLancamento, !lancamento.FlgConfirmacao)}
          >
            {lancamento.FlgConfirmacao ? (
              <XCircle className="mr-2 h-4 w-4" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {lancamento.FlgConfirmacao ? t('lancamentos.cancel_confirmation') : t('lancamentos.confirm')}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleDelete(lancamento.CodLancamento)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder={t('lancamentos.favorecido')}
          value={localFilters.cod_favorecido || ''}
          onChange={(e) => handleFilterChange('cod_favorecido', e.target.value ? parseInt(e.target.value) : undefined)}
          type="number"
          className="w-48"
        />
        
        <Input
          placeholder={t('lancamentos.categoria')}
          value={localFilters.cod_categoria || ''}
          onChange={(e) => handleFilterChange('cod_categoria', e.target.value ? parseInt(e.target.value) : undefined)}
          type="number"
          className="w-48"
        />
        
        <Select value={localFilters.ind_mov || ''} onValueChange={(value) => handleFilterChange('ind_mov', value || undefined)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('lancamentos.tipo')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="E">{t('lancamentos.entrada')}</SelectItem>
            <SelectItem value="S">{t('lancamentos.saida')}</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={localFilters.confirmado !== undefined ? (localFilters.confirmado ? '1' : '0') : ''} 
          onValueChange={(value) => handleFilterChange('confirmado', value === '1' ? true : (value === '0' ? false : undefined))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('lancamentos.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{t('lancamentos.confirmado')}</SelectItem>
            <SelectItem value="0">{t('lancamentos.pendente')}</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={handleApplyFilters} className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          {t('actions.filter')}
        </Button>
        <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-2">
          <X className="h-4 w-4" />
          {t('actions.clear')}
        </Button>
        <Button onClick={onCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('lancamentos.novo')}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">{t('lancamentos.data')}</TableHead>
              <TableHead className="w-24">Documento</TableHead>
              <TableHead className="w-32">{t('lancamentos.favorecido')}</TableHead>
              <TableHead className="w-28">{t('lancamentos.categoria')}</TableHead>
              <TableHead className="w-16">{t('lancamentos.tipo')}</TableHead>
              <TableHead className="w-24">{t('lancamentos.valor')}</TableHead>
              <TableHead className="w-20">Parcelas</TableHead>
              <TableHead className="w-20">{t('lancamentos.status')}</TableHead>
              <TableHead className="w-24">Quitação</TableHead>
              <TableHead className="w-20">{t('actions.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={10} className="h-12">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      <span>Carregando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : lancamentos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  Nenhum lançamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              lancamentos.map((lancamento) => (
                <TableRow key={lancamento.CodLancamento}>
                  <TableCell className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(lancamento.Data)}</TableCell>
                  <TableCell className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{lancamento.NumDocto || '-'}</TableCell>
                  <TableCell className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-32 font-medium">{lancamento.favorecido_nome || '-'}</TableCell>
                  <TableCell className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-28">{lancamento.categoria_nome || '-'}</TableCell>
                  <TableCell className="px-3 py-4 whitespace-nowrap">{renderTipoMovimento(lancamento.IndMov)}</TableCell>
                  <TableCell className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(lancamento.Valor)}</TableCell>
                  <TableCell className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lancamento.ParcelaAtual && lancamento.QtdParcelas 
                      ? `${lancamento.ParcelaAtual}/${lancamento.QtdParcelas}`
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="px-3 py-4 whitespace-nowrap">{renderStatus(lancamento.FlgConfirmacao)}</TableCell>
                  <TableCell className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lancamento.DatConfirmacao 
                      ? formatDate(lancamento.DatConfirmacao)
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="px-3 py-4 whitespace-nowrap text-sm font-medium">{renderActions(lancamento)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex} a {endIndex} de {totalCount} resultados
          </p>
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Linhas por página</p>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};