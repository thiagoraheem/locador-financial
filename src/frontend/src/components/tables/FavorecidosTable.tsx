import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Search, Filter, Plus, X, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchFavorecidos,
  deleteFavorecido,
  setFilters,
  setPagination,
} from '../../store/slices/favorecidosSlice';
import { FavorecidoResponse } from '../../services/favorecidosApi';
import { cn } from '@/lib/utils';

interface FavorecidosTableProps {
  onEdit: (favorecido: FavorecidoResponse) => void;
  onCreate: () => void;
}

export const FavorecidosTable: React.FC<FavorecidosTableProps> = ({ onEdit, onCreate }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    favorecidos,
    loading,
    error,
    filters,
    pagination,
    totalCount,
  } = useAppSelector((state) => state.favorecidos);

  const [localFilters, setLocalFilters] = useState(filters);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load data on component mount and when filters/pagination change
  useEffect(() => {
    const skip = (currentPage - 1) * pageSize;
    dispatch(fetchFavorecidos({
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

  // Handle delete
  const handleDelete = (id: number) => {
    if (window.confirm(t('messages.confirm_delete'))) {
      dispatch(deleteFavorecido(id));
    }
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

  // Render tipo favorecido badge
  const renderTipoFavorecido = (tipo: string) => {
    const isPessoaFisica = tipo === 'F';
    return (
      <Badge variant={isPessoaFisica ? 'default' : 'secondary'}>
        {isPessoaFisica ? t('clientes.tipo_pessoa_f') : t('clientes.tipo_pessoa_j')}
      </Badge>
    );
  };

  // Render status badge
  const renderStatus = (flgAtivo: string) => {
    const isActive = flgAtivo === 'S';
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? t('categorias.ativo') : t('categorias.inativo')}
      </Badge>
    );
  };

  // Render actions dropdown
  const renderActions = (favorecido: FavorecidoResponse) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(favorecido)}>
            <Edit className="mr-2 h-4 w-4" />
            {t('actions.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleDelete(favorecido.CodFavorecido)}
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
          value={localFilters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-64"
        />
        <Button onClick={handleApplyFilters} className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          {t('actions.search')}
        </Button>
        <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-2">
          <X className="h-4 w-4" />
          {t('actions.clear')}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('lancamentos.favorecido')}</TableHead>
              <TableHead>{t('clientes.tipo_pessoa')}</TableHead>
              <TableHead>{t('clientes.cpf')}/{t('clientes.cnpj')}</TableHead>
              <TableHead>{t('clientes.telefone1')}</TableHead>
              <TableHead>{t('clientes.email1')}</TableHead>
              <TableHead>{t('categorias.ativo')}</TableHead>
              <TableHead className="w-[100px]">{t('actions.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={7} className="h-12">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      <span>Carregando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : favorecidos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum favorecido encontrado.
                </TableCell>
              </TableRow>
            ) : (
              favorecidos.map((favorecido) => (
                <TableRow key={favorecido.CodFavorecido}>
                  <TableCell className="font-medium">{favorecido.DesFavorecido || favorecido.NomFavorecido || '-'}</TableCell>
                  <TableCell>{renderTipoFavorecido(favorecido.TipoFavorecido || '')}</TableCell>
                  <TableCell>{favorecido.CPF || favorecido.CNPJ || favorecido.CPF_CNPJ || '-'}</TableCell>
                  <TableCell>{favorecido.Telefone || '-'}</TableCell>
                  <TableCell>{favorecido.Email || '-'}</TableCell>
                  <TableCell>{renderStatus(favorecido.FlgAtivo || 'N')}</TableCell>
                  <TableCell>{renderActions(favorecido)}</TableCell>
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
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
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
    </div>
  );
};