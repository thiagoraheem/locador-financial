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
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchClientes,
  deleteCliente,
  setFilters,
  setPagination,
} from '../../store/slices/clientesSlice';
import { ClienteResponse } from '../../services/clientesApi';

interface ClientesTableProps {
  onEdit: (cliente: ClienteResponse) => void;
  onCreate: () => void;
}

export const ClientesTable: React.FC<ClientesTableProps> = ({ onEdit, onCreate }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    clientes,
    loading,
    error,
    filters,
    pagination,
    totalCount,
  } = useAppSelector((state) => state.clientes);

  const [localFilters, setLocalFilters] = useState(filters);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: pagination.skip / pagination.limit,
    pageSize: pagination.limit,
  });

  // Load data on component mount and when filters/pagination change
  useEffect(() => {
    dispatch(fetchClientes({
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
      dispatch(deleteCliente(id));
    }
  };

  // Columns definition
  const columns: GridColDef[] = [
    {
      field: 'DesCliente',
      headerName: t('clientes.nome'),
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'FlgTipoPessoa',
      headerName: t('clientes.tipo_pessoa'),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 'F' ? t('clientes.tipo_pessoa_f') : t('clientes.tipo_pessoa_j')}
          color={params.value === 'F' ? 'primary' : 'secondary'}
          size="small"
        />
      ),
    },
    {
      field: 'CPF',
      headerName: t('clientes.cpf'),
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'CNPJ',
      headerName: t('clientes.cnpj'),
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'Telefone1',
      headerName: t('clientes.telefone1'),
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'Email1',
      headerName: t('clientes.email1'),
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'FlgAtivo',
      headerName: t('categorias.ativo'),
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value === 'S' ? t('categorias.ativo') : t('categorias.inativo')}
          color={params.value === 'S' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: t('actions.actions'),
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('actions.edit')}>
            <IconButton
              size="small"
              onClick={() => onEdit(params.row as ClienteResponse)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('actions.delete')}>
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.CodCliente)}
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
          label={t('clientes.nome')}
          value={localFilters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
          size="small"
        />
        
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
            {t('clientes.novo')}
          </Button>
        </Box>
      </Box>

      {/* Data Grid */}
      <DataGrid
        rows={clientes}
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
        getRowId={(row) => row.CodCliente}
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