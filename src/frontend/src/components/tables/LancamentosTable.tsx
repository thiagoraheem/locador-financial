import React, { useEffect, useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridFilterModel,
  GridSortModel,
  GridRowParams,
  GridEventListener,
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
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
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
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: pagination.skip / pagination.limit,
    pageSize: pagination.limit,
  });

  // Load data on component mount and when filters/pagination change
  useEffect(() => {
    dispatch(fetchLancamentos({
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

  // Handle pagination changes
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    dispatch(setPagination({
      skip: model.page * model.pageSize,
      limit: model.pageSize,
    }));
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

  // Columns definition
  const columns: GridColDef[] = [
    {
      field: 'Data',
      headerName: t('lancamentos.data'),
      width: 120,
      valueFormatter: (value) => value ? format(new Date(value), 'dd/MM/yyyy', { locale: ptBR }) : '',
    },
    {
      field: 'favorecido_nome',
      headerName: t('lancamentos.favorecido'),
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'categoria_nome',
      headerName: t('lancamentos.categoria'),
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'IndMov',
      headerName: t('lancamentos.tipo'),
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value === 'E' ? t('lancamentos.entrada') : t('lancamentos.saida')}
          color={params.value === 'E' ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'Valor',
      headerName: t('lancamentos.valor'),
      width: 120,
      valueFormatter: (value) => value ? `R$ ${value.toFixed(2)}`.replace('.', ',') : 'R$ 0,00',
    },
    {
      field: 'FlgConfirmacao',
      headerName: t('lancamentos.status'),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? t('lancamentos.confirmado') : t('lancamentos.pendente')}
          color={params.value ? 'success' : 'warning'}
          size="small"
        />
      ),
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
              onClick={() => onEdit(params.row as LancamentoResponse)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.FlgConfirmacao ? t('lancamentos.cancel_confirmation') : t('lancamentos.confirm')}>
            <IconButton
              size="small"
              onClick={() => handleConfirm(params.row.CodLancamento, !params.row.FlgConfirmacao)}
            >
              {params.row.FlgConfirmacao ? (
                <CloseIcon fontSize="small" />
              ) : (
                <CheckIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title={t('actions.delete')}>
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.CodLancamento)}
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
          label={t('lancamentos.favorecido')}
          value={localFilters.cod_favorecido || ''}
          onChange={(e) => handleFilterChange('cod_favorecido', e.target.value ? parseInt(e.target.value) : undefined)}
          type="number"
          size="small"
        />
        
        <TextField
          label={t('lancamentos.categoria')}
          value={localFilters.cod_categoria || ''}
          onChange={(e) => handleFilterChange('cod_categoria', e.target.value ? parseInt(e.target.value) : undefined)}
          type="number"
          size="small"
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t('lancamentos.tipo')}</InputLabel>
          <Select
            value={localFilters.ind_mov || ''}
            label={t('lancamentos.tipo')}
            onChange={(e) => handleFilterChange('ind_mov', e.target.value || undefined)}
          >
            <MenuItem value="E">{t('lancamentos.entrada')}</MenuItem>
            <MenuItem value="S">{t('lancamentos.saida')}</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t('lancamentos.status')}</InputLabel>
          <Select
            value={localFilters.confirmado !== undefined ? (localFilters.confirmado ? '1' : '0') : ''}
            label={t('lancamentos.status')}
            onChange={(e) => handleFilterChange('confirmado', e.target.value === '1' ? true : (e.target.value === '0' ? false : undefined))}
          >
            <MenuItem value="1">{t('lancamentos.confirmado')}</MenuItem>
            <MenuItem value="0">{t('lancamentos.pendente')}</MenuItem>
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
            {t('lancamentos.novo')}
          </Button>
        </Box>
      </Box>

      {/* Data Grid */}
      <DataGrid
        rows={lancamentos}
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
        getRowId={(row) => row.CodLancamento}
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