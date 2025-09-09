import React, { useEffect, useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchContasPagar,
  deleteContaPagar,
  setFilters,
  setPagination,
} from '../../store/slices/contasPagarSlice';
import { AccountsPayableResponse } from '../../services/contasPagarApi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: pagination.skip / pagination.limit,
    pageSize: pagination.limit,
  });

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
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    dispatch(setPagination({
      skip: model.page * model.pageSize,
      limit: model.pageSize,
    }));
  };

  // Columns definition
  const columns: GridColDef[] = [
    {
      field: 'DataVencimento',
      headerName: t('contas_pagar.data_vencimento'),
      width: 120,
      valueFormatter: (value: string) => value ? format(new Date(value), 'dd/MM/yyyy', { locale: ptBR }) : '',
    },
    {
      field: 'fornecedor_nome',
      headerName: t('contas_pagar.fornecedor'),
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'NumeroDocumento',
      headerName: t('lancamentos.numero_documento'),
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'Valor',
      headerName: t('contas_pagar.valor'),
      width: 120,
      valueFormatter: (value: number) => value ? `R$ ${value.toFixed(2)}`.replace('.', ',') : 'R$ 0,00',
    },
    {
      field: 'ValorPago',
      headerName: t('contas_pagar.valor_pago'),
      width: 120,
      valueFormatter: (value: number) => value ? `R$ ${value.toFixed(2)}`.replace('.', ',') : 'R$ 0,00',
    },
    {
      field: 'Status',
      headerName: t('contas_pagar.status'),
      width: 120,
      renderCell: (params) => {
        let label = '';
        let color: 'success' | 'warning' | 'error' | 'default' = 'default';
        
        switch (params.value) {
          case 'A':
            label = t('contas_pagar.aberto');
            color = 'warning';
            break;
          case 'P':
            label = t('contas_pagar.pago');
            color = 'success';
            break;
          case 'V':
            label = t('contas_pagar.vencido');
            color = 'error';
            break;
          case 'C':
            label = t('actions.cancel');
            color = 'default';
            break;
        }
        
        return (
          <Chip
            label={label}
            color={color}
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: t('actions.actions'),
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('actions.edit')}>
            <IconButton
              size="small"
              onClick={() => onEdit(params.row as AccountsPayableResponse)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.Status !== 'P' && (
            <Tooltip title={t('contas_pagar.pagar')}>
              <IconButton
                size="small"
                onClick={() => onPagar(params.row as AccountsPayableResponse)}
              >
                <PaymentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t('actions.delete')}>
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.CodAccountsPayable)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      {/* Filter controls */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label={t('contas_pagar.fornecedor')}
            value={localFilters.cod_fornecedor || ''}
            onChange={(e) => handleFilterChange('cod_fornecedor', e.target.value ? parseInt(e.target.value) : undefined)}
            type="number"
            size="small"
            fullWidth
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>{t('contas_pagar.status')}</InputLabel>
            <Select
              value={localFilters.status || ''}
              label={t('contas_pagar.status')}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            >
              <MenuItem value="A">{t('contas_pagar.aberto')}</MenuItem>
              <MenuItem value="P">{t('contas_pagar.pago')}</MenuItem>
              <MenuItem value="V">{t('contas_pagar.vencido')}</MenuItem>
              <MenuItem value="C">{t('actions.cancel')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <DatePicker
            label={t('contas_pagar.data_vencimento_inicio')}
            value={localFilters.data_vencimento_inicio ? new Date(localFilters.data_vencimento_inicio) : null}
            onChange={(date) => handleFilterChange('data_vencimento_inicio', date ? format(date, 'yyyy-MM-dd') : undefined)}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <DatePicker
            label={t('contas_pagar.data_vencimento_fim')}
            value={localFilters.data_vencimento_fim ? new Date(localFilters.data_vencimento_fim) : null}
            onChange={(date) => handleFilterChange('data_vencimento_fim', date ? format(date, 'yyyy-MM-dd') : undefined)}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label={t('contas_pagar.valor_minimo')}
            value={localFilters.valor_min || ''}
            onChange={(e) => handleFilterChange('valor_min', e.target.value ? parseFloat(e.target.value) : undefined)}
            type="number"
            size="small"
            fullWidth
            InputProps={{
              inputProps: { min: 0, step: 0.01 }
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label={t('contas_pagar.valor_maximo')}
            value={localFilters.valor_max || ''}
            onChange={(e) => handleFilterChange('valor_max', e.target.value ? parseFloat(e.target.value) : undefined)}
            type="number"
            size="small"
            fullWidth
            InputProps={{
              inputProps: { min: 0, step: 0.01 }
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label={t('contas.empresa')}
            value={localFilters.cod_empresa || ''}
            onChange={(e) => handleFilterChange('cod_empresa', e.target.value ? parseInt(e.target.value) : undefined)}
            type="number"
            size="small"
            fullWidth
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              size="small"
            >
              {t('actions.filter')}
            </Button>
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              size="small"
            >
              {t('actions.clear')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreate}
              size="small"
            >
              {t('contas_pagar.nova')}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Data Grid */}
      <DataGrid
        rows={contasPagar}
        columns={columns}
        loading={loading}
        rowCount={totalCount}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[10, 20, 50]}
        paginationMode="server"
        filterMode="server"
        sortingMode="server"
        disableRowSelectionOnClick
        getRowId={(row) => row.CodAccountsPayable}
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
        }}
      />
      
      {error && (
        <Box sx={{ mt: 2, color: 'error.main' }}>
          {error}
        </Box>
      )}
    </Box>
  );
};