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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
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
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label={t('contas_pagar.fornecedor')}
          value={localFilters.cod_fornecedor || ''}
          onChange={(e) => handleFilterChange('cod_fornecedor', e.target.value ? parseInt(e.target.value) : undefined)}
          type="number"
          size="small"
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
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
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
      </Box>

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