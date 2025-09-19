import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Search, Filter, Plus, X, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { BancoResponse, bancosApi } from '../../services/bancosApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BancosTableProps {
  onEdit: (banco: BancoResponse) => void;
  onCreate: () => void;
}

export const BancosTable: React.FC<BancosTableProps> = ({ onEdit, onCreate }) => {
  const { t } = useTranslation();
  const [bancos, setBancos] = useState<BancoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load bancos data
  const loadBancos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bancosApi.list();
      setBancos(response.data);
      setTotalCount(response.data.length);
    } catch (err: any) {
      setError(err.message || t('messages.error_loading_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBancos();
  }, []);

  // Filter bancos based on search and status
  const filteredBancos = bancos.filter((banco) => {
    const matchesSearch = 
      (banco.Nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (banco.NomeAbreviado || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (banco.Codigo || '').toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || banco.FlgAtivo === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredBancos.length);
  const paginatedBancos = filteredBancos.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredBancos.length / pageSize);

  // Handle delete
  const handleDelete = async (banco: BancoResponse) => {
    if (window.confirm(t('bancos.confirm_delete'))) {
      try {
        await bancosApi.delete(banco.Codigo);
        await loadBancos();
      } catch (err: any) {
        setError(err.message || t('messages.error_deleting'));
      }
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1);
  };

  // Render status badge
  const renderStatus = (flgAtivo: string) => {
    const isActive = flgAtivo === 'S';
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? t('status.active') : t('status.inactive')}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('bancos.title')}</span>
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('bancos.novo')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('bancos.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder={t('filters.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.all')}</SelectItem>
              <SelectItem value="S">{t('status.active')}</SelectItem>
              <SelectItem value="N">{t('status.inactive')}</SelectItem>
            </SelectContent>
          </Select>
          {(searchTerm || statusFilter !== 'all') && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              {t('filters.clear')}
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('bancos.codigo')}</TableHead>
                <TableHead>{t('bancos.digito')}</TableHead>
                <TableHead>{t('bancos.nome')}</TableHead>
                <TableHead>{t('bancos.nome_abreviado')}</TableHead>
                <TableHead>{t('status.status')}</TableHead>
                <TableHead className="w-[100px]">{t('actions.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6} className="h-12">
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                        <span>Carregando...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedBancos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum banco encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBancos.map((banco) => (
                  <TableRow key={banco.Codigo}>
                    <TableCell className="font-medium">{banco.Codigo}</TableCell>
                    <TableCell>{banco.Digito}</TableCell>
                    <TableCell>{banco.Nome}</TableCell>
                    <TableCell>{banco.NomeAbreviado}</TableCell>
                    <TableCell>{renderStatus(banco.FlgAtivo)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(banco)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(banco)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('actions.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {endIndex} de {filteredBancos.length} resultados
            </p>
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Linhas por página</p>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
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
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};