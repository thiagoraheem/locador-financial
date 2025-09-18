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
import { ContaResponse, contasApi } from '../../services/contasApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContasBancariasTableProps {
  onEdit: (conta: ContaResponse) => void;
  onCreate: () => void;
}

export const ContasBancariasTable: React.FC<ContasBancariasTableProps> = ({ onEdit, onCreate }) => {
  const { t } = useTranslation();
  const [contas, setContas] = useState<ContaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load contas data
  const loadContas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contasApi.list();
      setContas(response.data);
      setTotalCount(response.data.length);
    } catch (err: any) {
      setError(err.message || t('messages.error_loading_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContas();
  }, []);

  // Filter contas based on search, status and type
  const filteredContas = contas.filter((conta) => {
    const matchesSearch = 
      conta.NomConta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conta.Agencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conta.Conta.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || conta.FlgAtivo === statusFilter;
    const matchesType = tipoFilter === 'all' || conta.TipoConta === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredContas.length);
  const paginatedContas = filteredContas.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredContas.length / pageSize);

  // Handle delete
  const handleDelete = async (conta: ContaResponse) => {
    if (window.confirm(t('contas.confirm_delete'))) {
      try {
        await contasApi.delete(conta.idConta);
        await loadContas();
      } catch (err: any) {
        setError(err.message || t('messages.error_deleting'));
      }
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTipoFilter('all');
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

  // Render tipo conta badge
  const renderTipoConta = (tipoConta: string) => {
    const tipoMap: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'outline' } } = {
      'CC': { label: 'Conta Corrente', variant: 'default' },
      'CP': { label: 'Conta Poupança', variant: 'secondary' },
      'CI': { label: 'Conta Investimento', variant: 'outline' }
    };
    
    const tipo = tipoMap[tipoConta] || { label: tipoConta, variant: 'outline' as const };
    
    return (
      <Badge variant={tipo.variant}>
        {tipo.label}
      </Badge>
    );
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('contas.title')}</span>
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('contas.nova')}
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
                placeholder={t('contas.search_placeholder')}
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
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Tipo de Conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="CC">Conta Corrente</SelectItem>
              <SelectItem value="CP">Conta Poupança</SelectItem>
              <SelectItem value="CI">Conta Investimento</SelectItem>
            </SelectContent>
          </Select>
          {(searchTerm || statusFilter !== 'all' || tipoFilter !== 'all') && (
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
                <TableHead>{t('contas.nome')}</TableHead>
                <TableHead>{t('contas.banco')}</TableHead>
                <TableHead>{t('contas.agencia')}</TableHead>
                <TableHead>{t('contas.conta')}</TableHead>
                <TableHead>{t('contas.tipo')}</TableHead>
                <TableHead>{t('contas.saldo')}</TableHead>
                <TableHead>{t('status.status')}</TableHead>
                <TableHead className="w-[100px]">{t('actions.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={8} className="h-12">
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                        <span>Carregando...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedContas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Nenhuma conta bancária encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedContas.map((conta) => (
                  <TableRow key={conta.idConta}>
                    <TableCell className="font-medium">{conta.NomConta}</TableCell>
                    <TableCell>{conta.Banco}</TableCell>
                    <TableCell>{conta.Agencia}</TableCell>
                    <TableCell>{conta.Conta}</TableCell>
                    <TableCell>{renderTipoConta(conta.TipoConta)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(conta.Saldo || 0)}</TableCell>
                    <TableCell>{renderStatus(conta.FlgAtivo)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(conta)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(conta)}
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
              Mostrando {startIndex + 1} a {endIndex} de {filteredContas.length} resultados
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