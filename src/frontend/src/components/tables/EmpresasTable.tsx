import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchEmpresas,
  deleteEmpresa,
  selectEmpresas,
  selectEmpresasLoading,
  selectEmpresasError,
  selectEmpresasTotalCount,
} from '@/store/slices/empresasSlice';
import { cn } from '@/lib/utils';

interface EmpresasTableProps {
  onEdit?: (empresa: any) => void;
  onDelete?: (id: number) => void;
}

export const EmpresasTable: React.FC<EmpresasTableProps> = ({ onEdit, onDelete }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const empresas = useAppSelector(selectEmpresas);
  const loading = useAppSelector(selectEmpresasLoading);
  const error = useAppSelector(selectEmpresasError);
  const totalCount = useAppSelector(selectEmpresasTotalCount);

  // Local state for filters and pagination
  const [localFilters, setLocalFilters] = useState({
    search: '',
    ativas_apenas: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load data on component mount and when filters/pagination change
  useEffect(() => {
    const skip = (currentPage - 1) * pageSize;
    dispatch(fetchEmpresas({
      skip,
      limit: pageSize,
      ativas_apenas: localFilters.ativas_apenas === 'true' ? true : localFilters.ativas_apenas === 'false' ? false : undefined,
    }));
  }, [dispatch, currentPage, pageSize, localFilters]);

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await dispatch(deleteEmpresa(id)).unwrap();
        // Reload current page
        const skip = (currentPage - 1) * pageSize;
        dispatch(fetchEmpresas({
          skip,
          limit: pageSize,
          ativas_apenas: localFilters.ativas_apenas === 'true' ? true : localFilters.ativas_apenas === 'false' ? false : undefined,
        }));
      } catch (error) {
        console.error('Error deleting empresa:', error);
      }
    }
  };

  // Render status badge
  const renderStatus = (flgAtivo: string) => {
    const isActive = flgAtivo === 'S';
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? t('common.active') : t('common.inactive')}
      </Badge>
    );
  };

  // Render actions dropdown
  const renderActions = (empresa: any) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit?.(empresa)}>
            <Edit className="mr-2 h-4 w-4" />
            {t('common.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleDelete(empresa.CodEmpresa)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('common.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select
          value={localFilters.ativas_apenas || "all"}
          onValueChange={(value) => handleFilterChange('ativas_apenas', value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="true">{t('common.active')}</SelectItem>
            <SelectItem value="false">{t('common.inactive')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('empresas.nome_empresa')}</TableHead>
              <TableHead>{t('empresas.razao_social')}</TableHead>
              <TableHead>{t('empresas.cnpj')}</TableHead>
              <TableHead>{t('empresas.municipio')}</TableHead>
              <TableHead>{t('empresas.telefone')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="w-[70px]">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : empresas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  {t('common.no_data')}
                </TableCell>
              </TableRow>
            ) : (
              empresas.map((empresa) => (
                <TableRow key={empresa.CodEmpresa}>
                  <TableCell className="font-medium">{empresa.NomEmpresa}</TableCell>
                  <TableCell>{empresa.RazaoSocial}</TableCell>
                  <TableCell>{empresa.CNPJ}</TableCell>
                  <TableCell>{empresa.Municipio || '-'}</TableCell>
                  <TableCell>{empresa.Telefone || '-'}</TableCell>
                  <TableCell>{renderStatus(empresa.FlgAtivo)}</TableCell>
                  <TableCell>{renderActions(empresa)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t('common.showing')} {startIndex} {t('common.to')} {endIndex} {t('common.of')} {totalCount} {t('common.results')}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={cn(
                    currentPage === 1 && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNumber)}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={cn(
                    currentPage === totalPages && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};